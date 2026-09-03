import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useTheme } from '../contexts/ThemeContext'
import { API, secretHeaders } from '../lib/api'
import { isAdmin } from './AdminPage'

/* 관리자 리포팅 뷰어 — 점검·분석 리포트를 마크다운 원문 그대로 띄운다.
 *
 * 🔒 __여기는 픽 원문과 같은 등급의 비밀이다.__ 리포트에는 수익률·게이트
 *    점수대별 성과·종목명이 들어 있다(CLAUDE.md 영업비밀 HARD RULE).
 *
 * ⚠️ 아래 `isAdmin()` 리다이렉트는 __보안이 아니라 UX__ 다. 진짜 경계는
 *    `/api/admin/reports` 의 403 이고, 그건 서버에서 이미 잠갔다. 프론트
 *    게이트를 보안으로 착각한 게 2026-08-22 유출의 원인이었다 — 같은 실수를
 *    여기서 반복하지 않기 위해 목록조차 API 가 잠근 뒤에 이 화면을 붙였다.
 */

const FONT_SANS = 'Pretendard, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
const FONT_MONO = '"JetBrains Mono", "Fira Code", monospace'
const SIDEBAR_W = 300
const READING_MAX = 900   // 표가 많아 책(760)보다 넓게 잡는다

export default function ReportViewer() {
  const { colors, dark } = useTheme()
  const navigate = useNavigate()
  const { slug } = useParams()

  const [list, setList] = useState(null)
  const [doc, setDoc] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [docLoading, setDocLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { if (!isAdmin()) navigate('/') }, [navigate])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 목록
  useEffect(() => {
    let alive = true
    setLoading(true)
    fetch(`${API}/api/admin/reports`, { headers: secretHeaders() })
      .then(async r => {
        const d = await r.json().catch(() => ({}))
        if (!alive) return
        // 403 = 서버가 잠갔다. 로그인 세션이 없거나 만료된 것이다.
        if (r.status === 403) { setErr('locked'); setList({ reports: [] }); return }
        if (!r.ok) { setErr(d.detail || '목록을 불러오지 못했습니다'); setList({ reports: [] }); return }
        setList(d)
      })
      .catch(() => { if (alive) { setErr('네트워크 오류'); setList({ reports: [] }) } })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  // 본문 — slug 없으면 목록의 최신 1건을 자동으로 연다
  const targetSlug = slug || list?.reports?.[0]?.slug || ''
  useEffect(() => {
    if (!targetSlug) { setDoc(null); return }
    let alive = true
    setDocLoading(true)
    fetch(`${API}/api/admin/reports/${encodeURIComponent(targetSlug)}`, { headers: secretHeaders() })
      .then(async r => {
        const d = await r.json().catch(() => ({}))
        if (!alive) return
        if (!r.ok) { setErr(r.status === 403 ? 'locked' : (d.detail || '리포트를 불러오지 못했습니다')); setDoc(null); return }
        setDoc(d); setErr('')
      })
      .catch(() => { if (alive) setErr('네트워크 오류') })
      .finally(() => { if (alive) setDocLoading(false) })
    return () => { alive = false }
  }, [targetSlug])

  const openDoc = useCallback((s) => {
    setSidebarOpen(false)
    navigate(`/admin/report/${s}`)
  }, [navigate])

  // 본문의 ## 제목 → 목차
  //
  // ⚠️ 제목 안의 마크다운 기호를 __반드시 벗긴다.__ 안 벗기면 목차에
  //    `2. 다트 픽을 통한 **실제 투자** 수익률 점검` 처럼 별표가 그대로 뜬다
  //    (2026-09-04 첫 배포에서 실제로 그랬다). 본문은 렌더러가 처리하지만
  //    목차는 raw 문자열을 그대로 쓰므로 여기서만 따로 정리해야 한다.
  const outline = useMemo(() => {
    if (!doc?.content) return []
    return doc.content.split('\n')
      .filter(l => /^##\s+/.test(l))
      .map(l => l.replace(/^##\s+/, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')   // 굵게
        .replace(/__(.+?)__/g, '$1')       // 밑줄
        .replace(/`(.+?)`/g, '$1')         // 인라인 코드
        .replace(/~~(.+?)~~/g, '$1')       // 취소선
        .trim())
  }, [doc])

  const border = dark ? '#2a2f3a' : '#e5e7eb'
  const subtle = dark ? '#161a22' : '#f8fafc'

  const md = {
    h1: ({ children }) => (
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: '4px 0 18px', lineHeight: 1.35,
        color: colors.textPrimary, letterSpacing: '-0.02em' }}>{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ fontSize: 19, fontWeight: 700, margin: '38px 0 14px', paddingBottom: 8,
        borderBottom: `2px solid ${border}`, color: colors.textPrimary }}>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontSize: 15.5, fontWeight: 700, margin: '26px 0 10px',
        color: colors.textPrimary }}>{children}</h3>
    ),
    p: ({ children }) => (
      <p style={{ fontSize: 14.5, lineHeight: 1.85, margin: '0 0 14px',
        color: colors.textSecondary || colors.textPrimary }}>{children}</p>
    ),
    // 표가 리포트의 본체다 — 가로 스크롤 컨테이너에 넣어 본문이 안 밀리게 한다
    table: ({ children }) => (
      <div style={{ overflowX: 'auto', margin: '0 0 20px', border: `1px solid ${border}`,
        borderRadius: 8, WebkitOverflowScrolling: 'touch' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13,
          minWidth: 460 }}>{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead style={{ background: subtle }}>{children}</thead>,
    th: ({ children, style }) => (
      <th style={{ padding: '9px 12px', textAlign: style?.textAlign || 'left', fontWeight: 700,
        color: colors.textPrimary, borderBottom: `1px solid ${border}`, whiteSpace: 'nowrap' }}>{children}</th>
    ),
    td: ({ children, style }) => (
      <td style={{ padding: '9px 12px', textAlign: style?.textAlign || 'left',
        color: colors.textSecondary || colors.textPrimary,
        borderBottom: `1px solid ${border}`, verticalAlign: 'top' }}>{children}</td>
    ),
    code: ({ inline, children }) => inline
      ? <code style={{ fontFamily: FONT_MONO, fontSize: 12.5, padding: '1px 5px', borderRadius: 4,
          background: subtle, color: dark ? '#e2b714' : '#b45309' }}>{children}</code>
      : <code style={{ fontFamily: FONT_MONO, fontSize: 12.5, lineHeight: 1.65 }}>{children}</code>,
    pre: ({ children }) => (
      <pre style={{ background: dark ? '#0d1117' : '#f6f8fa', border: `1px solid ${border}`,
        borderRadius: 8, padding: 14, overflowX: 'auto', margin: '0 0 18px',
        color: colors.textPrimary }}>{children}</pre>
    ),
    blockquote: ({ children }) => (
      <blockquote style={{ margin: '0 0 18px', padding: '10px 16px', borderLeft: `3px solid ${colors.accent || '#DC2626'}`,
        background: subtle, borderRadius: '0 8px 8px 0', color: colors.textSecondary }}>{children}</blockquote>
    ),
    li: ({ children }) => (
      <li style={{ fontSize: 14.5, lineHeight: 1.8, marginBottom: 6,
        color: colors.textSecondary || colors.textPrimary }}>{children}</li>
    ),
    strong: ({ children }) => <strong style={{ fontWeight: 700, color: colors.textPrimary }}>{children}</strong>,
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noreferrer"
        style={{ color: '#2563EB', textDecoration: 'none', borderBottom: '1px solid #93c5fd' }}>{children}</a>
    ),
    hr: () => <hr style={{ border: 0, borderTop: `1px solid ${border}`, margin: '30px 0' }} />,
  }

  if (err === 'locked') {
    return (
      <div style={{ maxWidth: 520, margin: '80px auto', padding: 24, textAlign: 'center', fontFamily: FONT_SANS }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🔒</div>
        <h2 style={{ color: colors.textPrimary, marginBottom: 10 }}>잠긴 리포트입니다</h2>
        <p style={{ color: colors.textMuted, fontSize: 13.5, lineHeight: 1.75 }}>
          리포트에는 수익률·선정 로직·종목명이 들어 있어 서버에서 잠급니다.<br />
          관리자 계정으로 로그인하면 열립니다.
        </p>
        <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 14, lineHeight: 1.7 }}>
          이미 로그인했는데 이 화면이 보이면 세션이 만료된 것입니다 — 다시 로그인하세요.
        </p>
        <button onClick={() => navigate('/admin')}
          style={{ marginTop: 22, padding: '9px 18px', borderRadius: 8, border: `1px solid ${border}`,
            background: 'transparent', color: colors.textPrimary, cursor: 'pointer', fontSize: 13 }}>
          관리자로 돌아가기
        </button>
      </div>
    )
  }

  const reports = list?.reports || []

  const Sidebar = (
    <aside style={{
      width: SIDEBAR_W, flexShrink: 0, borderRight: `1px solid ${border}`,
      padding: '18px 14px', overflowY: 'auto',
      ...(isMobile ? {
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 60,
        background: colors.bgPrimary || (dark ? '#0f1218' : '#fff'),
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .22s ease', boxShadow: sidebarOpen ? '0 0 40px rgba(0,0,0,.35)' : 'none',
      } : { position: 'sticky', top: 0, height: '100vh' }),
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
        color: colors.textMuted, marginBottom: 12 }}>리포팅</div>
      {reports.map(r => {
        const active = r.slug === targetSlug
        return (
          <button key={r.slug} onClick={() => openDoc(r.slug)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', marginBottom: 6,
              padding: '10px 11px', borderRadius: 8, cursor: 'pointer',
              border: `1px solid ${active ? (colors.accent || '#DC2626') : 'transparent'}`,
              background: active ? subtle : 'transparent',
              color: colors.textPrimary, fontFamily: FONT_SANS,
            }}>
            <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, lineHeight: 1.45 }}>{r.title}</div>
            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
              {(r.updated_at || '').slice(0, 10)} · {r.size_kb}KB
            </div>
          </button>
        )
      })}
      {!loading && reports.length === 0 && (
        <div style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.7 }}>
          리포트가 없습니다.<br />`data/reports/*.md` 에 넣으면 여기 뜹니다.
        </div>
      )}
      {outline.length > 0 && (
        <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            color: colors.textMuted, marginBottom: 10 }}>목차</div>
          {outline.map((h, i) => (
            <div key={i} style={{ fontSize: 12, color: colors.textMuted,
              padding: '4px 0', lineHeight: 1.5 }}>{h}</div>
          ))}
        </div>
      )}
    </aside>
  )

  return (
    <div style={{ display: 'flex', fontFamily: FONT_SANS, minHeight: '100vh' }}>
      {Sidebar}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 55 }} />
      )}

      <main style={{ flex: 1, minWidth: 0, padding: isMobile ? '16px 16px 60px' : '28px 34px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)}
              style={{ padding: '6px 11px', borderRadius: 7, border: `1px solid ${border}`,
                background: 'transparent', color: colors.textPrimary, cursor: 'pointer', fontSize: 12 }}>
              ☰ 목록
            </button>
          )}
          <button onClick={() => navigate('/admin')}
            style={{ padding: '6px 11px', borderRadius: 7, border: `1px solid ${border}`,
              background: 'transparent', color: colors.textMuted, cursor: 'pointer', fontSize: 12 }}>
            ← 관리자
          </button>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5,
            border: `1px solid ${border}`, color: colors.textMuted, letterSpacing: '0.04em' }}>
            🔒 대외비 — 수익률·선정 로직 포함
          </span>
          {doc?.updated_at && (
            <span style={{ fontSize: 11.5, color: colors.textMuted, marginLeft: 'auto' }}>
              갱신 {doc.updated_at.slice(0, 16).replace('T', ' ')}
            </span>
          )}
        </div>

        {(loading || docLoading) && (
          <div style={{ color: colors.textMuted, fontSize: 13, padding: '40px 0' }}>불러오는 중…</div>
        )}
        {!loading && !docLoading && err && err !== 'locked' && (
          <div style={{ color: '#DC2626', fontSize: 13, padding: '40px 0' }}>{err}</div>
        )}
        {!docLoading && doc && (
          <article style={{ maxWidth: READING_MAX }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>{doc.content}</ReactMarkdown>
          </article>
        )}
        {!loading && !docLoading && !doc && !err && (
          <div style={{ color: colors.textMuted, fontSize: 13, padding: '40px 0' }}>
            왼쪽에서 리포트를 고르세요.
          </div>
        )}
      </main>
    </div>
  )
}
