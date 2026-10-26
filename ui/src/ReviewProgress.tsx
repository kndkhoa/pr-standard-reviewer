import { Btn, Card } from './ui-kit'
import { Loader2, XCircle } from './icons'
import type { Run } from './api'

export type Stage = 'queued' | 'fetching' | 'reviewing' | 'parsing' | 'posting' | 'done'

const STAGES: { key: Stage; label: string }[] = [
  { key: 'fetching', label: 'Fetch diff' },
  { key: 'reviewing', label: 'Review' },
  { key: 'parsing', label: 'Parse' },
  { key: 'posting', label: 'Post comment' },
]

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function ReviewProgress({
  run,
  stage,
  chars,
  avgDuration,
  onCancel,
}: {
  run: Run
  stage: Stage
  chars: number
  avgDuration: number | null
  onCancel: () => void
}) {
  const elapsed = run.elapsed ?? 0
  // Progress: prefer ETA-based, fall back to stage index if no history yet.
  const stageIdx = STAGES.findIndex((s) => s.key === stage)
  const byStage = stageIdx < 0 ? 0.08 : (stageIdx + 0.5) / STAGES.length
  const byEta = avgDuration ? Math.min(0.97, elapsed / avgDuration) : null
  const pct = Math.max(byStage * 0.5, byEta ?? byStage) * 100

  const currentLabel =
    stage === 'queued'
      ? 'Queued'
      : stage === 'reviewing'
      ? `Reviewing against standards${chars ? ` · ${chars.toLocaleString()} chars` : ''}`
      : (STAGES.find((s) => s.key === stage)?.label ?? 'Working') + '…'

  return (
    <Card>
      {/* header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>
          Reviewing {run.repo}#{run.number}
        </span>
        <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: 12 }}>{fmt(elapsed)}</span>
      </div>

      {/* progress bar */}
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
          marginBottom: 6,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg,#7c5cf6,#a78bfa)',
            borderRadius: 999,
            transition: 'width 0.6s ease',
          }}
        />
      </div>

      {/* current stage + ETA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, opacity: 0.85 }}>
        <Loader2 size={13} className="spin" />
        <span>{currentLabel}</span>
        <span style={{ marginLeft: 'auto', opacity: 0.7 }}>
          {avgDuration ? `usually ~${fmt(avgDuration)}` : 'estimating…'}
        </span>
      </div>

      {/* stage pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0' }}>
        {STAGES.map((s, i) => {
          const done = stageIdx > i || stage === 'done'
          const active = s.key === stage
          return (
            <span
              key={s.key}
              style={{
                fontSize: 11,
                padding: '3px 9px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.12)',
                background: done
                  ? 'rgba(34,197,94,0.18)'
                  : active
                  ? 'rgba(124,92,246,0.25)'
                  : 'transparent',
                color: done ? '#4ade80' : active ? '#c4b5fd' : 'inherit',
                opacity: done || active ? 1 : 0.5,
              }}
            >
              {done ? '✓ ' : active ? '• ' : ''}
              {s.label}
            </span>
          )
        })}
      </div>

      <p style={{ fontSize: 12, opacity: 0.6, margin: '0 0 8px' }}>
        Findings appear here as soon as the review finishes. You can leave the page — a notification
        will tell you when it lands.
      </p>
      <Btn onClick={onCancel}>
        <XCircle size={14} /> Cancel review
      </Btn>
    </Card>
  )
}
