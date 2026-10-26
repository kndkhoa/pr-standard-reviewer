import { Badge, Card } from './ui-kit'
import { AlertTriangle, BookOpen, CheckCircle2, Wrench } from './icons'
import type { Finding, Priority, Run } from './api'

const PRIORITY_META: Record<Priority, { label: string; color: string; order: number }> = {
  must_fix: { label: 'Must fix', color: '#ef4444', order: 0 },
  should_fix: { label: 'Should fix', color: '#eab308', order: 1 },
  nice_to_have: { label: 'Nice to have', color: '#22c55e', order: 2 },
}

function FindingCard({ f }: { f: Finding }) {
  const meta = PRIORITY_META[f.priority] ?? PRIORITY_META.should_fix
  const loc = f.file + (f.line ? `:${f.line}` : '')
  return (
    <div
      style={{
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: 10,
        // Faint wash of the priority colour so the whole card reads as its severity.
        background: `linear-gradient(90deg, ${meta.color}1a, transparent 180px)`,
      }}
    >
    <Card style={{ borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, background: 'transparent' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span
          style={{
            background: meta.color,
            color: '#0b0b12',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {meta.label}
        </span>
        <span style={{ fontWeight: 600 }}>{f.title}</span>
        <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: 12 }}>{f.category}</span>
      </div>
      {loc && (
        <div style={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
          {loc}
        </div>
      )}
      <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.5 }}>{f.detail}</p>
      {f.reference?.doc && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            opacity: 0.85,
            marginBottom: 6,
          }}
        >
          <BookOpen size={13} />
          <span>
            {f.reference.doc}
            {f.reference.section
              ? ` § ${f.reference.section.replace(/^[§#\s]+/, '')}`
              : ''}
          </span>
        </div>
      )}
      {f.fix && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            fontSize: 13,
            background: 'rgba(124,92,246,0.12)',
            borderRadius: 6,
            padding: '8px 10px',
          }}
        >
          <Wrench size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>{f.fix}</span>
        </div>
      )}
    </Card>
    </div>
  )
}

export default function FindingsView({ run }: { run: Run }) {
  if (run.status === 'error') {
    return (
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
          <AlertTriangle size={16} /> Review failed
        </div>
        <p style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>{run.error}</p>
      </Card>
    )
  }
  if (run.status !== 'done' || !run.result) {
    return null
  }

  const { result } = run
  const findings = [...result.findings].sort(
    (a, b) => PRIORITY_META[a.priority].order - PRIORITY_META[b.priority].order
  )
  const counts = {
    must_fix: findings.filter((f) => f.priority === 'must_fix').length,
    should_fix: findings.filter((f) => f.priority === 'should_fix').length,
    nice_to_have: findings.filter((f) => f.priority === 'nice_to_have').length,
  }
  const verdictIcon =
    result.verdict === 'approve' ? (
      <CheckCircle2 size={16} color="#22c55e" />
    ) : (
      <AlertTriangle size={16} color={result.verdict === 'request_changes' ? '#ef4444' : '#eab308'} />
    )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          {verdictIcon}
          <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>
            {result.verdict.replace('_', ' ')}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <Badge>{`🔴 ${counts.must_fix}`}</Badge>
            <Badge>{`🟡 ${counts.should_fix}`}</Badge>
            <Badge>{`🟢 ${counts.nice_to_have}`}</Badge>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{result.summary}</p>
      </Card>
      {result.standardsChecked && result.standardsChecked.length > 0 && (
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Standards checked</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {result.standardsChecked.map((c) => {
              const meta = {
                violations: { icon: '🔴', color: '#ef4444', label: 'violations' },
                pass: { icon: '✅', color: '#22c55e', label: 'pass' },
                not_applicable: { icon: '➖', color: '#64748b', label: 'n/a' },
              }[c.status] || { icon: '•', color: '#64748b', label: c.status }
              return (
                <div key={c.doc} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 13 }}>
                  <span>{meta.icon}</span>
                  <code style={{ fontSize: 12 }}>{c.doc}</code>
                  <span style={{ color: meta.color, fontSize: 11, fontWeight: 700 }}>
                    {meta.label}
                  </span>
                  {c.note && <span style={{ opacity: 0.7, fontSize: 12 }}>— {c.note}</span>}
                </div>
              )
            })}
          </div>
        </Card>
      )}
      {findings.length === 0 ? (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e' }}>
            <CheckCircle2 size={16} /> No findings — this PR meets the standards.
          </div>
        </Card>
      ) : (
        findings.map((f) => <FindingCard key={f.id} f={f} />)
      )}
    </div>
  )
}
