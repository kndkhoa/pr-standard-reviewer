import { createElement as S, useState as g, useRef as Ee, useEffect as H, useMemo as de } from "react";
import { createRoot as _e } from "react-dom/client";
import { jsxs as o, jsx as n, Fragment as Ae } from "react/jsx-runtime";
const me = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 10,
  padding: 14
};
function k({ children: e, style: i, ...a }) {
  return S("div", { style: { ...me, ...i }, ...a }, e);
}
function Be({ title: e, subtitle: i }) {
  return S(
    "div",
    { style: { padding: "18px 24px 6px" } },
    S("div", { style: { fontSize: 20, fontWeight: 800 } }, e),
    i ? S("div", { style: { fontSize: 13, opacity: 0.65, marginTop: 2 } }, i) : null
  );
}
function w({ children: e, accent: i, disabled: a, style: r, ...d }) {
  return S("button", { style: { ...{
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 12px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: a ? "not-allowed" : "pointer",
    border: "1px solid rgba(255,255,255,0.14)",
    background: i ? "#7c5cf6" : "rgba(255,255,255,0.06)",
    color: i ? "#fff" : "inherit",
    opacity: a ? 0.5 : 1
  }, ...r }, disabled: a, ...d }, e);
}
function X({ style: e, ...i }) {
  return S("input", { style: { ...{
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "inherit",
    fontSize: 13,
    outline: "none"
  }, ...e }, ...i });
}
function j({ children: e, style: i, ...a }) {
  return S("span", { style: { ...{
    display: "inline-block",
    padding: "1px 8px",
    borderRadius: 999,
    fontSize: 12,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)"
  }, ...i }, ...a }, e);
}
function D({ title: e, children: i }) {
  return S(
    "div",
    {
      style: {
        ...me,
        textAlign: "center",
        padding: 28,
        opacity: 0.8
      }
    },
    S("div", { style: { fontWeight: 700, marginBottom: 4 } }, e),
    i ? S("div", { style: { fontSize: 13, opacity: 0.8 } }, i) : null
  );
}
function Ne({
  value: e,
  onChange: i,
  options: a
}) {
  return S(
    "div",
    {
      style: {
        display: "inline-flex",
        gap: 2,
        padding: 3,
        borderRadius: 10,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)",
        flexWrap: "wrap"
      }
    },
    ...(a || []).map(
      (r) => S(
        "button",
        {
          key: r.value,
          onClick: () => i(r.value),
          style: {
            padding: "6px 12px",
            borderRadius: 7,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            background: e === r.value ? "#7c5cf6" : "transparent",
            color: e === r.value ? "#fff" : "inherit"
          }
        },
        r.label
      )
    )
  );
}
function R(e, i) {
  return function({ size: r = 16, color: d = "currentColor", ...s }) {
    return S(
      "svg",
      {
        width: r,
        height: r,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: d,
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        ...s
      },
      ...e.split("|").map((p, b) => S("path", { key: b, d: p })),
      null
    );
  };
}
const We = R(
  "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z|M14 2v6h6|M16 13H8|M16 17H8|M10 9H8"
), Oe = R("M12 20h9|M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"), ye = R("M12 5v14|M5 12h14"), ve = R(
  "M3 6h18|M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2|M10 11v6|M14 11v6"
), He = R("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|M17 8l-5-5-5 5|M12 3v12"), De = R(
  "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z|M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
), qe = R(
  "M14.7 6.3a4 4 0 0 0-5.3 5.3L3 18l3 3 6.4-6.4a4 4 0 0 0 5.3-5.3l-2.8 2.8-2.1-2.1z"
), he = R(
  "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z|M12 9v4|M12 17h.01"
), ue = R("M22 11.1V12a10 10 0 1 1-5.9-9.1|M22 4 12 14.01l-3-3"), Fe = R("M9 11l3 3L22 4|M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"), Ke = R("M3 3h18v18H3z"), pe = R(
  "M21 2v6h-6|M3 22v-6h6|M3.5 9a9 9 0 0 1 14.9-3.4L21 8|M20.5 15a9 9 0 0 1-14.9 3.4L3 16"
), be = R("M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z|M15 9l-6 6|M9 9l6 6"), Ue = R(
  "M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z|M6 9v12|M18 18a3 3 0 1 0 0 6 3 3 0 0 0 0-6z|M13 6h3a2 2 0 0 1 2 2v10"
), je = R("M21 12a9 9 0 1 1-6.2-8.5"), f = "/apps/pr-standard-reviewer/api";
async function _(e) {
  const i = await fetch(e, { credentials: "include" });
  if (!i.ok) throw new Error(`${i.status} ${await i.text().catch(() => "")}`);
  return i.json();
}
async function M(e, i, a) {
  const r = await fetch(i, {
    method: e,
    credentials: "include",
    headers: a === void 0 ? {} : { "Content-Type": "application/json" },
    body: a === void 0 ? void 0 : JSON.stringify(a)
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text().catch(() => "")}`);
  const d = await r.text();
  return d ? JSON.parse(d) : {};
}
function we() {
  return {
    status: () => _(`${f}/status`),
    saveConfig: (e) => M("POST", `${f}/config`, e),
    listRepos: () => _(`${f}/repos`),
    addRepo: (e) => M("POST", `${f}/repos`, { fullName: e }),
    removeRepo: (e) => M(
      "DELETE",
      `${f}/repos?fullName=${encodeURIComponent(e)}`
    ),
    listPrs: (e) => _(`${f}/prs?repo=${encodeURIComponent(e)}`),
    startReview: (e, i, a) => M("POST", `${f}/review`, { repo: e, numbers: i, postComment: a }),
    listRuns: () => _(`${f}/runs`),
    getRun: (e) => _(`${f}/runs/${e}`),
    cancelRun: (e) => M("POST", `${f}/runs/${e}/cancel`, {}),
    postComment: (e) => M("POST", `${f}/runs/${e}/comment`, {}),
    prepareRun: (e) => M(
      "POST",
      `${f}/runs/${e}/prepare`,
      {}
    ),
    submitResult: (e, i) => M("POST", `${f}/runs/${e}/result`, { result: i }),
    failRun: (e, i) => M("POST", `${f}/runs/${e}/fail`, { error: i }),
    // Run the app's agent through the gateway chat endpoint (SSE stream) and
    // return the assistant's full text.
    runAgent: async (e, i, a, r) => {
      var $;
      const d = await fetch("/api/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: e, agent: i }),
        signal: r
      });
      if (!d.ok) throw new Error(`/api/chat ${d.status} ${await d.text().catch(() => "")}`);
      const s = ($ = d.body) == null ? void 0 : $.getReader();
      if (!s) throw new Error("no response stream from /api/chat");
      const p = new TextDecoder();
      let b = "", c = "", v = 0;
      for (; ; ) {
        const { done: P, value: m } = await s.read();
        if (P) break;
        b += p.decode(m, { stream: !0 });
        const T = b.split(`
`);
        b = T.pop() || "";
        for (const C of T) {
          const x = C.trim();
          if (!x.startsWith("data:")) continue;
          const L = x.slice(5).trim();
          if (L === "[DONE]") return c;
          try {
            const y = JSON.parse(L);
            y.type === "chunk" && typeof y.content == "string" && (v += y.content.length, a == null || a(v)), y.type === "assistant" && typeof y.content == "string" && (c = y.content, a == null || a(c.length));
          } catch {
          }
        }
      }
      return c;
    },
    parseFindings: (e) => {
      let i = e.trim();
      const a = i.match(/```(?:json)?\s*([\s\S]*?)```/);
      a && (i = a[1].trim());
      const r = i.indexOf("{"), d = i.lastIndexOf("}");
      if (r === -1 || d === -1) throw new Error("no JSON object in agent response");
      return JSON.parse(i.slice(r, d + 1));
    },
    listKnowledge: () => _(`${f}/knowledge`),
    readKnowledge: (e) => _(`${f}/knowledge/${encodeURIComponent(e)}`),
    saveKnowledge: (e, i) => M("POST", `${f}/knowledge`, { name: e, content: i }),
    deleteKnowledge: (e) => M("DELETE", `${f}/knowledge/${encodeURIComponent(e)}`),
    listSkills: () => _(`${f}/skills`),
    readSkill: (e) => _(`${f}/skills/${encodeURIComponent(e)}`),
    saveSkill: (e, i) => M("POST", `${f}/skills`, { name: e, content: i }),
    deleteSkill: (e) => M("DELETE", `${f}/skills/${encodeURIComponent(e)}`)
  };
}
const G = {
  must_fix: { label: "Must fix", color: "#ef4444", order: 0 },
  should_fix: { label: "Should fix", color: "#eab308", order: 1 },
  nice_to_have: { label: "Nice to have", color: "#22c55e", order: 2 }
};
function Ge({ f: e }) {
  var r;
  const i = G[e.priority] ?? G.should_fix, a = e.file + (e.line ? `:${e.line}` : "");
  return /* @__PURE__ */ n(
    "div",
    {
      style: {
        borderLeft: `3px solid ${i.color}`,
        borderRadius: 10,
        // Faint wash of the priority colour so the whole card reads as its severity.
        background: `linear-gradient(90deg, ${i.color}1a, transparent 180px)`
      },
      children: /* @__PURE__ */ o(k, { style: { borderLeft: "none", borderTopLeftRadius: 0, borderBottomLeftRadius: 0, background: "transparent" }, children: [
        /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
          /* @__PURE__ */ n(
            "span",
            {
              style: {
                background: i.color,
                color: "#0b0b12",
                borderRadius: 6,
                padding: "2px 8px",
                fontSize: 12,
                fontWeight: 700
              },
              children: i.label
            }
          ),
          /* @__PURE__ */ n("span", { style: { fontWeight: 600 }, children: e.title }),
          /* @__PURE__ */ n("span", { style: { marginLeft: "auto", opacity: 0.6, fontSize: 12 }, children: e.category })
        ] }),
        a && /* @__PURE__ */ n("div", { style: { fontFamily: "monospace", fontSize: 12, opacity: 0.8, marginBottom: 6 }, children: a }),
        /* @__PURE__ */ n("p", { style: { margin: "0 0 8px", fontSize: 13, lineHeight: 1.5 }, children: e.detail }),
        ((r = e.reference) == null ? void 0 : r.doc) && /* @__PURE__ */ o(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              opacity: 0.85,
              marginBottom: 6
            },
            children: [
              /* @__PURE__ */ n(De, { size: 13 }),
              /* @__PURE__ */ o("span", { children: [
                e.reference.doc,
                e.reference.section ? ` § ${e.reference.section.replace(/^[§#\s]+/, "")}` : ""
              ] })
            ]
          }
        ),
        e.fix && /* @__PURE__ */ o(
          "div",
          {
            style: {
              display: "flex",
              gap: 6,
              fontSize: 13,
              background: "rgba(124,92,246,0.12)",
              borderRadius: 6,
              padding: "8px 10px"
            },
            children: [
              /* @__PURE__ */ n(qe, { size: 14, style: { marginTop: 2, flexShrink: 0 } }),
              /* @__PURE__ */ n("span", { children: e.fix })
            ]
          }
        )
      ] })
    }
  );
}
function Ve({ run: e }) {
  if (e.status === "error")
    return /* @__PURE__ */ o(k, { children: [
      /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: 8, color: "#ef4444" }, children: [
        /* @__PURE__ */ n(he, { size: 16 }),
        " Review failed"
      ] }),
      /* @__PURE__ */ n("p", { style: { fontSize: 13, opacity: 0.85, marginTop: 8 }, children: e.error })
    ] });
  if (e.status !== "done" || !e.result)
    return null;
  const { result: i } = e, a = [...i.findings].sort(
    (s, p) => G[s.priority].order - G[p.priority].order
  ), r = {
    must_fix: a.filter((s) => s.priority === "must_fix").length,
    should_fix: a.filter((s) => s.priority === "should_fix").length,
    nice_to_have: a.filter((s) => s.priority === "nice_to_have").length
  }, d = i.verdict === "approve" ? /* @__PURE__ */ n(ue, { size: 16, color: "#22c55e" }) : /* @__PURE__ */ n(he, { size: 16, color: i.verdict === "request_changes" ? "#ef4444" : "#eab308" });
  return /* @__PURE__ */ o("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ o(k, { children: [
      /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
        d,
        /* @__PURE__ */ n("span", { style: { fontWeight: 700, textTransform: "capitalize" }, children: i.verdict.replace("_", " ") }),
        /* @__PURE__ */ o("div", { style: { marginLeft: "auto", display: "flex", gap: 6 }, children: [
          /* @__PURE__ */ n(j, { children: `🔴 ${r.must_fix}` }),
          /* @__PURE__ */ n(j, { children: `🟡 ${r.should_fix}` }),
          /* @__PURE__ */ n(j, { children: `🟢 ${r.nice_to_have}` })
        ] })
      ] }),
      /* @__PURE__ */ n("p", { style: { margin: 0, fontSize: 13, lineHeight: 1.5 }, children: i.summary })
    ] }),
    i.standardsChecked && i.standardsChecked.length > 0 && /* @__PURE__ */ o(k, { children: [
      /* @__PURE__ */ n("div", { style: { fontWeight: 700, marginBottom: 8 }, children: "Standards checked" }),
      /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: i.standardsChecked.map((s) => {
        const p = {
          violations: { icon: "🔴", color: "#ef4444", label: "violations" },
          pass: { icon: "✅", color: "#22c55e", label: "pass" },
          not_applicable: { icon: "➖", color: "#64748b", label: "n/a" }
        }[s.status] || { icon: "•", color: "#64748b", label: s.status };
        return /* @__PURE__ */ o("div", { style: { display: "flex", gap: 8, alignItems: "baseline", fontSize: 13 }, children: [
          /* @__PURE__ */ n("span", { children: p.icon }),
          /* @__PURE__ */ n("code", { style: { fontSize: 12 }, children: s.doc }),
          /* @__PURE__ */ n("span", { style: { color: p.color, fontSize: 11, fontWeight: 700 }, children: p.label }),
          s.note && /* @__PURE__ */ o("span", { style: { opacity: 0.7, fontSize: 12 }, children: [
            "— ",
            s.note
          ] })
        ] }, s.doc);
      }) })
    ] }),
    a.length === 0 ? /* @__PURE__ */ n(k, { children: /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: 8, color: "#22c55e" }, children: [
      /* @__PURE__ */ n(ue, { size: 16 }),
      " No findings — this PR meets the standards."
    ] }) }) : a.map((s) => /* @__PURE__ */ n(Ge, { f: s }, s.id))
  ] });
}
function ge({ title: e, description: i, list: a, read: r, save: d, remove: s }) {
  const [p, b] = g([]), [c, v] = g(null), [$, P] = g(!1), m = Ee(null), T = () => a().then(b).catch(() => {
  });
  H(() => {
    T();
  }, []);
  const C = async (h) => {
    const E = await r(h);
    v({ name: h, content: E });
  }, x = () => v({ name: "", content: "" }), L = async () => {
    if (c) {
      P(!0);
      try {
        await d(c.name, c.content), v(null), await T();
      } finally {
        P(!1);
      }
    }
  }, y = async (h) => {
    confirm(`Delete "${h}"?`) && (await s(h), await T());
  }, I = async (h) => {
    const E = Array.from(h.target.files ?? []);
    for (const A of E) {
      const V = await A.text();
      await d(A.name, V);
    }
    m.current && (m.current.value = ""), await T();
  };
  return c ? /* @__PURE__ */ o(k, { children: [
    /* @__PURE__ */ o("div", { style: { display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }, children: [
      /* @__PURE__ */ n(
        X,
        {
          value: c.name,
          placeholder: "document-name.md",
          onChange: (h) => v({ ...c, name: h.target.value }),
          style: { flex: 1 }
        }
      ),
      /* @__PURE__ */ n(w, { onClick: L, disabled: $ || !c.name.trim(), children: "Save" }),
      /* @__PURE__ */ n(w, { onClick: () => v(null), children: "Cancel" })
    ] }),
    /* @__PURE__ */ n(
      "textarea",
      {
        value: c.content,
        onChange: (h) => v({ ...c, content: h.target.value }),
        spellCheck: !1,
        style: {
          width: "100%",
          minHeight: 360,
          fontFamily: "monospace",
          fontSize: 13,
          lineHeight: 1.5,
          padding: 12,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.25)",
          color: "inherit",
          resize: "vertical"
        }
      }
    )
  ] }) : /* @__PURE__ */ o("div", { children: [
    /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }, children: [
      /* @__PURE__ */ o("div", { style: { flex: 1 }, children: [
        /* @__PURE__ */ n("div", { style: { fontWeight: 700 }, children: e }),
        /* @__PURE__ */ n("div", { style: { fontSize: 12, opacity: 0.7 }, children: i })
      ] }),
      /* @__PURE__ */ o(w, { onClick: () => {
        var h;
        return (h = m.current) == null ? void 0 : h.click();
      }, children: [
        /* @__PURE__ */ n(He, { size: 14 }),
        " Upload"
      ] }),
      /* @__PURE__ */ o(w, { onClick: x, children: [
        /* @__PURE__ */ n(ye, { size: 14 }),
        " New"
      ] }),
      /* @__PURE__ */ n(
        "input",
        {
          ref: m,
          type: "file",
          accept: ".md,.txt,.markdown",
          multiple: !0,
          onChange: I,
          style: { display: "none" }
        }
      )
    ] }),
    p.length === 0 ? /* @__PURE__ */ n(D, { title: "Nothing here yet", children: "Upload or create a document to get started." }) : /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: p.map((h) => /* @__PURE__ */ n(k, { children: /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
      /* @__PURE__ */ n(We, { size: 16, style: { opacity: 0.7 } }),
      /* @__PURE__ */ o("div", { style: { flex: 1 }, children: [
        /* @__PURE__ */ n("div", { style: { fontWeight: 600 }, children: h.name }),
        /* @__PURE__ */ o("div", { style: { fontSize: 11, opacity: 0.6 }, children: [
          h.size,
          " bytes"
        ] })
      ] }),
      /* @__PURE__ */ o(w, { onClick: () => C(h.name), children: [
        /* @__PURE__ */ n(Oe, { size: 13 }),
        " Edit"
      ] }),
      /* @__PURE__ */ n(w, { onClick: () => y(h.name), children: /* @__PURE__ */ n(ve, { size: 13 }) })
    ] }) }, h.name)) })
  ] });
}
const Je = `Bạn là một senior code reviewer khó tính nhưng công bằng, review pull request theo bộ chuẩn trong Knowledge Base.

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
- Output CHỈ JSON đúng schema, không kèm văn bản hay dấu code fence.`;
function Ye({
  config: e,
  onSaved: i
}) {
  const a = we(), [r, d] = g(e.systemPrompt || ""), [s, p] = g(""), [b, c] = g(!!e.autoPostComment), [v, $] = g(!1), [P, m] = g(!1), T = async () => {
    $(!0), m(!1);
    try {
      const y = {
        systemPrompt: r,
        autoPostComment: b
      };
      s.trim() && (y.githubToken = s.trim());
      const I = await a.saveConfig(y);
      i(I.config), p(""), m(!0), setTimeout(() => m(!1), 2500);
    } finally {
      $(!1);
    }
  }, C = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "inherit",
    fontSize: 13,
    outline: "none"
  }, x = { fontWeight: 600, fontSize: 13, marginBottom: 6 }, L = { fontSize: 12, opacity: 0.6, marginTop: 4 };
  return /* @__PURE__ */ o("div", { style: { display: "flex", flexDirection: "column", gap: 12, maxWidth: 820 }, children: [
    /* @__PURE__ */ o(k, { children: [
      /* @__PURE__ */ n("div", { style: x, children: "GitHub Personal Access Token (PAT)" }),
      /* @__PURE__ */ n(
        "input",
        {
          type: "password",
          value: s,
          placeholder: e.hasGithubToken ? "•••••••• (đã lưu — nhập để thay)" : "ghp_... (để trống = dùng gh auth của host)",
          onChange: (y) => p(y.target.value),
          style: C
        }
      ),
      /* @__PURE__ */ o("div", { style: L, children: [
        "App sẽ dùng token này để lấy repo/PR đúng theo tài khoản của token. Token lưu phía server, không hiển thị lại. Cần scope ",
        /* @__PURE__ */ n("code", { children: "repo" }),
        " để đọc repo private và post comment."
      ] })
    ] }),
    /* @__PURE__ */ o(k, { children: [
      /* @__PURE__ */ o("div", { style: { ...x, display: "flex", alignItems: "center" }, children: [
        /* @__PURE__ */ n("span", { children: "System prompt (hướng dẫn thêm cho LLM)" }),
        /* @__PURE__ */ n(
          w,
          {
            style: { marginLeft: "auto" },
            onClick: () => d(Je),
            children: "Dùng gợi ý"
          }
        )
      ] }),
      /* @__PURE__ */ n(
        "textarea",
        {
          value: r,
          onChange: (y) => d(y.target.value),
          spellCheck: !1,
          placeholder: "Để trống nếu không cần. Bấm 'Dùng gợi ý' để chèn mẫu.",
          style: { ...C, minHeight: 240, fontFamily: "monospace", lineHeight: 1.5, resize: "vertical" }
        }
      ),
      /* @__PURE__ */ n("div", { style: L, children: "Nội dung này được chèn vào đầu mỗi lần review để định hướng cách LLM đánh giá." })
    ] }),
    /* @__PURE__ */ n(k, { children: /* @__PURE__ */ o("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 }, children: [
      /* @__PURE__ */ n("input", { type: "checkbox", checked: b, onChange: (y) => c(y.target.checked) }),
      "Tự động post kết quả lên PR cho mọi review"
    ] }) }),
    /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
      /* @__PURE__ */ n(w, { onClick: T, disabled: v, accent: !0, children: v ? "Đang lưu…" : "Lưu cấu hình" }),
      P && /* @__PURE__ */ n("span", { style: { color: "#22c55e", fontSize: 13 }, children: "✓ Đã lưu" })
    ] })
  ] });
}
const K = [
  { key: "fetching", label: "Fetch diff" },
  { key: "reviewing", label: "Review" },
  { key: "parsing", label: "Parse" },
  { key: "posting", label: "Post comment" }
];
function fe(e) {
  const i = Math.floor(e / 60), a = Math.round(e % 60);
  return `${i}:${String(a).padStart(2, "0")}`;
}
function Qe({
  run: e,
  stage: i,
  chars: a,
  avgDuration: r,
  onCancel: d
}) {
  var P;
  const s = e.elapsed ?? 0, p = K.findIndex((m) => m.key === i), b = p < 0 ? 0.08 : (p + 0.5) / K.length, c = r ? Math.min(0.97, s / r) : null, v = Math.max(b * 0.5, c ?? b) * 100, $ = i === "queued" ? "Queued" : i === "reviewing" ? `Reviewing against standards${a ? ` · ${a.toLocaleString()} chars` : ""}` : (((P = K.find((m) => m.key === i)) == null ? void 0 : P.label) ?? "Working") + "…";
  return /* @__PURE__ */ o(k, { children: [
    /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
      /* @__PURE__ */ o("span", { style: { fontWeight: 600, fontSize: 13 }, children: [
        "Reviewing ",
        e.repo,
        "#",
        e.number
      ] }),
      /* @__PURE__ */ n("span", { style: { marginLeft: "auto", opacity: 0.6, fontSize: 12 }, children: fe(s) })
    ] }),
    /* @__PURE__ */ n(
      "div",
      {
        style: {
          height: 6,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
          marginBottom: 6
        },
        children: /* @__PURE__ */ n(
          "div",
          {
            style: {
              height: "100%",
              width: `${v}%`,
              background: "linear-gradient(90deg,#7c5cf6,#a78bfa)",
              borderRadius: 999,
              transition: "width 0.6s ease"
            }
          }
        )
      }
    ),
    /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, opacity: 0.85 }, children: [
      /* @__PURE__ */ n(je, { size: 13, className: "spin" }),
      /* @__PURE__ */ n("span", { children: $ }),
      /* @__PURE__ */ n("span", { style: { marginLeft: "auto", opacity: 0.7 }, children: r ? `usually ~${fe(r)}` : "estimating…" })
    ] }),
    /* @__PURE__ */ n("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0" }, children: K.map((m, T) => {
      const C = p > T || i === "done", x = m.key === i;
      return /* @__PURE__ */ o(
        "span",
        {
          style: {
            fontSize: 11,
            padding: "3px 9px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: C ? "rgba(34,197,94,0.18)" : x ? "rgba(124,92,246,0.25)" : "transparent",
            color: C ? "#4ade80" : x ? "#c4b5fd" : "inherit",
            opacity: C || x ? 1 : 0.5
          },
          children: [
            C ? "✓ " : x ? "• " : "",
            m.label
          ]
        },
        m.key
      );
    }) }),
    /* @__PURE__ */ n("p", { style: { fontSize: 12, opacity: 0.6, margin: "0 0 8px" }, children: "Findings appear here as soon as the review finishes. You can leave the page — a notification will tell you when it lands." }),
    /* @__PURE__ */ o(w, { onClick: d, children: [
      /* @__PURE__ */ n(be, { size: 14 }),
      " Cancel review"
    ] })
  ] });
}
function Xe() {
  return (e) => {
    try {
      window.dispatchEvent(new CustomEvent("mc:notify", { detail: e }));
    } catch {
    }
    console.info("[pr-standard-reviewer]", e.title, e.body || "");
  };
}
const U = /* @__PURE__ */ new Set(["queued", "running"]);
function Ze(e) {
  if (e == null) return "";
  const i = Math.floor(e / 60), a = e % 60;
  return `${i}:${String(a).padStart(2, "0")}`;
}
function et() {
  var se, ce;
  const e = we(), i = Xe(), [a, r] = g("review"), [d, s] = g(null), [p, b] = g({ repos: [] }), [c, v] = g(""), [$, P] = g(""), [m, T] = g([]), [C, x] = g(!1), [L, y] = g([]), [I, h] = g(/* @__PURE__ */ new Set()), [E, A] = g([]), [V, Z] = g(null), [xe, ee] = g(!1), [J, Y] = g(!1), [Q, ke] = g(""), [Se, Re] = g(null), [te, Ce] = g({}), N = (t, l, u) => Ce((F) => {
    var W;
    return {
      ...F,
      [t]: { stage: l, chars: u ?? ((W = F[t]) == null ? void 0 : W.chars) ?? 0 }
    };
  }), ze = () => e.status().then((t) => {
    s(t.auth), b(t.config), !c && t.config.repos.length && v(t.config.repos[0]), Y(!!t.config.autoPostComment);
  }).catch(() => {
  });
  H(() => {
    ze();
  }, []);
  const ne = de(() => E.some((t) => U.has(t.status)), [E]);
  H(() => {
    let t;
    const l = () => e.listRuns().then((u) => {
      A(u.runs), u.avgDurationSec != null && Re(u.avgDurationSec);
    }).catch(() => {
    });
    return l(), ne && (t = setInterval(l, 2e3)), () => t && clearInterval(t);
  }, [ne]);
  const ie = async (t) => {
    if (t) {
      ee(!0), h(/* @__PURE__ */ new Set());
      try {
        const l = await e.listPrs(t);
        y(l.prs);
      } catch (l) {
        i == null || i({ title: "Failed to load PRs", body: String((l == null ? void 0 : l.message) || l) }), y([]);
      } finally {
        ee(!1);
      }
    }
  };
  H(() => {
    c && ie(c);
  }, [c]);
  const oe = () => {
    x(!0), e.listRepos().then((t) => T(t.repos)).catch(() => {
    }).finally(() => x(!1));
  };
  H(() => {
    oe();
  }, []);
  const le = async (t) => {
    const l = t.trim();
    if (l)
      try {
        const u = await e.addRepo(l);
        b(u.config), P(""), v(l);
      } catch (u) {
        i == null || i({ title: "Could not add repo", body: String((u == null ? void 0 : u.message) || u) });
      }
  }, ae = () => le($), $e = async (t) => {
    const l = await e.removeRepo(t);
    b(l.config), c === t && v(l.config.repos[0] || "");
  }, Te = (t) => {
    const l = new Set(I);
    l.has(t) ? l.delete(t) : l.add(t), h(l);
  }, Me = () => {
    I.size === B.length ? h(/* @__PURE__ */ new Set()) : h(new Set(B.map((t) => t.number)));
  }, q = () => e.listRuns().then((t) => A(t.runs)).catch(() => {
  }), Pe = async (t) => {
    var l;
    try {
      N(t, "fetching");
      const u = await e.prepareRun(t);
      if (u.cancelled || !u.prompt) {
        await q();
        return;
      }
      N(t, "reviewing", 0);
      const F = await e.runAgent(
        u.prompt,
        u.agent || "pr-reviewer",
        (O) => N(t, "reviewing", O)
      );
      N(t, "parsing");
      let W;
      try {
        W = e.parseFindings(F);
      } catch (O) {
        await e.failRun(t, `Could not parse agent output: ${(O == null ? void 0 : O.message) || O}`), await q();
        return;
      }
      (J || !!p.autoPostComment) && N(t, "posting"), await e.submitResult(t, W), N(t, "done"), await q(), i == null || i({ title: "Review finished", body: `${((l = W.findings) == null ? void 0 : l.length) ?? 0} findings` });
    } catch (u) {
      try {
        await e.failRun(t, String((u == null ? void 0 : u.message) || u));
      } catch {
      }
      await q();
    }
  }, Ie = async () => {
    var t;
    if (!(!c || I.size === 0))
      try {
        const l = await e.startReview(c, Array.from(I), J);
        A((u) => [...l.runs, ...u]), h(/* @__PURE__ */ new Set()), r("runs"), Z(((t = l.runs[0]) == null ? void 0 : t.id) ?? null);
        for (const u of l.runs)
          await Pe(u.id);
      } catch (l) {
        i == null || i({ title: "Could not start review", body: String((l == null ? void 0 : l.message) || l) });
      }
  }, re = async (t) => {
    await e.cancelRun(t), e.listRuns().then((l) => A(l.runs)).catch(() => {
    });
  }, Le = async (t) => {
    try {
      await e.postComment(t), i == null || i({ title: "Comment posted to the pull request" }), e.listRuns().then((l) => A(l.runs)).catch(() => {
      });
    } catch (l) {
      i == null || i({ title: "Could not post comment", body: String((l == null ? void 0 : l.message) || l) });
    }
  }, B = de(() => {
    const t = Q.trim().toLowerCase();
    return t ? L.filter(
      (l) => l.title.toLowerCase().includes(t) || String(l.number).includes(t)
    ) : L;
  }, [L, Q]), z = E.find((t) => t.id === V) || null;
  return /* @__PURE__ */ o(Ae, { children: [
    /* @__PURE__ */ n(Be, { title: "PR Standard Reviewer", subtitle: "Review pull requests against your standards" }),
    /* @__PURE__ */ o("div", { style: { padding: "0 24px 32px", overflowY: "auto", flex: 1, minHeight: 0 }, children: [
      d && !d.authenticated && /* @__PURE__ */ o(k, { children: [
        /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: 8, color: "#eab308" }, children: [
          /* @__PURE__ */ n(be, { size: 16 }),
          " GitHub CLI is not authenticated on the gateway host."
        ] }),
        /* @__PURE__ */ o("p", { style: { fontSize: 13, opacity: 0.8, marginTop: 6 }, children: [
          "Run ",
          /* @__PURE__ */ n("code", { children: "gh auth login" }),
          " on the machine running the gateway, then reload.",
          d.error ? ` (${d.error})` : ""
        ] })
      ] }),
      /* @__PURE__ */ n("div", { style: { margin: "12px 0" }, children: /* @__PURE__ */ n(
        Ne,
        {
          value: a,
          onChange: (t) => r(t),
          options: [
            { value: "review", label: "Review" },
            { value: "runs", label: `Reviews${E.length ? ` (${E.length})` : ""}` },
            { value: "knowledge", label: "Knowledge Base" },
            { value: "skills", label: "Skills" },
            { value: "settings", label: "Settings" }
          ]
        }
      ) }),
      a === "review" && /* @__PURE__ */ o("div", { children: [
        /* @__PURE__ */ o(k, { children: [
          /* @__PURE__ */ o("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ o(
              "select",
              {
                value: c,
                onChange: (t) => v(t.target.value),
                style: {
                  flex: 1,
                  minWidth: 220,
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "rgba(0,0,0,0.25)",
                  color: "inherit",
                  border: "1px solid rgba(255,255,255,0.12)"
                },
                children: [
                  p.repos.length === 0 && /* @__PURE__ */ n("option", { value: "", children: "No repos added" }),
                  p.repos.map((t) => /* @__PURE__ */ n("option", { value: t, children: t }, t))
                ]
              }
            ),
            /* @__PURE__ */ n(w, { onClick: () => ie(c), disabled: !c, children: /* @__PURE__ */ n(pe, { size: 14 }) }),
            c && /* @__PURE__ */ n(w, { onClick: () => $e(c), children: /* @__PURE__ */ n(ve, { size: 14 }) })
          ] }),
          /* @__PURE__ */ o("div", { style: { display: "flex", gap: 8, marginTop: 8, alignItems: "center" }, children: [
            /* @__PURE__ */ o(
              "select",
              {
                value: "",
                onChange: (t) => t.target.value && le(t.target.value),
                style: {
                  flex: 1,
                  minWidth: 220,
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "rgba(0,0,0,0.25)",
                  color: "inherit",
                  border: "1px solid rgba(255,255,255,0.12)"
                },
                children: [
                  /* @__PURE__ */ n("option", { value: "", children: C ? "Loading your GitHub repos…" : m.length ? "+ Add from your GitHub repos…" : "No GitHub repos found (check gh auth)" }),
                  m.filter((t) => !p.repos.includes(t.fullName)).map((t) => /* @__PURE__ */ o("option", { value: t.fullName, children: [
                    t.fullName,
                    t.private ? " (private)" : ""
                  ] }, t.fullName))
                ]
              }
            ),
            /* @__PURE__ */ n(w, { onClick: oe, disabled: C, children: /* @__PURE__ */ n(pe, { size: 14 }) })
          ] }),
          /* @__PURE__ */ o("div", { style: { display: "flex", gap: 8, marginTop: 8 }, children: [
            /* @__PURE__ */ n(
              X,
              {
                value: $,
                placeholder: "or type owner/repo…",
                onChange: (t) => P(t.target.value),
                onKeyDown: (t) => t.key === "Enter" && ae(),
                style: { flex: 1 }
              }
            ),
            /* @__PURE__ */ o(w, { onClick: ae, disabled: !$.trim(), children: [
              /* @__PURE__ */ n(ye, { size: 14 }),
              " Add repo"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ o("div", { style: { marginTop: 12 }, children: [
          /* @__PURE__ */ o("div", { style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }, children: [
            /* @__PURE__ */ n(
              X,
              {
                value: Q,
                placeholder: "Filter pull requests",
                onChange: (t) => ke(t.target.value),
                style: { flex: 1 }
              }
            ),
            /* @__PURE__ */ n(w, { onClick: Me, disabled: !B.length, children: I.size === B.length && B.length > 0 ? "Clear" : "Select all" })
          ] }),
          xe ? /* @__PURE__ */ n(D, { title: "Loading pull requests…" }) : B.length === 0 ? /* @__PURE__ */ n(D, { title: "No open pull requests", children: c ? "This repo has no open PRs." : "Add and select a repo first." }) : /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: B.map((t) => {
            const l = I.has(t.number);
            return /* @__PURE__ */ n(k, { children: /* @__PURE__ */ o(
              "div",
              {
                style: { display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" },
                onClick: () => Te(t.number),
                children: [
                  l ? /* @__PURE__ */ n(Fe, { size: 18, color: "#7c5cf6" }) : /* @__PURE__ */ n(Ke, { size: 18, opacity: 0.5 }),
                  /* @__PURE__ */ o("div", { style: { flex: 1 }, children: [
                    /* @__PURE__ */ o("div", { style: { fontWeight: 600 }, children: [
                      /* @__PURE__ */ o("span", { style: { opacity: 0.6 }, children: [
                        "#",
                        t.number
                      ] }),
                      " ",
                      t.title
                    ] }),
                    /* @__PURE__ */ o("div", { style: { fontSize: 12, opacity: 0.65, marginTop: 2 }, children: [
                      t.author ? `by ${t.author} · ` : "",
                      t.changedFiles ?? "?",
                      " files",
                      t.additions != null ? ` · +${t.additions}/-${t.deletions}` : "",
                      t.draft ? " · draft" : ""
                    ] })
                  ] })
                ]
              }
            ) }, t.number);
          }) })
        ] }),
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginTop: 14,
              position: "sticky",
              bottom: 0,
              padding: "10px 0"
            },
            children: [
              /* @__PURE__ */ o("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 13 }, children: [
                /* @__PURE__ */ n(
                  "input",
                  {
                    type: "checkbox",
                    checked: J,
                    onChange: (t) => Y(t.target.checked)
                  }
                ),
                "Post results as a PR comment"
              ] }),
              /* @__PURE__ */ n("div", { style: { flex: 1 } }),
              /* @__PURE__ */ o(w, { onClick: Ie, disabled: !c || I.size === 0, accent: !0, children: [
                /* @__PURE__ */ n(Ue, { size: 15 }),
                " Review ",
                I.size || "",
                " selected"
              ] })
            ]
          }
        )
      ] }),
      a === "runs" && /* @__PURE__ */ o("div", { style: { display: "flex", gap: 14 }, children: [
        /* @__PURE__ */ n("div", { style: { width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }, children: E.length === 0 ? /* @__PURE__ */ n(D, { title: "No reviews yet", children: "Start a review from the Review tab." }) : E.map((t) => /* @__PURE__ */ n(k, { children: /* @__PURE__ */ o(
          "div",
          {
            style: { cursor: "pointer" },
            onClick: () => Z(t.id),
            children: [
              /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                /* @__PURE__ */ o("span", { style: { fontWeight: 600, fontSize: 13 }, children: [
                  t.repo,
                  "#",
                  t.number
                ] }),
                /* @__PURE__ */ n("div", { style: { marginLeft: "auto" }, children: /* @__PURE__ */ n(tt, { run: t }) })
              ] }),
              /* @__PURE__ */ n("div", { style: { fontSize: 12, opacity: 0.7, marginTop: 2 }, children: t.title || "…" }),
              /* @__PURE__ */ o("div", { style: { fontSize: 11, opacity: 0.55, marginTop: 4 }, children: [
                U.has(t.status) && t.startedAt ? `${Ze(t.elapsed)} elapsed` : "",
                t.status === "done" && t.findingsCount != null ? `${t.findingsCount} findings` : ""
              ] }),
              U.has(t.status) && /* @__PURE__ */ n(w, { onClick: (l) => {
                l.stopPropagation(), re(t.id);
              }, children: "Cancel" })
            ]
          }
        ) }, t.id)) }),
        /* @__PURE__ */ n("div", { style: { flex: 1, minWidth: 0 }, children: z ? U.has(z.status) ? /* @__PURE__ */ n(
          Qe,
          {
            run: z,
            stage: ((se = te[z.id]) == null ? void 0 : se.stage) ?? (z.status === "queued" ? "queued" : "reviewing"),
            chars: ((ce = te[z.id]) == null ? void 0 : ce.chars) ?? 0,
            avgDuration: Se,
            onCancel: () => re(z.id)
          }
        ) : /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ o("div", { style: { display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }, children: [
            z.prUrl && /* @__PURE__ */ n("a", { href: z.prUrl, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ n(j, { children: "Open PR" }) }),
            z.status === "done" && /* @__PURE__ */ n(
              w,
              {
                onClick: () => Le(z.id),
                disabled: !!z.commentPosted,
                children: z.commentPosted ? "Comment posted" : "Post comment to PR"
              }
            )
          ] }),
          /* @__PURE__ */ n(Ve, { run: z })
        ] }) : /* @__PURE__ */ n(D, { title: "Select a review", children: "Pick a review on the left to see findings." }) })
      ] }),
      a === "knowledge" && /* @__PURE__ */ n(
        ge,
        {
          title: "Knowledge Base",
          description: "The standards the reviewer enforces. Upload or edit your coding-standard documents.",
          list: () => e.listKnowledge().then((t) => t.docs),
          read: (t) => e.readKnowledge(t).then((l) => l.content),
          save: (t, l) => e.saveKnowledge(t, l).then(() => {
          }),
          remove: (t) => e.deleteKnowledge(t).then(() => {
          })
        }
      ),
      a === "skills" && /* @__PURE__ */ n(
        ge,
        {
          title: "Review Skills",
          description: "How the reviewer should review — the method, separate from the standards.",
          list: () => e.listSkills().then((t) => t.skills),
          read: (t) => e.readSkill(t).then((l) => l.content),
          save: (t, l) => e.saveSkill(t, l).then(() => {
          }),
          remove: (t) => e.deleteSkill(t).then(() => {
          })
        }
      ),
      a === "settings" && /* @__PURE__ */ n(
        Ye,
        {
          config: p,
          onSaved: (t) => {
            b(t), Y(!!t.autoPostComment);
          }
        }
      )
    ] }),
    /* @__PURE__ */ n("style", { children: ".spin{animation:prspin 1s linear infinite}@keyframes prspin{to{transform:rotate(360deg)}}" })
  ] });
}
function tt({ run: e }) {
  const a = {
    queued: { label: "Queued", color: "#64748b" },
    running: { label: "Running", color: "#7c5cf6" },
    done: { label: "Done", color: "#22c55e" },
    error: { label: "Error", color: "#ef4444" },
    cancelled: { label: "Cancelled", color: "#64748b" }
  }[e.status];
  return /* @__PURE__ */ n(
    "span",
    {
      style: {
        background: a.color,
        color: "#0b0b12",
        borderRadius: 6,
        padding: "1px 7px",
        fontSize: 11,
        fontWeight: 700
      },
      children: a.label
    }
  );
}
function at(e) {
  const i = _e(e);
  return i.render(S(et)), () => i.unmount();
}
export {
  et as default,
  at as mount
};
