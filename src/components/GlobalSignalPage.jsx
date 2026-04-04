import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'

const API = import.meta.env.VITE_API_URL || ''

const FORM_LABELS = {
  '8-K': '주요경영사항',
  '10-Q': '분기보고서',
  '10-K': '연간보고서',
  '4': '내부자거래',
  'SC 13D': '대량보유(경영참여)',
  'SC 13G': '대량보유(단순투자)',
  'SC 13D/A': '대량보유 정정',
}

const IMPACT_COLOR = { '직접': '#F04452', '간접': '#FF8A3D', '테마': '#3182F6' }

export default function GlobalSignalPage() {
  const { dark, colors } = useTheme()
  const [filings, setFilings] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/global/signals?days=7`)
      .then(r => r.json())
      .then(d => { setFilings(d.filings || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const t = {
    dim: dark ? '#555' : '#ADB5BD',
    bg: dark ? '#000' : '#F4F5F7',
    card: dark ? '#1C1C1E' : '#FFF',
    border: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
  }

  // 8-K를 상단에, Form 4를 하단에
  const sorted = [...filings].sort((a, b) => {
    const priority = { '8-K': 0, '10-Q': 1, '10-K': 2, 'SC 13D': 3, '4': 4 }
    const pa = priority[a.form] ?? 5
    const pb = priority[b.form] ?? 5
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return pa - pb
  })

  // 날짜별 그룹
  const grouped = {}
  sorted.forEach(f => {
    if (!grouped[f.date]) grouped[f.date] = []
    grouped[f.date].push(f)
  })

  return (
    <div className="page-enter" style={{
      maxWidth: 480, margin: '0 auto', minHeight: '100vh',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: t.bg,
    }}>
      <div style={{ padding: '32px 20px 0' }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, color: colors.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>
          Global Signal
        </h1>
        <p style={{ fontSize: 13, color: t.dim, margin: '4px 0 0' }}>
          미국 핵심 30개 기업 SEC 공시 · 한국 영향 종목
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: t.dim, fontSize: 13 }}>수집 중...</div>
      ) : filings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: t.dim, fontSize: 13 }}>최근 공시 없음</div>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} style={{ margin: '12px 16px 0' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.dim, marginBottom: 6, fontFamily: FONTS.mono }}>
              {date}
            </div>
            <div style={{ borderRadius: 14, overflow: 'hidden', background: t.card, border: `1px solid ${t.border}` }}>
              {items.map((f, idx) => {
                const isExpanded = expanded === `${date}_${idx}`
                const formLabel = FORM_LABELS[f.form] || f.form
                const isKey = f.form === '8-K' || f.form === '10-Q' || f.form === '10-K'

                return (
                  <div key={idx}
                    className="touch-press"
                    onClick={() => setExpanded(isExpanded ? null : `${date}_${idx}`)}
                    style={{
                      padding: '14px 16px', cursor: 'pointer',
                      borderBottom: idx < items.length - 1 ? `1px solid ${t.border}` : 'none',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Form 뱃지 */}
                      <span style={{
                        fontSize: 10, fontWeight: 700, fontFamily: FONTS.mono,
                        padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                        background: isKey ? 'rgba(240,68,82,0.08)' : (dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5'),
                        color: isKey ? '#F04452' : t.dim,
                      }}>{f.form}</span>

                      {/* 기업명 + 섹터 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>{f.company}</span>
                          <span style={{ fontSize: 10, color: t.dim }}>{f.ticker}</span>
                        </div>
                        <div style={{ fontSize: 11, color: t.dim, marginTop: 1 }}>{formLabel}</div>
                      </div>

                      {/* 섹터 */}
                      <span style={{
                        fontSize: 10, color: t.dim, fontWeight: 600, flexShrink: 0,
                      }}>{f.sector}</span>
                    </div>

                    {/* 확장: 한국 영향 종목 + 원문 링크 */}
                    {isExpanded && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, marginBottom: 6 }}>
                          한국 영향 종목
                        </div>
                        {f.kr_impact.map((kr, ki) => (
                          <div key={ki} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '5px 0',
                            borderBottom: ki < f.kr_impact.length - 1 ? `1px solid ${t.border}` : 'none',
                          }}>
                            <span style={{
                              fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                              color: IMPACT_COLOR[kr.impact] || t.dim,
                              background: `${IMPACT_COLOR[kr.impact] || '#999'}10`,
                            }}>{kr.impact}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{kr.corp_name}</span>
                            <span style={{ fontSize: 10, color: t.dim }}>{kr.relation}</span>
                          </div>
                        ))}
                        {f.url && (
                          <a href={f.url} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11, color: '#3182F6', marginTop: 8, display: 'block' }}>
                            SEC 원문 보기 →
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      <div style={{ margin: '12px 16px', padding: '10px 14px', borderRadius: 10, fontSize: 11, color: t.dim, lineHeight: 1.6 }}>
        SEC EDGAR 공시 원문 기반 · 8-K=주요경영사항 · 4=내부자거래
      </div>
    </div>
  )
}
