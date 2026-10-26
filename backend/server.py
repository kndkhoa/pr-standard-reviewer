#!/usr/bin/env python3
"""PR Standard Reviewer - app backend.

A dependency-free (stdlib-only) HTTP backend for the Kiro Crew app
"pr-standard-reviewer". It is spawned by the gateway as a child process and
reverse-proxied at /apps/pr-standard-reviewer/api/*.

Responsibilities:
  - Repos & PRs via the authenticated `gh` CLI on the gateway host.
  - A user-managed knowledge base (standards docs) and review skills stored
    under the app data dir.
  - A review job queue with live progress (queued/running/done/error, elapsed,
    cancel), producing structured findings (priority, doc reference, fix guide).
  - Posting a review summary back to the pull request as a comment.

The LLM review itself is delegated to the gateway agent through the local
loopback API using the per-app secret. If that call is unavailable the review
is marked errored with a clear message rather than crashing.
"""

import json
import os
import re
import subprocess
import threading
import time
import uuid
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# --------------------------------------------------------------------------- #
# Paths & environment
# --------------------------------------------------------------------------- #

APP_NAME = "pr-standard-reviewer"

# The gateway sets these for a spawned backend. Fall back to sensible defaults
# so the file is also runnable in isolation for local testing.
PORT = int(os.environ.get("KIROCREW_APP_PORT") or os.environ.get("PORT") or "0")
DATA_DIR = os.environ.get("KIROCREW_APP_DATA_DIR") or os.path.join(
    os.path.expanduser("~"), ".kiro", "crew", "apps", APP_NAME, "data"
)
GATEWAY_PORT = os.environ.get("KIROCREW_PORT") or "5476"
GATEWAY_BASE = f"http://127.0.0.1:{GATEWAY_PORT}"

KB_DIR = os.path.join(DATA_DIR, "knowledge")       # standards documents (.md)
SKILLS_DIR = os.path.join(DATA_DIR, "skills")      # review skills (.md)
RUNS_DIR = os.path.join(DATA_DIR, "runs")          # review run records (.json)
CONFIG_PATH = os.path.join(DATA_DIR, "config.json")

for d in (DATA_DIR, KB_DIR, SKILLS_DIR, RUNS_DIR):
    os.makedirs(d, exist_ok=True)

_SEED_DOC_NAME = "example-standard.md"
_SEED_DOC = """# Example Coding Standard

This is a starter standard so the reviewer has something to enforce. Replace or
delete it, and upload your own standards under the Knowledge Base tab. Use clear
numbered sections so findings can reference an exact rule (e.g. "§ 2.1").

## 1. Security
1.1 Never log secrets, tokens, or passwords.
1.2 Validate and sanitize all external input before use.
1.3 Use parameterized queries; never build SQL by string concatenation.

## 2. Error handling
2.1 Do not swallow exceptions silently; log with context or re-raise.
2.2 Fail closed: on an auth or permission error, deny rather than allow.

## 3. Testing
3.1 New behavior ships with tests covering the happy path and one failure path.

## 4. Readability
4.1 Prefer clear names over comments that explain unclear names.
"""


def _seed_defaults_once():
    """On a fresh install, drop one example standard so reviews are not empty."""
    try:
        if not any(
            fn.lower().endswith((".md", ".txt", ".markdown"))
            for fn in os.listdir(KB_DIR)
        ):
            with open(os.path.join(KB_DIR, _SEED_DOC_NAME), "w", encoding="utf-8") as fh:
                fh.write(_SEED_DOC)
    except OSError:
        pass


_seed_defaults_once()

_SAFE_NAME = re.compile(r"[^A-Za-z0-9._-]")


def _safe_filename(name: str, default_ext: str = ".md") -> str:
    """Sanitise a user-supplied document/skill name into a safe filename."""
    name = (name or "").strip() or "untitled"
    name = _SAFE_NAME.sub("-", name)
    if not name.lower().endswith((".md", ".txt", ".markdown")):
        name += default_ext
    return name


# --------------------------------------------------------------------------- #
# Small JSON persistence helpers
# --------------------------------------------------------------------------- #

_lock = threading.Lock()


def _read_json(path, default):
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return default


def _write_json(path, value):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(value, fh, indent=2, ensure_ascii=False)
    os.replace(tmp, path)


