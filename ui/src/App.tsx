import { useEffect, useMemo, useState } from 'react'

// Lightweight, dependency-free replacements for the SDK's notify/events hooks.
// We avoid importing them from @kirocrew/app-sdk because a host build that does
// not export a given name makes the whole app module fail to load.
function useNotify() {
  return (opts: { title: string; body?: string }) => {
    // Best-effort toast via a window event the host may pick up; harmless if not.
    try {
      window.dispatchEvent(new CustomEvent('mc:notify', { detail: opts }))
    } catch {
      /* ignore */
    }
    // Always leave a console trace so nothing is silently lost.
    // eslint-disable-next-line no-console
    console.info('[pr-standard-reviewer]', opts.title, opts.body || '')
  }
}

function useAppEvents(_event: string, _cb: (payload: any) => void) {
  // No-op: the app already polls /runs while a review is active.
}
import {
  Badge,
  Btn,
  Card,
  EmptyState,
  Input,
  PageHeader,
  SegmentedControl,
  StatCard,
} from './ui-kit'
import {
  CheckSquare,
  GitPullRequest,
  Loader2,
  Plus,
  RefreshCw,
  Square,
  Trash2,
  XCircle,
} from './icons'
import {
  useReviewerApi,
  type AppConfig,
  type GhAuth,
  type Pr,
  type Repo,
  type Run,
} from './api'
import FindingsView from './FindingsView'
import DocsManager from './DocsManager'
import SettingsView from './SettingsView'
import ReviewProgress from './ReviewProgress'

type Tab = 'review' | 'runs' | 'knowledge' | 'skills' | 'settings'

const ACTIVE = new Set<Run['status']>(['queued', 'running'])

// Pipeline stages shown during a review, in order.
type Stage = 'queued' | 'fetching' | 'reviewing' | 'parsing' | 'posting' | 'done'
const STAGE_ORDER: Stage[] = ['queued', 'fetching', 'reviewing', 'parsing', 'posting', 'done']
const STAGE_LABEL: Record<Stage, string> = {
  queued: 'Queued',
  fetching: 'Fetching PR diff',
  reviewing: 'Reviewing against standards',
  parsing: 'Parsing findings',
  posting: 'Posting comment to PR',
  done: 'Done',
}

