import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, getBoxStyle } from '../constants/theme'

const API = import.meta.env.VITE_API_URL || ''

// 한국 컨벤션: 상승=빨강, 하락=파랑
const UP = '220,38,38'      // #DC2626
const DOWN = '37,99,235'    // #2563EB

// 미국 무버 %를 색 강도로 (12%+ = 최대 강도)
function moveStyle(change, dark) {
  if (change == null || isNaN(change)) {
    return { bg: dark ? '#1A1A1E' : '#F1F1F3', fg: dark ? '#6B6B72' : '#A1A1AA' }
  }
  const up = change >= 0
  const mag = Math.min(Math.abs(change) / 12, 1)
  const alpha = 0.14 + mag * 0.76
  const base = up ? UP : DOWN
  const strong = alpha > 0.52
  return {
    bg: `rgba(${base},${alpha})`,
    fg: strong ? '#fff' : (up ? '#DC2626' : '#2563EB'),
  }
}

// 한국 수혜 등급 색
const GRADE = {
  '1차': { bg: '#0D9488', label: '1차' },
  '간접': { bg: '#EA7B3C', label: '간접' },
  '연상': { bg: '#3182F6', label: '연상' },
  '연상·적자': { bg: '#B45309', label: '연상·적자' },
}

function fmtPct(v) {
  if (v == null || isNaN(v)) return '—'
  return (v > 0 ? '+' : '') + v.toFixed(1) + '%'
}

function agoLabel(iso) {
  if (!iso) return ''
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  return `${Math.round(mins / 60)}시간 전`
}

export default function USMarketPage() {
  const { dark, colors } = useTheme()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(false)

  useEffect(() => {
    let alive = true
    fetch(`${API}/api/global/causal-map`)
      .then(r => r.json())
      .then(d => { if (alive) { setData(d); setLoading(false) } })
      .catch(() => { if (alive) { setErr(true); setLoading(false) } })
    return () => { alive = false }
  }, [])

  const t = {
    sub: dark ? '#8A8A93' : '#71717A',
    dim: dark ? '#5E5E66' : '#A1A1AA',
    line: dark ? '#232328' : '#EEEEF0',
    chipBg: dark ? '#161619' : '#F7F7F9',
  }

  // 🔑 하이닉스 ADR 하이라이트 — memory 카테고리에서 추출
  let hynix = null, memPair = []
  if (data) {
    const mem = data.categories?.find(c => c.key === 'memory')
    if (mem) {
      hynix = mem.us.find(m => m.ticker === 'SKHY')
      memPair = mem.us.filter(m => ['MU', 'WDC'].includes(m.ticker))
    }
  }

  const cats = data?.categories || []
  const core = cats.filter(c => c.tier === 'core')
  const sat = cats.filter(c => c.tier === 'satellite')

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 16px 64px', fontFamily: FONTS.body }}>
      {/* ── 헤더 ── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#DC2626', textTransform: 'uppercase' }}>
          US MARKET → KOREA
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: colors.textPrimary, margin: '6px 0 4px', fontFamily: FONTS.serif, letterSpacing: '-0.01em' }}>
          미국장, 한국으로 번역해 드립니다
        </h1>
        <p style={{ fontSize: 14, color: t.sub, margin: 0, lineHeight: 1.5 }}>
          미국 증시를 보는 게 아니라, <b style={{ color: colors.textPrimary }}>미국이 한국 어디에 꽂히는지</b>를 봅니다. 미국 무버 %는 <b style={{ color: colors.textPrimary }}>키움 실측</b>.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          {data?.updated && (
            <span style={{ fontSize: 12, color: t.dim }}>실측 {agoLabel(data.updated)}</span>
          )}
          <button onClick={() => navigate('/us-beneficiary')}
            style={{
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              color: '#DC2626', background: dark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.06)',
              border: 'none', borderRadius: 8, padding: '6px 12px',
            }}>
            오늘의 미국 편지 전문 →
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: 60, textAlign: 'center', color: t.dim, fontSize: 14 }}>불러오는 중…</div>
      )}
      {err && (
        <div style={{ padding: 60, textAlign: 'center', color: t.dim, fontSize: 14 }}>데이터를 불러오지 못했습니다.</div>
      )}

      {data && (
        <>
          {/* ── 🔑 하이닉스 ADR 하이라이트 ── */}
          {hynix && (
            <div style={{ ...getBoxStyle(dark, 'section'), padding: '18px 20px', marginTop: 18, marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: '#DC2626' }}>🔑 가장 중요한 변수</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: colors.textPrimary, marginTop: 4 }}>
                    SK하이닉스 ADR <span style={{ fontFamily: FONTS.mono, fontWeight: 600, color: t.sub, fontSize: 13 }}>SKHY · 나스닥</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: t.sub, marginTop: 4, lineHeight: 1.5 }}>
                    밤사이 미국에서 먼저 열려 <b style={{ color: colors.textPrimary }}>오늘 한국 하이닉스 개장을 직독</b>합니다.
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 34, fontWeight: 800, fontFamily: FONTS.mono, lineHeight: 1,
                    color: hynix.change >= 0 ? '#DC2626' : '#2563EB',
                  }}>
                    {fmtPct(hynix.change)}
                  </div>
                  {memPair.length > 0 && (
                    <div style={{ fontSize: 12, color: t.sub, marginTop: 6 }}>
                      메모리 쌍 {memPair.map(m => `${m.name} ${fmtPct(m.change)}`).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── 범례 ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, flexWrap: 'wrap', fontSize: 11.5, color: t.sub }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: `rgba(${UP},0.85)` }} /> 상승
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: `rgba(${DOWN},0.85)` }} /> 하락
            </span>
            <span style={{ color: t.dim }}>│</span>
            {Object.entries(GRADE).map(([k, v]) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.bg }} /> {v.label}
              </span>
            ))}
          </div>

          {/* ── 핵심(core) 밸류체인 ── */}
          <SectionLabel dark={dark} colors={colors}>AI 밸류체인 — 실체 동력 (core)</SectionLabel>
          {core.map(cat => <ChainRow key={cat.key} cat={cat} dark={dark} colors={colors} t={t} />)}

          {/* ── 위성(satellite) 테마 ── */}
          <SectionLabel dark={dark} colors={colors} muted>테마·베타 (satellite) — 적자·연상 다수, 투기적</SectionLabel>
          {sat.map(cat => <ChainRow key={cat.key} cat={cat} dark={dark} colors={colors} t={t} />)}

          <div style={{ marginTop: 20, fontSize: 11.5, color: t.dim, lineHeight: 1.6 }}>
            미국 개별주 단일일 등락 = 키움 미국주식 API(usa20100) 실측 · 한국 수혜 매핑 = DART Insight causal-map. 투자 판단과 책임은 이용자에게 있습니다.
          </div>
        </>
      )}
    </div>
  )
}

