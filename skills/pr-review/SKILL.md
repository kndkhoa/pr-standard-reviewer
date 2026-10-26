# PR Review Skill

This skill teaches the reviewer **how** to review a pull request. It is separate
from the Knowledge Base, which holds **what** standards to enforce. Edit this
skill (or add your own under the app's Skills tab) to change the review method
without touching the standards documents.

## Review method

1. **Read the intent first.** Use the PR title and description to understand what
   the change is meant to do. A change that does not match its stated intent is a
   finding on its own.

2. **Walk the diff by blast radius, not top to bottom.** Review the files most
   likely to cause harm first: auth, data access, migrations, public APIs,
   payment/billing, and anything touching user input. Style-only files come last.

3. **Ground every finding in a standard.** For each issue, name the exact
   document and section in the Knowledge Base that it violates. Put it in
   `reference.doc` and `reference.section`. If no standard covers the issue, you
   may still raise it as `nice_to_have` / `other`, but say so plainly.

4. **Prioritize honestly.** Do not inflate severity.
   - `must_fix` — security holes, correctness bugs, data loss, breaking changes,
     removed auth checks, injection, secrets in code.
   - `should_fix` — missing tests, poor error handling, performance regressions,
     maintainability problems, violations of a required convention.
   - `nice_to_have` — naming, formatting, optional refactors, documentation
     polish.

5. **Give a fix, not just a complaint.** Every finding needs concrete guidance:
   what to change, and ideally a short code-level suggestion.

6. **Be specific about location.** Always include the file path, and the line
   number when you can tell it from the diff.

## Output discipline

- Output **strict JSON only** — no prose, no markdown code fences.
- Order findings by priority: all `must_fix`, then `should_fix`, then
  `nice_to_have`.
- Keep `title` short (a few words). Put the explanation in `detail`.
- If the change is clean, return `verdict: "approve"` with an empty `findings`
  array. A clean PR is a valid and common outcome — do not manufacture findings.

## Tone

- Be direct and respectful. Review the code, not the author.
- Prefer facts over opinions. "This violates logging-standard.md §2" beats "I
  don't like this".
