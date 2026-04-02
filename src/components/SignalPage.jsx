import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const API = import.meta.env.VITE_API_URL || ''

export default function SignalPage() {
  const { dark, colors } = useTheme()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/impact`)
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const t = {
    red: '#F04452', blue: '#3182F6',
    dim: dark ? '#555' : '#ADB5BD',
    bg: dark ? '#000' : '#F4F5F7',
    card: dark ? '#1C1C1E' : '#FFF',
    border: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
  }

  const total = items.reduce((a, i) => a + i.count, 0)

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

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: t.dim, fontSize: 13 }}>분석 중...</div>
      ) : (
        <div style={{
          margin: '12px 16px', borderRadius: 16, overflow: 'hidden',
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
                {/* 순위 */}
                <span style={{
                  width: 20, fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono,
                  color: idx < 3 && up ? t.red : t.dim,
                  textAlign: 'center', flexShrink: 0,
                }}>{idx + 1}</span>

                {/* 유형 + 승률 바 */}
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
                        background: wr >= 60 ? t.red : wr >= 50 ? '#FF8A3D' : (dark ? 'rgba(255,255,255,0.1)' : '#D1D5DB'),
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, fontFamily: FONTS.mono,
                      color: wr >= 60 ? t.red : wr >= 50 ? '#FF8A3D' : t.dim,
                      width: 28, textAlign: 'right', flexShrink: 0,
                    }}>{wr.toFixed(0)}%</span>
                  </div>
                </div>

                {/* 초과수익률 */}
                <span style={{
                  fontSize: 16, fontWeight: 900, fontFamily: FONTS.mono,
                  color: accent, letterSpacing: '-0.5px', flexShrink: 0,
                }}>{up ? '+' : ''}{ex.toFixed(2)}%</span>
              </div>
            )
          })}
        </div>
      )}

      {/* 범례 */}
      {items.length > 0 && (
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