function SectionLabel({ children, dark, colors, muted }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 800, letterSpacing: '0.04em',
      color: muted ? (dark ? '#7A7A82' : '#9A9AA2') : colors.textPrimary,
      margin: '22px 0 10px', textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

function ChainRow({ cat, dark, colors, t }) {
  const box = getBoxStyle(dark, 'section')
  return (
    <div style={{ ...box, padding: '14px 16px', marginBottom: 10 }}>
      {/* 카테고리 헤더 */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: colors.textPrimary }}>{cat.label}</span>
        {cat.note && <span style={{ fontSize: 11.5, color: t.dim }}>{cat.note}</span>}
      </div>

      {/* 미국 무버 → 한국 수혜 (2단) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
        {/* 미국 무버 칩 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {cat.us.map(m => {
            const s = moveStyle(m.change, dark)
            return (
              <span key={m.ticker} title={m.name} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: s.bg, color: s.fg,
                borderRadius: 8, padding: '5px 9px', fontSize: 12.5, fontWeight: 700,
              }}>
                <span style={{ fontFamily: FONTS.mono }}>{m.ticker}</span>
                <span style={{ fontFamily: FONTS.mono, opacity: 0.95 }}>{fmtPct(m.change)}</span>
              </span>
            )
          })}
        </div>

        {/* 화살표 */}
        <div style={{ fontSize: 18, color: t.dim, padding: '0 2px' }}>→</div>

        {/* 한국 수혜 칩 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start' }}>
          {cat.kr.map(k => {
            const g = GRADE[k.grade] || { bg: '#71717A', label: k.grade }
            return (
              <span key={k.code} title={k.relation} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: t.chipBg, border: `1px solid ${t.line}`,
                borderRadius: 8, padding: '5px 9px', fontSize: 12.5, fontWeight: 600,
                color: colors.textPrimary,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: g.bg, flexShrink: 0 }} />
                {k.name}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
