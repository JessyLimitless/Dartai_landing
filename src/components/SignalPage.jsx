import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const API = import.meta.env.VITE_API_URL || ''

const GRADE_LABELS = { S: '핵심', A: '주요', D: '주의' }
const GRADE_COLORS = { S: '#F04452', A: '#3182F6', D: '#FF8A3D' }

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
    dim: dark ? '#555' : '#ADB5BD',
    bg: dark ? '#000' : '#F4F5F7',
    card: dark ? '#1C1C1E' : '#FFF',
    border: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
  }

  const total = items.reduce((a, i) => a + i.count, 0)

  // 히트맵: 유형 목록 + 등급 목록
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
      <div style={{ padding: '32px 20px 8px' }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, color: colors.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>
          공시 시그널
        </h1>
        <p style={{ fontSize: 13, color: t.dim, margin: '4px 0 0', letterSpacing: '-0.2px' }}>
          공시 유형별 초과수익률 · {total.toLocaleString()}건 분석
        </p>
      </div>

      {/* 탭 */}
      <div style={{
        display: 'flex', gap: 4, padding: '8px 16px',
      }}>
        {[
          { key: 'rank', label: '순위' },
          { key: 'heatmap', label: '등급별' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px',
            background: tab === key ? (dark ? '#333' : '#18181B') : 'transparent',
            color: tab === key ? '#fff' : t.dim,
          }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: t.dim, fontSize: 13 }}>분석 중...</div>
      ) : tab === 'rank' ? (
        /* 순위 탭 */
        <div style={{
          margin: '8px 16px', borderRadius: 16, overflow: 'hidden',
          background: t.card, border: `1px solid ${t.border}`,
        }}>
          {items.map((item, idx) => {
            const ex = item.avg_excess_close || 0
            const up = ex >= 0
            const wr = item.win_rate || 0
            const accent = up ? t.red : t.blue
            const last = idx === items.length - 1

            return (
              <div key={item.type} style={{
                display: 'flex', alignItems: 'center',
                padding: '14px 16px',
                borderBottom: last ? 'none' : `1px solid ${t.border}`,
              }}>
                <span style={{
                  width: 20, fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono,
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
                  color: accent, letterSpacing: '-0.5px', flexShrink: 0,
                }}>{up ? '+' : ''}{ex.toFixed(2)}%</span>
              </div>
            )
          })}
        </div>
      ) : (
        /* 히트맵 탭 */
        <div style={{ margin: '8px 16px' }}>
          {/* 헤더 */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 56px 56px 56px',
            gap: 4, marginBottom: 4,
          }}>
            <div />
            {hmGrades.map(g => (
              <div key={g} style={{
                textAlign: 'center', fontSize: 11, fontWeight: 800,
                color: GRADE_COLORS[g], padding: '8px 0',
              }}>
                {g}<span style={{ fontSize: 9, fontWeight: 500, color: t.dim, marginLeft: 2 }}>{GRADE_LABELS[g]}</span>
              </div>
            ))}
          </div>

          {/* 행 */}
          {hmTypes.map((type, ti) => (
            <div key={type} style={{
              display: 'grid', gridTemplateColumns: '1fr 56px 56px 56px',
              gap: 4, marginBottom: 4,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                fontSize: 13, fontWeight: 700, color: colors.textPrimary,
                padding: '0 8px', letterSpacing: '-0.2px',
              }}>{type}</div>
              {hmGrades.map(g => {
                const cell = hmMap[`${type}_${g}`]
                if (!cell) {
                  return (
                    <div key={g} style={{
                      borderRadius: 10, padding: '10px 4px', textAlign: 'center',
                      background: dark ? 'rgba(255,255,255,0.02)' : '#F8F8F9',
                      fontSize: 10, color: t.dim,
                    }}>-</div>
                  )
                }
                const wr = cell.win_rate
                const ex = cell.avg_excess
                // 색상 강도: 승률 기반
                const intensity = Math.min((wr - 30) / 40, 1) // 30~70% → 0~1
                const bgColor = ex >= 0
                  ? `rgba(240,68,82,${Math.max(intensity * 0.15, 0.02)})`
                  : `rgba(49,130,246,${Math.max(Math.abs(intensity) * 0.15, 0.02)})`

                return (
                  <div key={g} style={{
                    borderRadius: 10, padding: '8px 4px', textAlign: 'center',
                    background: bgColor,
                    border: `1px solid ${t.border}`,
                  }}>
                    <div style={{
                      fontSize: 14, fontWeight: 900, fontFamily: FONTS.mono,
                      color: wr >= 50 ? t.red : t.blue,
                      lineHeight: 1,
                    }}>{wr.toFixed(0)}%</div>
                    <div style={{
                      fontSize: 9, color: t.dim, marginTop: 3, fontFamily: FONTS.mono,
                    }}>{cell.count}건</div>
                  </div>
                )
              })}
            </div>
          ))}

          {/* 범례 */}
          <div style={{
            marginTop: 12, padding: '10px 12px', borderRadius: 10,
            background: t.card, border: `1px solid ${t.border}`,
            fontSize: 11, color: t.dim, lineHeight: 1.7,
          }}>
            숫자 = 초과수익률 {'>'} 0인 비율 (승률)
            <br />
            <span style={{ color: t.red }}>빨강</span> = 50%+ 승률 · <span style={{ color: t.blue }}>파랑</span> = 50% 미만
          </div>
        </div>
      )}

      {/* 하단 */}
      {items.length > 0 && tab === 'rank' && (
        <div style={{
          margin: '8px 16px', padding: '12px 16px', borderRadius: 12,
          background: t.card, border: `1px solid ${t.border}`,
          fontSize: 11, color: t.dim, lineHeight: 1.7, letterSpacing: '-0.2px',
        }}>
          초과수익률 = 종목 수익률 - 시장 수익률
          <br />
          승률 = 초과수익률 {'>'} 0인 비율 · 과거 데이터 기반
        </div>
      )}
    </div>
  )
}
