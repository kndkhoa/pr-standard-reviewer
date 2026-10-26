import { useState } from 'react'
import { Btn, Card } from './ui-kit'
import { type AppConfig, useReviewerApi } from './api'

const SUGGESTED_SYSTEM_PROMPT = `Bạn là một senior code reviewer khó tính nhưng công bằng, review pull request theo bộ chuẩn trong Knowledge Base.

Nguyên tắc:
- Chỉ nêu phát hiện có bằng chứng trong diff; không suy diễn ngoài phạm vi thay đổi.
- Mỗi phát hiện phải trỏ đúng tài liệu + mục trong Knowledge Base (reference.doc, reference.section). Nếu không có chuẩn nào phủ, đánh dấu nice_to_have / other.
- Ưu tiên trung thực: must_fix chỉ dành cho lỗi bảo mật, sai logic, mất dữ liệu, phá vỡ tương thích, bỏ kiểm tra quyền. should_fix cho thiếu test, xử lý lỗi kém, giảm hiệu năng, vi phạm convention bắt buộc. nice_to_have cho đặt tên, format, tinh chỉnh.
- Luôn kèm hướng dẫn sửa cụ thể, nêu được đoạn code thay thế nếu có thể.
- Ưu tiên đọc các file có blast radius cao trước: auth, truy cập dữ liệu, migration, API public, thanh toán, chỗ nhận input người dùng.
- Kiểm tra: input validation, SQL injection / query dựng bằng chuỗi, lộ secret trong log, nuốt exception, thiếu test cho nhánh lỗi, thiếu requestId/correlation trong log, response envelope không đúng chuẩn, versioning API.
- standardsChecked phải liệt kê TẤT CẢ tài liệu trong Knowledge Base kèm trạng thái violations / pass / not_applicable.
- Nếu diff hoàn toàn tuân thủ: verdict "approve", findings rỗng, nhưng vẫn điền standardsChecked.
- Phản hồi bằng tiếng Việt trong các trường summary / detail / fix / note (giữ nguyên tên file, tên hàm, code).
- Output CHỈ JSON đúng schema, không kèm văn bản hay dấu code fence.`

export default function SettingsView({
  config,
  onSaved,
}: {
  config: AppConfig
  onSaved: (c: AppConfig) => void
}) {
  const api = useReviewerApi()
  const [systemPrompt, setSystemPrompt] = useState(config.systemPrompt || '')
  const [token, setToken] = useState('')
  const [autoPost, setAutoPost] = useState(!!config.autoPostComment)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setBusy(true)
    setSaved(false)
    try {
      const patch: Partial<AppConfig> & { githubToken?: string } = {
        systemPrompt,
        autoPostComment: autoPost,
      }
      if (token.trim()) patch.githubToken = token.trim()
      const res = await api.saveConfig(patch)
      onSaved(res.config)
      setToken('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setBusy(false)
    }
  }

  const field: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(0,0,0,0.25)',
    color: 'inherit',
    fontSize: 13,
    outline: 'none',
  }
  const label: React.CSSProperties = { fontWeight: 600, fontSize: 13, marginBottom: 6 }
  const hint: React.CSSProperties = { fontSize: 12, opacity: 0.6, marginTop: 4 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 820 }}>
      {/* GitHub PAT */}
      <Card>
        <div style={label}>GitHub Personal Access Token (PAT)</div>
        <input
          type="password"
          value={token}
          placeholder={
            config.hasGithubToken ? '•••••••• (đã lưu — nhập để thay)' : 'ghp_... (để trống = dùng gh auth của host)'
          }
          onChange={(e) => setToken(e.target.value)}
          style={field}
        />
        <div style={hint}>
          App sẽ dùng token này để lấy repo/PR đúng theo tài khoản của token. Token lưu phía server,
          không hiển thị lại. Cần scope <code>repo</code> để đọc repo private và post comment.
        </div>
      </Card>

      {/* System prompt */}
      <Card>
        <div style={{ ...label, display: 'flex', alignItems: 'center' }}>
          <span>System prompt (hướng dẫn thêm cho LLM)</span>
          <Btn
            style={{ marginLeft: 'auto' }}
            onClick={() => setSystemPrompt(SUGGESTED_SYSTEM_PROMPT)}
          >
            Dùng gợi ý
          </Btn>
        </div>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          spellCheck={false}
          placeholder="Để trống nếu không cần. Bấm 'Dùng gợi ý' để chèn mẫu."
          style={{ ...field, minHeight: 240, fontFamily: 'monospace', lineHeight: 1.5, resize: 'vertical' }}
        />
        <div style={hint}>
          Nội dung này được chèn vào đầu mỗi lần review để định hướng cách LLM đánh giá.
        </div>
      </Card>

      {/* Misc */}
      <Card>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={autoPost} onChange={(e) => setAutoPost(e.target.checked)} />
          Tự động post kết quả lên PR cho mọi review
        </label>
      </Card>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Btn onClick={save} disabled={busy} accent>
          {busy ? 'Đang lưu…' : 'Lưu cấu hình'}
        </Btn>
        {saved && <span style={{ color: '#22c55e', fontSize: 13 }}>✓ Đã lưu</span>}
      </div>
    </div>
  )
}