_CONFIG_DEFAULTS = {
    "repos": [],
    "autoPostComment": False,
    "systemPrompt": "",
    "githubToken": "",  # GitHub PAT; stored server-side, never returned to UI
}


def load_config():
    cfg = _read_json(CONFIG_PATH, {})
    merged = dict(_CONFIG_DEFAULTS)
    merged.update(cfg or {})
    return merged


def save_config(cfg):
    _write_json(CONFIG_PATH, cfg)


def public_config(cfg=None):
    """Config safe to send to the UI: the PAT is replaced by a boolean flag."""
    cfg = cfg or load_config()
    out = dict(cfg)
    out["hasGithubToken"] = bool(out.get("githubToken"))
    out.pop("githubToken", None)
    return out


def gh_env():
    """Environment for gh: inject the user's PAT when configured so gh acts as
    that token's account, else fall back to the host's gh auth."""
    env = dict(os.environ)
    token = (load_config().get("githubToken") or "").strip()
    if token:
        env["GH_TOKEN"] = token
        env["GITHUB_TOKEN"] = token
    return env


# --------------------------------------------------------------------------- #
# gh CLI helpers
# --------------------------------------------------------------------------- #


class GhError(Exception):
    def __init__(self, message, stderr=""):
        super().__init__(message)
        self.stderr = stderr


def gh(args, timeout=60, check=True):
    """Run a `gh` command and return (stdout, stderr, returncode)."""
    try:
        proc = subprocess.run(
            ["gh", *args],
            capture_output=True,
            text=True,
            timeout=timeout,
            env=gh_env(),
        )
    except FileNotFoundError:
        raise GhError("The GitHub CLI (gh) is not installed on the gateway host.")
    except subprocess.TimeoutExpired:
        raise GhError(f"gh timed out after {timeout}s: gh {' '.join(args)}")
    if check and proc.returncode != 0:
        raise GhError(
            f"gh {' '.join(args)} failed (exit {proc.returncode})",
            stderr=proc.stderr.strip(),
        )
    return proc.stdout, proc.stderr, proc.returncode


def gh_json(args, timeout=60):
    out, _, _ = gh(args, timeout=timeout)
    return json.loads(out) if out.strip() else None


def gh_auth_status():
    """Return {authenticated: bool, user: str|None, error: str|None}."""
    try:
        out, _, _ = gh(["api", "user", "--jq", ".login"], timeout=20)
        return {"authenticated": True, "user": out.strip(), "error": None}
    except GhError as exc:
        return {"authenticated": False, "user": None, "error": exc.stderr or str(exc)}


def list_user_repos(limit=100):
    """Repos the authenticated user can access."""
    data = gh_json(
        [
            "repo", "list",
            "--limit", str(limit),
            "--json", "nameWithOwner,description,isPrivate,updatedAt",
        ],
        timeout=40,
    ) or []
    return [
        {
            "fullName": r.get("nameWithOwner"),
            "description": r.get("description") or "",
            "private": bool(r.get("isPrivate")),
            "updatedAt": r.get("updatedAt"),
        }
        for r in data
    ]


def list_open_prs(repo):
    data = gh_json(
        [
            "pr", "list",
            "--repo", repo,
            "--state", "open",
            "--limit", "100",
            "--json", "number,title,author,updatedAt,headRefName,isDraft,additions,deletions,changedFiles",
        ],
        timeout=40,
    ) or []
    out = []
    for p in data:
        out.append(
            {
                "number": p.get("number"),
                "title": p.get("title"),
                "author": (p.get("author") or {}).get("login"),
                "updatedAt": p.get("updatedAt"),
                "head": p.get("headRefName"),
                "draft": bool(p.get("isDraft")),
                "additions": p.get("additions"),
                "deletions": p.get("deletions"),
                "changedFiles": p.get("changedFiles"),
            }
        )
    return out


def get_pr_detail(repo, number):
    meta = gh_json(
        [
            "pr", "view", str(number),
            "--repo", repo,
            "--json", "number,title,body,author,headRefName,baseRefName,additions,deletions,changedFiles,url",
        ],
        timeout=40,
    ) or {}
    diff, _, _ = gh(["pr", "diff", str(number), "--repo", repo], timeout=90)
    return meta, diff


