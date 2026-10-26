// All backend routes live under the app's reverse-proxy base (same origin as
// the dashboard). We call them with plain fetch + credentials.
const BASE = '/apps/pr-standard-reviewer/api'

export type GhAuth = { authenticated: boolean; user: string | null; error: string | null }
export type AppConfig = {
  repos: string[]
  autoPostComment?: boolean
  systemPrompt?: string
  hasGithubToken?: boolean
}

export type Repo = {
  fullName: string
  description: string
  private: boolean
  updatedAt?: string
}

export type Pr = {
  number: number
  title: string
  author?: string
  updatedAt?: string
  head?: string
  draft?: boolean
  additions?: number
  deletions?: number
  changedFiles?: number
}

export type Reference = { doc?: string; section?: string }
export type Priority = 'must_fix' | 'should_fix' | 'nice_to_have'

export type Finding = {
  id: string
  priority: Priority
  category: string
  file: string
  line?: number
  title: string
  detail: string
  reference?: Reference
  fix: string
}

export type StandardChecked = {
  doc: string
  status: 'violations' | 'pass' | 'not_applicable'
  note?: string
}

export type ReviewResult = {
  verdict: 'approve' | 'request_changes' | 'comment'
  summary: string
  standardsChecked?: StandardChecked[]
  findings: Finding[]
}

export type Run = {
  id: string
  repo: string
  number: number
  title: string | null
  status: 'queued' | 'running' | 'done' | 'error' | 'cancelled'
  createdAt: number
  startedAt?: number
  finishedAt?: number
  elapsed?: number
  findingsCount?: number
  verdict?: string
  result?: ReviewResult
  error?: string
  prUrl?: string
  postComment?: boolean
  commentPosted?: boolean
  commentError?: string
}

export type DocMeta = { name: string; size: number; updatedAt: number }

export type DocMetaList = { docs?: DocMeta[]; skills?: DocMeta[] }

// We talk to the backend and /api/chat with plain same-origin fetch rather than
// the host's useAppApi client. The dashboard page shares the gateway origin and
// its session cookie, so credentials ride along automatically — and this avoids
// depending on useAppApi method shapes that differ between gateway builds (an
// earlier version crashed on `api.raw is not a function`).
async function jget<T>(path: string): Promise<T> {
  const r = await fetch(path, { credentials: 'include' })
  if (!r.ok) throw new Error(`${r.status} ${await r.text().catch(() => '')}`)
  return r.json() as Promise<T>
}

async function jsend<T>(method: string, path: string, body?: any): Promise<T> {
  const r = await fetch(path, {
    method,
    credentials: 'include',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`${r.status} ${await r.text().catch(() => '')}`)
  // Some responses (DELETE) may be empty.
  const text = await r.text()
  return (text ? JSON.parse(text) : {}) as T
}

export function useReviewerApi() {
  return {
    status: () => jget<{ auth: GhAuth; config: AppConfig }>(`${BASE}/status`),
    saveConfig: (patch: Partial<AppConfig>) =>
      jsend<{ config: AppConfig }>('POST', `${BASE}/config`, patch),

    listRepos: () => jget<{ repos: Repo[] }>(`${BASE}/repos`),
    addRepo: (fullName: string) =>
      jsend<{ config: AppConfig }>('POST', `${BASE}/repos`, { fullName }),
    removeRepo: (fullName: string) =>
      jsend<{ config: AppConfig }>(
        'DELETE',
        `${BASE}/repos?fullName=${encodeURIComponent(fullName)}`
      ),

    listPrs: (repo: string) =>
      jget<{ prs: Pr[] }>(`${BASE}/prs?repo=${encodeURIComponent(repo)}`),

    startReview: (repo: string, numbers: number[], postComment: boolean) =>
      jsend<{ runs: Run[] }>('POST', `${BASE}/review`, { repo, numbers, postComment }),
    listRuns: () => jget<{ runs: Run[]; avgDurationSec?: number | null }>(`${BASE}/runs`),
    getRun: (id: string) => jget<{ run: Run }>(`${BASE}/runs/${id}`),
    cancelRun: (id: string) => jsend<{ ok: boolean }>('POST', `${BASE}/runs/${id}/cancel`, {}),
    postComment: (id: string) => jsend<{ ok: boolean }>('POST', `${BASE}/runs/${id}/comment`, {}),

    prepareRun: (id: string) =>
      jsend<{ prompt?: string; agent?: string; run?: Run; cancelled?: boolean }>(
        'POST',
        `${BASE}/runs/${id}/prepare`,
        {}
      ),
    submitResult: (id: string, result: ReviewResult) =>
      jsend<{ run: Run }>('POST', `${BASE}/runs/${id}/result`, { result }),
    failRun: (id: string, error: string) =>
      jsend<{ run: Run }>('POST', `${BASE}/runs/${id}/fail`, { error }),

    // Run the app's agent through the gateway chat endpoint (SSE stream) and
    // return the assistant's full text.
    runAgent: async (
      prompt: string,
      agent: string,
      onProgress?: (charCount: number) => void,
      signal?: AbortSignal
    ) => {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, agent }),
        signal,
      })
      if (!resp.ok) throw new Error(`/api/chat ${resp.status} ${await resp.text().catch(() => '')}`)
      const reader = resp.body?.getReader()
      if (!reader) throw new Error('no response stream from /api/chat')
      const decoder = new TextDecoder()
      let buffer = ''
      let assistant = ''
      let streamed = 0
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const payload = trimmed.slice(5).trim()
          if (payload === '[DONE]') return assistant
          try {
            const ev = JSON.parse(payload)
            if (ev.type === 'chunk' && typeof ev.content === 'string') {
              streamed += ev.content.length
              onProgress?.(streamed)
            }
            if (ev.type === 'assistant' && typeof ev.content === 'string') {
              assistant = ev.content
              onProgress?.(assistant.length)
            }
          } catch {
            /* ignore keepalive / non-json lines */
          }
        }
      }
      return assistant
    },

    parseFindings: (raw: string): ReviewResult => {
      let text = raw.trim()
      const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (fence) text = fence[1].trim()
      const start = text.indexOf('{')
      const end = text.lastIndexOf('}')
      if (start === -1 || end === -1) throw new Error('no JSON object in agent response')
      return JSON.parse(text.slice(start, end + 1)) as ReviewResult
    },

    listKnowledge: () => jget<{ docs: DocMeta[] }>(`${BASE}/knowledge`),
    readKnowledge: (name: string) =>
      jget<{ content: string }>(`${BASE}/knowledge/${encodeURIComponent(name)}`),
    saveKnowledge: (name: string, content: string) =>
      jsend<{ docs: DocMeta[] }>('POST', `${BASE}/knowledge`, { name, content }),
    deleteKnowledge: (name: string) =>
      jsend<{ docs: DocMeta[] }>('DELETE', `${BASE}/knowledge/${encodeURIComponent(name)}`),

    listSkills: () => jget<{ skills: DocMeta[] }>(`${BASE}/skills`),
    readSkill: (name: string) =>
      jget<{ content: string }>(`${BASE}/skills/${encodeURIComponent(name)}`),
    saveSkill: (name: string, content: string) =>
      jsend<{ skills: DocMeta[] }>('POST', `${BASE}/skills`, { name, content }),
    deleteSkill: (name: string) =>
      jsend<{ skills: DocMeta[] }>('DELETE', `${BASE}/skills/${encodeURIComponent(name)}`),
  }
}