function fmtElapsed(sec?: number) {
  if (sec == null) return ''
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function App() {
  const api = useReviewerApi()
  const notify = useNotify()

  const [tab, setTab] = useState<Tab>('review')
  const [auth, setAuth] = useState<GhAuth | null>(null)
  const [config, setConfig] = useState<AppConfig>({ repos: [] })
  const [repo, setRepo] = useState<string>('')
  const [newRepo, setNewRepo] = useState('')
  const [availableRepos, setAvailableRepos] = useState<Repo[]>([])
  const [loadingAvail, setLoadingAvail] = useState(false)
  const [prs, setPrs] = useState<Pr[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [runs, setRuns] = useState<Run[]>([])
  const [activeRunId, setActiveRunId] = useState<string | null>(null)
  const [loadingPrs, setLoadingPrs] = useState(false)
  const [postComment, setPostComment] = useState(false)
  const [filter, setFilter] = useState('')
  const [avgDuration, setAvgDuration] = useState<number | null>(null)
  // Client-side live progress per run: which stage + how much text streamed.
  const [live, setLive] = useState<Record<string, { stage: Stage; chars: number }>>({})

  const setStage = (id: string, stage: Stage, chars?: number) =>
    setLive((prev) => ({
      ...prev,
      [id]: { stage, chars: chars ?? prev[id]?.chars ?? 0 },
    }))

  // --- initial load -------------------------------------------------------
  const loadStatus = () =>
    api
      .status()
      .then((s) => {
        setAuth(s.auth)
        setConfig(s.config)
        if (!repo && s.config.repos.length) setRepo(s.config.repos[0])
        setPostComment(!!s.config.autoPostComment)
      })
      .catch(() => {})

  useEffect(() => {
    loadStatus()
  }, [])

  // --- poll runs while any are active ------------------------------------
  const hasActive = useMemo(() => runs.some((r) => ACTIVE.has(r.status)), [runs])
  useEffect(() => {
    let timer: any
    const tick = () =>
      api
        .listRuns()
        .then((r) => {
          setRuns(r.runs)
          if (r.avgDurationSec != null) setAvgDuration(r.avgDurationSec)
        })
        .catch(() => {})
    tick()
    if (hasActive) {
      timer = setInterval(tick, 2000)
    }
    return () => timer && clearInterval(timer)
  }, [hasActive])

  // notify when a review lands
  useAppEvents('notification', () => {
    api.listRuns().then((r) => setRuns(r.runs)).catch(() => {})
  })

  // --- repos & prs --------------------------------------------------------
  const loadPrs = async (r: string) => {
    if (!r) return
    setLoadingPrs(true)
    setSelected(new Set())
    try {
      const res = await api.listPrs(r)
      setPrs(res.prs)
    } catch (e: any) {
      notify?.({ title: 'Failed to load PRs', body: String(e?.message || e) })
      setPrs([])
    } finally {
      setLoadingPrs(false)
    }
  }

  useEffect(() => {
    if (repo) loadPrs(repo)
  }, [repo])

  // Load the GitHub repos the user can access, so they can add one without
  // typing owner/repo by hand.
  const loadAvailable = () => {
    setLoadingAvail(true)
    api
      .listRepos()
      .then((r) => setAvailableRepos(r.repos))
      .catch(() => {})
      .finally(() => setLoadingAvail(false))
  }
  useEffect(() => {
    loadAvailable()
  }, [])

  const addRepoByName = async (name: string) => {
    const full = name.trim()
    if (!full) return
    try {
      const res = await api.addRepo(full)
      setConfig(res.config)
      setNewRepo('')
      setRepo(full)
    } catch (e: any) {
      notify?.({ title: 'Could not add repo', body: String(e?.message || e) })
    }
  }

  const addRepo = () => addRepoByName(newRepo)

  const removeRepo = async (name: string) => {
    const res = await api.removeRepo(name)
    setConfig(res.config)
    if (repo === name) setRepo(res.config.repos[0] || '')
  }

  const toggle = (n: number) => {
    const next = new Set(selected)
    next.has(n) ? next.delete(n) : next.add(n)
    setSelected(next)
  }

  const toggleAll = () => {
    if (selected.size === filteredPrs.length) setSelected(new Set())
    else setSelected(new Set(filteredPrs.map((p) => p.number)))
  }

  const refreshRuns = () => api.listRuns().then((r) => setRuns(r.runs)).catch(() => {})

  // Drive one run end to end: prepare -> run agent via gateway -> submit result.
  // Stages are tracked client-side so the UI can show live progress.
  const driveRun = async (id: string) => {
    try {
      setStage(id, 'fetching')
      const prep = await api.prepareRun(id)
      if (prep.cancelled || !prep.prompt) {
        await refreshRuns()
        return
      }
      setStage(id, 'reviewing', 0)
      const raw = await api.runAgent(prep.prompt, prep.agent || 'pr-reviewer', (chars) =>
        setStage(id, 'reviewing', chars)
      )
      setStage(id, 'parsing')
      let result
      try {
        result = api.parseFindings(raw)
      } catch (e: any) {
        await api.failRun(id, `Could not parse agent output: ${e?.message || e}`)
        await refreshRuns()
        return
      }
      // If this run posts a comment, show that stage before submitting.
      const willPost = postComment || !!config.autoPostComment
      if (willPost) setStage(id, 'posting')
      await api.submitResult(id, result)
      setStage(id, 'done')
      await refreshRuns()
      notify?.({ title: 'Review finished', body: `${result.findings?.length ?? 0} findings` })
    } catch (e: any) {
      try {
        await api.failRun(id, String(e?.message || e))
      } catch {
        /* ignore */
      }
      await refreshRuns()
    }
  }

  const startReview = async () => {
    if (!repo || selected.size === 0) return
    try {
      const res = await api.startReview(repo, Array.from(selected), postComment)
      setRuns((prev) => [...res.runs, ...prev])
      setSelected(new Set())
      setTab('runs')
      setActiveRunId(res.runs[0]?.id ?? null)
      // Run the agent for each queued PR sequentially (one review at a time).
      for (const run of res.runs) {
        await driveRun(run.id)
      }
    } catch (e: any) {
      notify?.({ title: 'Could not start review', body: String(e?.message || e) })
    }
  }

  const cancelRun = async (id: string) => {
    await api.cancelRun(id)
    api.listRuns().then((r) => setRuns(r.runs)).catch(() => {})
  }

  const postRunComment = async (id: string) => {
    try {
      await api.postComment(id)
      notify?.({ title: 'Comment posted to the pull request' })
      api.listRuns().then((r) => setRuns(r.runs)).catch(() => {})
    } catch (e: any) {
      notify?.({ title: 'Could not post comment', body: String(e?.message || e) })
    }
  }

  const filteredPrs = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return prs
    return prs.filter(
      (p) => p.title.toLowerCase().includes(q) || String(p.number).includes(q)
    )
  }, [prs, filter])

  const activeRun = runs.find((r) => r.id === activeRunId) || null

  // --- render -------------------------------------------------------------
  return (
    <>
      <PageHeader title="PR Standard Reviewer" subtitle="Review pull requests against your standards" />
      <div style={{ padding: '0 24px 32px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {auth && !auth.authenticated && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#eab308' }}>
              <XCircle size={16} /> GitHub CLI is not authenticated on the gateway host.
            </div>
            <p style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
              Run <code>gh auth login</code> on the machine running the gateway, then reload.
              {auth.error ? ` (${auth.error})` : ''}
            </p>
          </Card>
        )}

        <div style={{ margin: '12px 0' }}>
          <SegmentedControl
            value={tab}
            onChange={(v: any) => setTab(v)}
            options={[
              { value: 'review', label: 'Review' },
              { value: 'runs', label: `Reviews${runs.length ? ` (${runs.length})` : ''}` },
              { value: 'knowledge', label: 'Knowledge Base' },
              { value: 'skills', label: 'Skills' },
              { value: 'settings', label: 'Settings' },
            ]}
          />
        </div>

        {tab === 'review' && (
          <div>
            {/* Repo picker + add */}
            <Card>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.25)',
                    color: 'inherit',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {config.repos.length === 0 && <option value="">No repos added</option>}
                  {config.repos.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <Btn onClick={() => loadPrs(repo)} disabled={!repo}>
                  <RefreshCw size={14} />
                </Btn>
                {repo && (
                  <Btn onClick={() => removeRepo(repo)}>
                    <Trash2 size={14} />
                  </Btn>
                )}
              </div>
              {/* Add from the user's GitHub repos */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <select
                  value=""
                  onChange={(e) => e.target.value && addRepoByName(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.25)',
                    color: 'inherit',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <option value="">
                    {loadingAvail
                      ? 'Loading your GitHub repos…'
                      : availableRepos.length
                      ? '+ Add from your GitHub repos…'
                      : 'No GitHub repos found (check gh auth)'}
                  </option>
                  {availableRepos
                    .filter((r) => !config.repos.includes(r.fullName))
                    .map((r) => (
                      <option key={r.fullName} value={r.fullName}>
                        {r.fullName}
                        {r.private ? ' (private)' : ''}
                      </option>
                    ))}
                </select>
                <Btn onClick={loadAvailable} disabled={loadingAvail}>
                  <RefreshCw size={14} />
                </Btn>
              </div>

              {/* Or add by typing owner/repo */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Input
                  value={newRepo}
                  placeholder="or type owner/repo…"
                  onChange={(e: any) => setNewRepo(e.target.value)}
                  onKeyDown={(e: any) => e.key === 'Enter' && addRepo()}
                  style={{ flex: 1 }}
                />
                <Btn onClick={addRepo} disabled={!newRepo.trim()}>
                  <Plus size={14} /> Add repo
                </Btn>
              </div>
            </Card>

            {/* PR list with multi-select */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <Input
                  value={filter}
                  placeholder="Filter pull requests"
                  onChange={(e: any) => setFilter(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Btn onClick={toggleAll} disabled={!filteredPrs.length}>
                  {selected.size === filteredPrs.length && filteredPrs.length > 0
                    ? 'Clear'
                    : 'Select all'}
                </Btn>
              </div>

              {loadingPrs ? (
                <EmptyState title="Loading pull requests…" />
              ) : filteredPrs.length === 0 ? (
                <EmptyState title="No open pull requests">
                  {repo ? 'This repo has no open PRs.' : 'Add and select a repo first.'}
                </EmptyState>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {filteredPrs.map((p) => {
                    const on = selected.has(p.number)
                    return (
                      <Card key={p.number}>
                        <div
                          style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}
                          onClick={() => toggle(p.number)}
                        >
                          {on ? <CheckSquare size={18} color="#7c5cf6" /> : <Square size={18} opacity={0.5} />}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>
                              <span style={{ opacity: 0.6 }}>#{p.number}</span> {p.title}
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>
                              {p.author ? `by ${p.author} · ` : ''}
                              {p.changedFiles ?? '?'} files
                              {p.additions != null ? ` · +${p.additions}/-${p.deletions}` : ''}
                              {p.draft ? ' · draft' : ''}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Action bar */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                marginTop: 14,
                position: 'sticky',
                bottom: 0,
                padding: '10px 0',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={postComment}
                  onChange={(e) => setPostComment(e.target.checked)}
                />
                Post results as a PR comment
              </label>
              <div style={{ flex: 1 }} />
              <Btn onClick={startReview} disabled={!repo || selected.size === 0} accent>
                <GitPullRequest size={15} /> Review {selected.size || ''} selected
              </Btn>
            </div>
          </div>
        )}

        {tab === 'runs' && (
          <div style={{ display: 'flex', gap: 14 }}>
            {/* Runs list */}
            <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {runs.length === 0 ? (
                <EmptyState title="No reviews yet">Start a review from the Review tab.</EmptyState>
              ) : (
                runs.map((r) => (
                  <Card key={r.id}>
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveRunId(r.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          {r.repo}#{r.number}
                        </span>
                        <div style={{ marginLeft: 'auto' }}>
                          <StatusBadge run={r} />
                        </div>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                        {r.title || '…'}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.55, marginTop: 4 }}>
                        {ACTIVE.has(r.status) && r.startedAt ? `${fmtElapsed(r.elapsed)} elapsed` : ''}
                        {r.status === 'done' && r.findingsCount != null
                          ? `${r.findingsCount} findings`
                          : ''}
                      </div>
                      {ACTIVE.has(r.status) && (
                        <Btn onClick={(e: any) => { e.stopPropagation(); cancelRun(r.id) }}>
                          Cancel
                        </Btn>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Active run detail */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {!activeRun ? (
                <EmptyState title="Select a review">Pick a review on the left to see findings.</EmptyState>
              ) : ACTIVE.has(activeRun.status) ? (
                <ReviewProgress
                  run={activeRun}
                  stage={live[activeRun.id]?.stage ?? (activeRun.status === 'queued' ? 'queued' : 'reviewing')}
                  chars={live[activeRun.id]?.chars ?? 0}
                  avgDuration={avgDuration}
                  onCancel={() => cancelRun(activeRun.id)}
                />
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                    {activeRun.prUrl && (
                      <a href={activeRun.prUrl} target="_blank" rel="noreferrer">
                        <Badge>Open PR</Badge>
                      </a>
                    )}
                    {activeRun.status === 'done' && (
                      <Btn
                        onClick={() => postRunComment(activeRun.id)}
                        disabled={!!activeRun.commentPosted}
                      >
                        {activeRun.commentPosted ? 'Comment posted' : 'Post comment to PR'}
                      </Btn>
                    )}
                  </div>
                  <FindingsView run={activeRun} />
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'knowledge' && (
          <DocsManager
            title="Knowledge Base"
            description="The standards the reviewer enforces. Upload or edit your coding-standard documents."
            list={() => api.listKnowledge().then((r) => r.docs)}
            read={(n) => api.readKnowledge(n).then((r) => r.content)}
            save={(n, c) => api.saveKnowledge(n, c).then(() => {})}
            remove={(n) => api.deleteKnowledge(n).then(() => {})}
          />
        )}

        {tab === 'skills' && (
          <DocsManager
            title="Review Skills"
            description="How the reviewer should review — the method, separate from the standards."
            list={() => api.listSkills().then((r) => r.skills)}
            read={(n) => api.readSkill(n).then((r) => r.content)}
            save={(n, c) => api.saveSkill(n, c).then(() => {})}
            remove={(n) => api.deleteSkill(n).then(() => {})}
          />
        )}

        {tab === 'settings' && (
          <SettingsView
            config={config}
            onSaved={(c) => {
              setConfig(c)
              setPostComment(!!c.autoPostComment)
            }}
          />
        )}
      </div>
      <style>{`.spin{animation:prspin 1s linear infinite}@keyframes prspin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}

function StatusBadge({ run }: { run: Run }) {
  const map: Record<Run['status'], { label: string; color: string }> = {
    queued: { label: 'Queued', color: '#64748b' },
    running: { label: 'Running', color: '#7c5cf6' },
    done: { label: 'Done', color: '#22c55e' },
    error: { label: 'Error', color: '#ef4444' },
    cancelled: { label: 'Cancelled', color: '#64748b' },
  }
  const m = map[run.status]
  return (
    <span
      style={{
        background: m.color,
        color: '#0b0b12',
        borderRadius: 6,
        padding: '1px 7px',
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {m.label}
    </span>
  )
}