def post_pr_comment(repo, number, body):
    gh(["pr", "comment", str(number), "--repo", repo, "--body", body], timeout=60)


# --------------------------------------------------------------------------- #
# Knowledge base & skills (user-managed files)
# --------------------------------------------------------------------------- #


def _list_docs(folder):
    items = []
    for fn in sorted(os.listdir(folder)):
        full = os.path.join(folder, fn)
        if not os.path.isfile(full):
            continue
        try:
            size = os.path.getsize(full)
            mtime = os.path.getmtime(full)
        except OSError:
            continue
        items.append({"name": fn, "size": size, "updatedAt": int(mtime)})
    return items


def _read_doc(folder, name):
    name = _safe_filename(name)
    full = os.path.join(folder, name)
    if not os.path.isfile(full):
        return None
    with open(full, "r", encoding="utf-8", errors="replace") as fh:
        return fh.read()


def _write_doc(folder, name, content):
    name = _safe_filename(name)
    full = os.path.join(folder, name)
    with open(full, "w", encoding="utf-8") as fh:
        fh.write(content or "")
    return name


def _delete_doc(folder, name):
    name = _safe_filename(name)
    full = os.path.join(folder, name)
    if os.path.isfile(full):
        os.remove(full)
        return True
    return False


def load_knowledge_base():
    """Concatenate every standards doc with a stable heading so findings can
    reference a specific document + section."""
    chunks = []
    for item in _list_docs(KB_DIR):
        text = _read_doc(KB_DIR, item["name"]) or ""
        chunks.append(f"===== DOCUMENT: {item['name']} =====\n{text}")
    return "\n\n".join(chunks)


def load_skills():
    chunks = []
    for item in _list_docs(SKILLS_DIR):
        text = _read_doc(SKILLS_DIR, item["name"]) or ""
        chunks.append(f"===== SKILL: {item['name']} =====\n{text}")
    return "\n\n".join(chunks)


# --------------------------------------------------------------------------- #
# Review engine
# --------------------------------------------------------------------------- #

# In-memory job registry. Runs are also persisted to RUNS_DIR so they survive
# a backend restart.
_jobs = {}            # run_id -> run dict


def _run_path(run_id):
    return os.path.join(RUNS_DIR, f"{run_id}.json")


def _persist_run(run):
    _write_json(_run_path(run["id"]), run)


def _load_runs():
    runs = []
    for fn in os.listdir(RUNS_DIR):
        if fn.endswith(".json"):
            r = _read_json(os.path.join(RUNS_DIR, fn), None)
            if r:
                runs.append(r)
    runs.sort(key=lambda r: r.get("createdAt", 0), reverse=True)
    return runs


FINDINGS_SCHEMA_HINT = """
Return STRICT JSON only, no prose, matching exactly:
{
  "verdict": "approve" | "request_changes" | "comment",
  "summary": "one-paragraph overall assessment",
  "standardsChecked": [
    {
      "doc": "document-file-name.md",
      "status": "violations" | "pass" | "not_applicable",
      "note": "one short line: what was checked, or why it does not apply to this diff"
    }
  ],
  "findings": [
    {
      "id": "short-slug",
      "priority": "must_fix" | "should_fix" | "nice_to_have",
      "category": "security | performance | style | correctness | testing | docs | other",
      "file": "path/to/file",
      "line": 0,
      "title": "short title",
      "detail": "what is wrong and why it matters",
      "reference": { "doc": "document-file-name.md", "section": "heading or section the rule comes from" },
      "fix": "concrete step-by-step guidance to fix it"
    }
  ]
}
Rules:
- "standardsChecked" MUST contain one entry for EVERY document listed under
  "KNOWLEDGE BASE DOCUMENTS" below, using the exact file name. This is how the
  reader sees that every standard was considered.
    - status "violations": the diff breaks this standard (there is a matching finding).
    - status "pass": this standard applies to the diff and the diff complies.
    - status "not_applicable": this standard does not apply to what the diff changes
      (e.g. a Java standard for a TypeScript-only diff). Say why in "note".
- Base EVERY finding on the knowledge base (standards docs) and skills provided.
- Always fill reference.doc and reference.section pointing at the exact standard.
- Order findings by priority: must_fix first.
- If nothing is wrong, return verdict "approve" and an empty findings array
  (but still fill standardsChecked for all documents).
"""


