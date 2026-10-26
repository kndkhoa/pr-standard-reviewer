import { createElement, type CSSProperties, type ReactNode } from 'react'

// Local UI primitives rendered as plain styled HTML. We deliberately do NOT use
// the host's @kirocrew/app-sdk/ui components: their prop contracts vary between
// gateway builds and a mismatch crashes the whole page at render (e.g.
// SegmentedControl reading `.length` of an undefined prop). These are
// self-contained, theme-neutral, and cannot fail to load.

type Any = Record<string, any>

const card: CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 10,
  padding: 14,
}

export function Card({ children, style, ...rest }: Any) {
  return createElement('div', { style: { ...card, ...style }, ...rest }, children)
}

export function CardTitle({ children, style, ...rest }: Any) {
  return createElement(
    'div',
    { style: { fontWeight: 700, marginBottom: 6, ...style }, ...rest },
    children
  )
}

export function PageHeader({ title, subtitle }: { title?: ReactNode; subtitle?: ReactNode }) {
  return createElement(
    'div',
    { style: { padding: '18px 24px 6px' } },
    createElement('div', { style: { fontSize: 20, fontWeight: 800 } }, title),
    subtitle
      ? createElement('div', { style: { fontSize: 13, opacity: 0.65, marginTop: 2 } }, subtitle)
      : null
  )
}

export function Btn({ children, accent, disabled, style, ...rest }: Any) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid rgba(255,255,255,0.14)',
    background: accent ? '#7c5cf6' : 'rgba(255,255,255,0.06)',
    color: accent ? '#fff' : 'inherit',
    opacity: disabled ? 0.5 : 1,
  }
  return createElement('button', { style: { ...base, ...style }, disabled, ...rest }, children)
}

export function Input({ style, ...rest }: Any) {
  const base: CSSProperties = {
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(0,0,0,0.25)',
    color: 'inherit',
    fontSize: 13,
    outline: 'none',
  }
  return createElement('input', { style: { ...base, ...style }, ...rest })
}

export function Badge({ children, style, ...rest }: Any) {
  const base: CSSProperties = {
    display: 'inline-block',
    padding: '1px 8px',
    borderRadius: 999,
    fontSize: 12,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
  }
  return createElement('span', { style: { ...base, ...style }, ...rest }, children)
}

export function StatCard({ label, value, accent }: Any) {
  return createElement(
    'div',
    { style: { ...card, borderColor: accent ? '#7c5cf6' : card.border } },
    createElement('div', { style: { fontSize: 12, opacity: 0.6 } }, label),
    createElement('div', { style: { fontSize: 20, fontWeight: 800, marginTop: 2 } }, value)
  )
}

export function EmptyState({ title, children }: { title?: ReactNode; children?: ReactNode }) {
  return createElement(
    'div',
    {
      style: {
        ...card,
        textAlign: 'center',
        padding: 28,
        opacity: 0.8,
      },
    },
    createElement('div', { style: { fontWeight: 700, marginBottom: 4 } }, title),
    children ? createElement('div', { style: { fontSize: 13, opacity: 0.8 } }, children) : null
  )
}

type Opt = { value: string; label: ReactNode }
export function SegmentedControl({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: Opt[]
}) {
  return createElement(
    'div',
    {
      style: {
        display: 'inline-flex',
        gap: 2,
        padding: 3,
        borderRadius: 10,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
        flexWrap: 'wrap',
      },
    },
    ...(options || []).map((o) =>
      createElement(
        'button',
        {
          key: o.value,
          onClick: () => onChange(o.value),
          style: {
            padding: '6px 12px',
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            background: value === o.value ? '#7c5cf6' : 'transparent',
            color: value === o.value ? '#fff' : 'inherit',
          },
        },
        o.label
      )
    )
  )
}
