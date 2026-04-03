import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const API = import.meta.env.VITE_API_URL || ''

const GRADE_META = {
  S: { label: '핵심', color: '#F04452' },
  A: { label: '주요', color: '#3182F6' },
  D: { label: '주의', color: '#FF8A3D' },
}

export default function SignalPage() {
  const { dark, colors } = useTheme()
  const [items, setItems] = useState([])
  const [heatmap, setHeatmap] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('rank')

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/impact`).then(r => r.json()),
      fetch(`${API}/api/impact/heatmap`).then(r => r.json()),
    ]).then(([d1, d2]) => {
      setItems(d1.items || [])
      setHeatmap(d2.cells || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const t = {
    red: '#F04452', blue: '#3182F6', orange: '#FF8A3D',
    dim: dark ? '#6B7280' : '#ADB5BD',
    sub: dark ? '#9CA3AF' : '#6B7684',
    bg: dark ? '#000' : '#F4F5F7',
    card: dark ? '#1C1C1E' : '#FFF',
    border: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    subtle: dark ? 'rgba(255,255,255,0.03)' : '#F8F8F9',
  }

  const total = items.reduce((a, i) => a + i.count, 0)

  // 히트맵 데이터 정리
  const hmTypes = [...new Set(heatmap.map(c => c.type))]
  const hmGrades = ['S', 'A', 'D']
  const hmMap = {}
  heatmap.forEach(c => { hmMap[`${c.type}_${c.grade}`] = c })

  return (
    <div className="page-enter" style={{
      maxWidth: 480, margin: '0 auto', minHeight: '100vh',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: t.bg,
    }}>
      {/* 헤더 */}
      <div style={{ padding: '32px 20px 0' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>
          공시 시그널
        </h1>
        <p style={{ fontSize: 13, color: t.sub, margin: '4px 0 0', letterSpacing: '-0.2px' }}>
          공시가 주가에 미치는 영향을 데이터로 확인해 보세요
        </p>
      </div>

      {/* 탭 */}
      <div style={{
        display: 'flex', margin: '16px 16px 0', padding: 3, borderRadius: 10,
        background: dark ? 'rgba(255,255,255,0.04)' : '#ECEEF0',
      }}>
        {[
          { key: 'rank', label: '초과수익률' },
          { key: 'heatmap', label: '등급별 승률' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px',
            background: tab === key ? t.card : 'transparent',
            color: tab === key ? colors.textPrimary : t.dim,
            boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* 표본 요약 */}
      <div style={{
        margin: '12px 16px 0', padding: '12px 16px', borderRadius: 12,
        background: t.card, border: `1px solid ${t.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: t.sub }}>분석 표본</span>
        <span style={{ fontSize: 15, fontWeight: 800, fontFamily: FONTS.mono, color: colors.textPrimary }}>
          {total.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 500, color: t.dim }}>건</span>
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: t.dim, fontSize: 13 }}>분석 중...</div>
      ) : tab === 'rank' ? (
        /* ── 초과수익률 순위 ── */
        <div style={{
          margin: '8px 16px', borderRadius: 16, overflow: 'hidden',
          background: t.card, border: `1px solid ${t.border}`,
        }}>
          {items.map((item, idx) => {
            const ex = item.avg_excess_close || 0
            const up = ex >= 0
            const wr = item.win_rate || 0
            const last = idx === items.length - 1

            return (
              <div key={item.type} style={{
                display: 'flex', alignItems: 'center',
                padding: '14px 16px',
                borderBottom: last ? 'none' : `1px solid ${t.border}`,
              }}>
                <span style={{
                  width: 22, fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono,
                  color: idx < 3 && up ? t.red : t.dim,
                  textAlign: 'center', flexShrink: 0,
                }}>{idx + 1}</span>

                <div style={{ flex: 1, margin: '0 14px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>{item.type}</span>
                    <span style={{ fontSize: 10, color: t.dim, fontFamily: FONTS.mono }}>{item.count}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <div style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: dark ? 'rgba(255,255,255,0.04)' : '#ECEEF0',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        width: `${Math.min(wr, 100)}%`,
                        background: wr >= 60 ? t.red : wr >= 50 ? t.orange : (dark ? 'rgba(255,255,255,0.1)' : '#D1D5DB'),
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, fontFamily: FONTS.mono,
                      color: wr >= 60 ? t.red : wr >= 50 ? t.orange : t.dim,
                      width: 28, textAlign: 'right', flexShrink: 0,
                    }}>{wr.toFixed(0)}%</span>
                  </div>
                </div>

                <span style={{
                  fontSize: 16, fontWeight: 900, fontFamily: FONTS.mono,
                  color: up ? t.red : t.blue, letterSpacing: '-0.5px', flexShrink: 0,
                }}>{up ? '+' : ''}{ex.toFixed(2)}%</span>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── 등급별 승률 히트맵 ── */
        <div style={{ margin: '8px 16px' }}>
          {/* 컬럼 헤더 */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 72px 72px 72px',
            gap: 6, marginBottom: 6, padding: '0 4px',
          }}>
            <div style={{ fontSize: 11, color: t.dim, padding: '8px 4px', fontWeight: 600 }}>공시 유형</div>
            {hmGrades.map(g => (
              <div key={g} style={{
                textAlign: 'center', padding: '8px 0',
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 800, color: GRADE_META[g].color,
                }}>{g}</span>
                <span style={{
                  fontSize: 9, color: t.dim, marginLeft: 3,
                }}>{GRADE_META[g].label}</span>
              </div>
            ))}
          </div>

          {/* 데이터 행 */}
          {hmTypes.map((type, ti) => (
            <div key={type} style={{
              display: 'grid', gridTemplateColumns: '1fr 72px 72px 72px',
              gap: 6, marginBottom: 6,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                fontSize: 13, fontWeight: 700, color: colors.textPrimary,
                padding: '0 4px', letterSpacing: '-0.3px',
              }}>{type}</div>

              {hmGrades.map(g => {
                const cell = hmMap[`${type}_${g}`]
                if (!cell) {
                  return (
                    <div key={g} style={{
                      borderRadius: 12, padding: '12px 4px', textAlign: 'center',
                      background: t.subtle,
                    }}>
                      <span style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.08)' : '#D4D4D8' }}>-</span>
                    </div>
                  )
                }

                const wr = cell.win_rate
                const ex = cell.avg_excess
                const isGood = wr >= 50

                // 배경 색상: 승률에 따라 강도 조절
                const alpha = Math.min(Math.max((Math.abs(wr - 50)) / 50, 0), 1) * 0.12 + 0.02
                const bgColor = isGood
                  ? `rgba(240,68,82,${alpha})`
                  : `rgba(49,130,246,${alpha})`

                return (
                  <div key={g} style={{
                    borderRadius: 12, padding: '10px 4px', textAlign: 'center',
                    background: bgColor,
                  }}>
                    <div style={{
                      fontSize: 16, fontWeight: 900, fontFamily: FONTS.mono,
                      color: isGood ? t.red : t.blue,
                      lineHeight: 1,
                    }}>{wr.toFixed(0)}<span style={{ fontSize: 10 }}>%</span></div>
                    <div style={{
                      fontSize: 9, color: t.dim, marginTop: 4, fontFamily: FONTS.mono,
                    }}>{ex >= 0 ? '+' : ''}{ex.toFixed(1)}% · {cell.count}건</div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* 안내 */}
      <div style={{
        margin: '8px 16px', padding: '12px 16px', borderRadius: 12,
        background: t.card, border: `1px solid ${t.border}`,
        fontSize: 11, color: t.dim, lineHeight: 1.7, letterSpacing: '-0.2px',
      }}>
        {tab === 'rank' ? (
          <>초과수익률 = 종목 수익률 - 시장 수익률<br />승률 = 초과수익률 {'>'} 0인 비율</>
        ) : (
          <>승률 = 해당 유형+등급 공시 후 시장 대비 상승한 비율<br />
          <span style={{ color: t.red }}>빨강</span> 50%+ · <span style={{ color: t.blue }}>파랑</span> 50% 미만 · 3건 미만은 제외</>
        )}
      </div>
    </div>
  )
}