def _kb_doc_names():
    return [item["name"] for item in _list_docs(KB_DIR)]


def build_review_prompt(repo, pr_meta, diff, knowledge, skills, system_prompt=""):
    doc_names = _kb_doc_names()
    doc_list = "\n".join(f"- {n}" for n in doc_names) or "(none uploaded)"
    extra = f"\n## ADDITIONAL REVIEW INSTRUCTIONS\n{system_prompt}\n" if system_prompt.strip() else ""
    return f"""You are a meticulous senior code reviewer. Review the following GitHub pull request
STRICTLY against the team's coding standards and review skills below.
{extra}

## REPOSITORY
{repo}

## PULL REQUEST #{pr_meta.get('number')}: {pr_meta.get('title')}
Author: {(pr_meta.get('author') or {}).get('login')}
Base: {pr_meta.get('baseRefName')}  Head: {pr_meta.get('headRefName')}
Description:
{pr_meta.get('body') or '(no description)'}

## REVIEW SKILLS (how to review)
{skills or '(no skills uploaded - use general best practices)'}

## KNOWLEDGE BASE DOCUMENTS (you must report on EACH of these in standardsChecked)
{doc_list}

## KNOWLEDGE BASE (the full text of the standards to enforce)
{knowledge or '(no standards uploaded - findings will be generic)'}

## DIFF
```diff
{diff[:120000]}
```

{FINDINGS_SCHEMA_HINT}
"""


def _extract_json(text):
    """Pull the first JSON object out of a model response."""
    if not text:
        raise ValueError("empty response")
    text = text.strip()
    # Strip ```json fences if present.
    fence = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.DOTALL)
    if fence:
        text = fence.group(1)
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no JSON object found in response")
    return json.loads(text[start : end + 1])


def _render_comment(result, repo, number):
    """Render findings as a Markdown PR comment."""
    verdict = result.get("verdict", "comment")
    icon = {"approve": "✅", "request_changes": "🛑", "comment": "💬"}.get(verdict, "💬")
    lines = [f"## {icon} PR Standard Reviewer — {verdict.replace('_', ' ').title()}", ""]
    lines.append(result.get("summary", ""))
    lines.append("")
    buckets = {"must_fix": [], "should_fix": [], "nice_to_have": []}
    for f in result.get("findings", []):
        buckets.get(f.get("priority", "should_fix"), buckets["should_fix"]).append(f)
    labels = {
        "must_fix": "### 🔴 Must fix",
        "should_fix": "### 🟡 Should fix",
        "nice_to_have": "### 🟢 Nice to have",
    }
    for key in ("must_fix", "should_fix", "nice_to_have"):
        if not buckets[key]:
            continue
        lines.append(labels[key])
        for f in buckets[key]:
            ref = f.get("reference") or {}
            ref_txt = ""
            if ref.get("doc"):
                ref_txt = f" _(ref: {ref.get('doc')}"
                section = (ref.get("section") or "").lstrip("§# ").strip()
                if section:
                    ref_txt += f" § {section}"
                ref_txt += ")_"
            loc = f.get("file", "")
            if f.get("line"):
                loc += f":{f.get('line')}"
            lines.append(f"- **{f.get('title')}** — `{loc}`{ref_txt}")
            if f.get("detail"):
                lines.append(f"  - {f.get('detail')}")
            if f.get("fix"):
                lines.append(f"  - _Fix:_ {f.get('fix')}")
        lines.append("")
    checked = result.get("standardsChecked") or []
    if checked:
        lines.append("### 📋 Standards checked")
        sym = {"violations": "🔴", "pass": "✅", "not_applicable": "➖"}
        for c in checked:
            s = sym.get(c.get("status"), "•")
            note = f" — {c.get('note')}" if c.get("note") else ""
            lines.append(f"- {s} `{c.get('doc')}`{note}")
        lines.append("")

    lines.append("\n_Generated by PR Standard Reviewer._")
    return "\n".join(lines)


