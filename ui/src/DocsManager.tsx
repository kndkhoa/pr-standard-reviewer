import { useEffect, useRef, useState } from 'react'
import { Btn, Card, EmptyState, Input } from './ui-kit'
import { FileText, Pencil, Plus, Trash2, Upload } from './icons'
import type { DocMeta } from './api'

type Props = {
  title: string
  description: string
  list: () => Promise<DocMeta[]>
  read: (name: string) => Promise<string>
  save: (name: string, content: string) => Promise<void>
  remove: (name: string) => Promise<void>
}

/** Reusable manager for the Knowledge Base and the Skills tabs: upload, edit,
 * add and delete markdown documents. */
export default function DocsManager({ title, description, list, read, save, remove }: Props) {
  const [docs, setDocs] = useState<DocMeta[]>([])
  const [editing, setEditing] = useState<{ name: string; content: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = () => list().then(setDocs).catch(() => {})
  useEffect(() => {
    refresh()
  }, [])

  const openEditor = async (name: string) => {
    const content = await read(name)
    setEditing({ name, content })
  }

  const openNew = () => setEditing({ name: '', content: '' })

  const onSave = async () => {
    if (!editing) return
    setBusy(true)
    try {
      await save(editing.name, editing.content)
      setEditing(null)
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    await remove(name)
    await refresh()
  }

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    for (const file of files) {
      const content = await file.text()
      await save(file.name, content)
    }
    if (fileRef.current) fileRef.current.value = ''
    await refresh()
  }

  if (editing) {
    return (
      <Card>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
          <Input
            value={editing.name}
            placeholder="document-name.md"
            onChange={(e: any) => setEditing({ ...editing, name: e.target.value })}
            style={{ flex: 1 }}
          />
          <Btn onClick={onSave} disabled={busy || !editing.name.trim()}>
            Save
          </Btn>
          <Btn onClick={() => setEditing(null)}>Cancel</Btn>
        </div>
        <textarea
          value={editing.content}
          onChange={(e) => setEditing({ ...editing, content: e.target.value })}
          spellCheck={false}
          style={{
            width: '100%',
            minHeight: 360,
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 1.5,
            padding: 12,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(0,0,0,0.25)',
            color: 'inherit',
            resize: 'vertical',
          }}
        />
      </Card>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{description}</div>
        </div>
        <Btn onClick={() => fileRef.current?.click()}>
          <Upload size={14} /> Upload
        </Btn>
        <Btn onClick={openNew}>
          <Plus size={14} /> New
        </Btn>
        <input
          ref={fileRef}
          type="file"
          accept=".md,.txt,.markdown"
          multiple
          onChange={onUpload}
          style={{ display: 'none' }}
        />
      </div>

      {docs.length === 0 ? (
        <EmptyState title="Nothing here yet">
          Upload or create a document to get started.
        </EmptyState>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {docs.map((d) => (
            <Card key={d.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={16} style={{ opacity: 0.7 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{d.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>{d.size} bytes</div>
                </div>
                <Btn onClick={() => openEditor(d.name)}>
                  <Pencil size={13} /> Edit
                </Btn>
                <Btn onClick={() => onDelete(d.name)}>
                  <Trash2 size={13} />
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