# --------------------------------------------------------------------------- #
# Review orchestration (UI-driven)
#
# The model itself is run by the dashboard UI through the gateway's /api/chat
# (the UI holds a token the gateway accepts; a sandboxed backend process does
# not). So the backend owns everything around the model call: building the
# prompt from the PR diff + knowledge base + skills, persisting run state, and
# posting the result back to GitHub. The UI calls:
#   1) enqueue_reviews  -> create runs (status "queued")
#   2) prepare_run      -> get the prompt for a run (status "running")
#   3) /api/chat        -> the UI runs the agent (not the backend)
#   4) submit_result    -> store findings (status "done") + optional comment
#      or fail_run       -> store an error (status "error")
# --------------------------------------------------------------------------- #


def enqueue_reviews(repo, numbers, post_comment=False):
    created = []
    for number in numbers:
        run_id = uuid.uuid4().hex[:12]
        run = {
            "id": run_id,
            "repo": repo,
            "number": number,
            "title": None,
            "status": "queued",
            "postComment": bool(post_comment),
            "createdAt": int(time.time()),
        }
        _jobs[run_id] = run
        _persist_run(run)
        created.append(run)
    return created


def prepare_run(run_id):
    """Build the review prompt for a run and mark it running. Returns the
    prompt (and PR metadata) for the UI to send to the agent."""
    run = get_run(run_id)
    if not run:
        raise ValueError("run not found")
    if run["status"] in ("cancelled",):
        return {"cancelled": True}

    cfg = load_config()
    pr_meta, diff = get_pr_detail(run["repo"], run["number"])
    knowledge = load_knowledge_base()
    skills = load_skills()
    prompt = build_review_prompt(
        run["repo"], pr_meta, diff, knowledge, skills, cfg.get("systemPrompt") or ""
    )

    run["title"] = pr_meta.get("title") or run.get("title")
    run["prUrl"] = pr_meta.get("url")
    run["status"] = "running"
    run["startedAt"] = run.get("startedAt") or int(time.time())
    _jobs[run_id] = run
    _persist_run(run)
    return {"prompt": prompt, "agent": "pr-reviewer", "run": run}


def submit_result(run_id, raw_or_obj):
    """Store the agent's findings for a run. Accepts either a parsed object or
    the raw model text (from which the JSON is extracted)."""
    run = get_run(run_id)
    if not run:
        raise ValueError("run not found")

    if isinstance(raw_or_obj, str):
        result = _extract_json(raw_or_obj)
    else:
        result = raw_or_obj

    run["result"] = result
    run["findingsCount"] = len(result.get("findings", []))
    run["verdict"] = result.get("verdict")
    run["status"] = "done"
    run["finishedAt"] = int(time.time())
    _jobs[run_id] = run
    _persist_run(run)

    cfg = load_config()
    if run.get("postComment") or cfg.get("autoPostComment"):
        try:
            post_pr_comment(
                run["repo"], run["number"], _render_comment(result, run["repo"], run["number"])
            )
            run["commentPosted"] = True
        except GhError as exc:
            run["commentError"] = exc.stderr or str(exc)
        _persist_run(run)
    return run


def fail_run(run_id, error):
    run = get_run(run_id)
    if not run:
        raise ValueError("run not found")
    run["status"] = "error"
    run["error"] = str(error)
    run["finishedAt"] = int(time.time())
    _jobs[run_id] = run
    _persist_run(run)
    return run


def cancel_run(run_id):
    """Cancel a queued or running review. A running review the UI already sent
    to the agent will still complete when the UI submits its result."""
    run = get_run(run_id)
    if run and run["status"] in ("queued", "running"):
        run["status"] = "cancelled"
        run["finishedAt"] = int(time.time())
        _jobs[run_id] = run
        _persist_run(run)
    return True


def list_runs():
    # Merge in-memory (authoritative for live status) with persisted history.
    merged = {}
    for r in _load_runs():
        merged[r["id"]] = r
    for rid, r in _jobs.items():
        merged[rid] = r
    runs = list(merged.values())
    for r in runs:
        started = r.get("startedAt")
        finished = r.get("finishedAt")
        if started:
            end = finished or int(time.time())
            r["elapsed"] = max(0, end - started)
    runs.sort(key=lambda r: r.get("createdAt", 0), reverse=True)
    return runs


def get_run(run_id):
    run = _jobs.get(run_id)
    if not run:
        run = _read_json(_run_path(run_id), None)
    if run:
        started = run.get("startedAt")
        if started:
            end = run.get("finishedAt") or int(time.time())
            run["elapsed"] = max(0, end - started)
    return run


def avg_duration_sec():
    """Average wall-clock duration of completed reviews, for a UI ETA. Returns
    None until there is at least one finished run to learn from."""
    durations = []
    for r in list_runs():
        if r.get("status") == "done" and r.get("startedAt") and r.get("finishedAt"):
            d = r["finishedAt"] - r["startedAt"]
            if d > 0:
                durations.append(d)
    if not durations:
        return None
    # Use the most recent few for a responsive estimate.
    recent = durations[:8]
    return int(sum(recent) / len(recent))


# --------------------------------------------------------------------------- #
# HTTP layer
# --------------------------------------------------------------------------- #


class Handler(BaseHTTPRequestHandler):
    server_version = "PRStandardReviewer/0.1"

    # Silence default logging to the gateway stderr for every request.
    def log_message(self, *args):  # noqa: D401
        pass

    # -- helpers ----------------------------------------------------------- #

    def _send(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _body_json(self):
        length = int(self.headers.get("Content-Length") or 0)
        if not length:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except ValueError:
            return {}

    def _path(self):
        # Normalise the path the gateway reverse proxy forwards. Depending on
        # the gateway version the backend may receive any of:
        #   /apps/<name>/api/health   (full external path)
        #   /api/apps/<name>/health   (alt external path)
        #   /api/health               (proxy strips the app prefix, keeps /api)
        #   /health                   (proxy strips everything)
        # Strip whichever known prefix is present so routing sees "/health".
        p = self.path.split("?", 1)[0]
        for prefix in (
            f"/apps/{APP_NAME}/api",
            f"/api/apps/{APP_NAME}",
            f"/apps/{APP_NAME}",
            "/api",
        ):
            if p == prefix:
                return "/"
            if p.startswith(prefix + "/"):
                return p[len(prefix):]
        return p

    def _query(self):
        if "?" not in self.path:
            return {}
        from urllib.parse import parse_qs
        return {k: v[0] for k, v in parse_qs(self.path.split("?", 1)[1]).items()}

    # -- routing ----------------------------------------------------------- #

    def do_GET(self):
        p = self._path()
        q = self._query()
        try:
            if p == "/health":
                return self._send(200, {"ok": True})
            if p == "/status":
                return self._send(200, {
                    "auth": gh_auth_status(),
                    "config": public_config(),
                })

            if p == "/repos":
                return self._send(200, {"repos": list_user_repos()})
            if p == "/prs":
                repo = q.get("repo")
                if not repo:
                    return self._send(400, {"error": "repo query param required"})
                return self._send(200, {"prs": list_open_prs(repo)})
            if p == "/runs":
                return self._send(200, {"runs": list_runs(), "avgDurationSec": avg_duration_sec()})
            if p.startswith("/runs/"):
                run = get_run(p.split("/runs/", 1)[1])
                if not run:
                    return self._send(404, {"error": "run not found"})
                return self._send(200, {"run": run})
            if p == "/knowledge":
                return self._send(200, {"docs": _list_docs(KB_DIR)})
            if p.startswith("/knowledge/"):
                content = _read_doc(KB_DIR, p.split("/knowledge/", 1)[1])
                if content is None:
                    return self._send(404, {"error": "doc not found"})
                return self._send(200, {"content": content})
            if p == "/skills":
                return self._send(200, {"skills": _list_docs(SKILLS_DIR)})
            if p.startswith("/skills/"):
                content = _read_doc(SKILLS_DIR, p.split("/skills/", 1)[1])
                if content is None:
                    return self._send(404, {"error": "skill not found"})
                return self._send(200, {"content": content})
            return self._send(404, {"error": f"unknown route {p}"})
        except GhError as exc:
            return self._send(502, {"error": str(exc), "stderr": exc.stderr})
        except Exception as exc:  # noqa: BLE001
            return self._send(500, {"error": str(exc)})

    def do_POST(self):
        p = self._path()
        body = self._body_json()
        try:
            if p == "/config":
                cfg = load_config()
                patch = dict(body or {})
                # The UI never receives the PAT, so treat an absent/empty
                # githubToken as "leave unchanged". Only an explicit non-empty
                # value updates it; a literal null clears it.
                if "githubToken" in patch:
                    if patch["githubToken"] is None:
                        cfg["githubToken"] = ""
                    elif str(patch["githubToken"]).strip() == "":
                        patch.pop("githubToken")  # don't wipe on empty string
                patch.pop("hasGithubToken", None)
                cfg.update(patch)
                save_config(cfg)
                return self._send(200, {"config": public_config(cfg)})
            if p == "/repos":
                full = (body.get("fullName") or "").strip()
                if not full:
                    return self._send(400, {"error": "fullName required"})
                # Validate the repo is reachable before adding.
                gh(["repo", "view", full, "--json", "nameWithOwner"], timeout=30)
                cfg = load_config()
                if full not in cfg["repos"]:
                    cfg["repos"].append(full)
                    save_config(cfg)
                return self._send(200, {"config": cfg})
            if p == "/review":
                repo = body.get("repo")
                numbers = body.get("numbers") or ([body["number"]] if body.get("number") else [])
                if not repo or not numbers:
                    return self._send(400, {"error": "repo and numbers required"})
                runs = enqueue_reviews(repo, numbers, post_comment=body.get("postComment", False))
                return self._send(200, {"runs": runs})
            if p.startswith("/runs/") and p.endswith("/prepare"):
                run_id = p[len("/runs/"):-len("/prepare")]
                return self._send(200, prepare_run(run_id))
            if p.startswith("/runs/") and p.endswith("/result"):
                run_id = p[len("/runs/"):-len("/result")]
                payload = body.get("result")
                if payload is None and body.get("raw") is None:
                    return self._send(400, {"error": "result or raw required"})
                run = submit_result(run_id, body.get("raw") if payload is None else payload)
                return self._send(200, {"run": run})
            if p.startswith("/runs/") and p.endswith("/fail"):
                run_id = p[len("/runs/"):-len("/fail")]
                run = fail_run(run_id, body.get("error") or "review failed")
                return self._send(200, {"run": run})
            if p.startswith("/runs/") and p.endswith("/cancel"):
                run_id = p[len("/runs/"):-len("/cancel")]
                cancel_run(run_id)
                return self._send(200, {"ok": True})
            if p.startswith("/runs/") and p.endswith("/comment"):
                run_id = p[len("/runs/"):-len("/comment")]
                run = get_run(run_id)
                if not run or not run.get("result"):
                    return self._send(400, {"error": "run has no result to post"})
                comment = _render_comment(run["result"], run["repo"], run["number"])
                post_pr_comment(run["repo"], run["number"], comment)
                run["commentPosted"] = True
                _persist_run(run)
                return self._send(200, {"ok": True})
            if p == "/knowledge":
                name = _write_doc(KB_DIR, body.get("name"), body.get("content"))
                return self._send(200, {"name": name, "docs": _list_docs(KB_DIR)})
            if p == "/skills":
                name = _write_doc(SKILLS_DIR, body.get("name"), body.get("content"))
                return self._send(200, {"name": name, "skills": _list_docs(SKILLS_DIR)})
            return self._send(404, {"error": f"unknown route {p}"})
        except GhError as exc:
            return self._send(502, {"error": str(exc), "stderr": exc.stderr})
        except Exception as exc:  # noqa: BLE001
            return self._send(500, {"error": str(exc)})

    def do_DELETE(self):
        p = self._path()
        try:
            if p == "/repos":
                full = self._query().get("fullName") or self._body_json().get("fullName")
                cfg = load_config()
                cfg["repos"] = [r for r in cfg["repos"] if r != full]
                save_config(cfg)
                return self._send(200, {"config": cfg})
            if p.startswith("/knowledge/"):
                ok = _delete_doc(KB_DIR, p.split("/knowledge/", 1)[1])
                return self._send(200 if ok else 404, {"docs": _list_docs(KB_DIR)})
            if p.startswith("/skills/"):
                ok = _delete_doc(SKILLS_DIR, p.split("/skills/", 1)[1])
                return self._send(200 if ok else 404, {"skills": _list_docs(SKILLS_DIR)})
            return self._send(404, {"error": f"unknown route {p}"})
        except Exception as exc:  # noqa: BLE001
            return self._send(500, {"error": str(exc)})


def main():
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    actual_port = server.server_address[1]
    print(f"[pr-standard-reviewer] backend listening on 127.0.0.1:{actual_port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
