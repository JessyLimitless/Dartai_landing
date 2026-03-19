import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'
import { API } from '../lib/api'

export default function PatternPage() {
  const { colors, dark } = useTheme()
  const [patterns, setPatterns] = useState([])
  const [totalTracks, setTotalTracks] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('hit') // 'hit' | 'avg' | 'count'

  useEffect(() => {
    fetch(`${API}/api/disclosure-patterns`)
      .then(r => r.json())
      .then(d => {
        setPatterns(d.patterns || [])
        setTotalTracks(d.total_tracks || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const sorted = [...patterns].sort((a, b) => {
    if (sort === 'hit') return b.hit_rate - a.hit_rate || b.avg_change - a.avg_change
    if (sort === 'avg') return b.avg_change - a.avg_change
    return b.total - a.total
  })

  const lineSep = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>

      {/* 헤더 */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5 }}>
          공시 패턴 분석
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
          어떤 공시가 주가를 올리는가 · {totalTracks}건 추적 데이터 기반
        </div>
      </div>

      {/* 정렬 pill */}
      <div style={{
        display: 'flex', gap: 8, padding: '16px 24px',
      }}>
        {[
          { key: 'hit', label: '적중률순' },
          { key: 'avg', label: '수익률순' },
          { key: 'count', label: '건수순' },
        ].map(s => {
          const active = sort === s.key
          return (
            <button key={s.key} className="touch-press"
              onClick={() => setSort(s.key)}
              style={{
                padding: '7px 14px', borderRadius: 20, border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500,
                background: active ? (dark ? '#2A2A2E' : '#18181B') : (dark ? '#1A1A1E' : '#F4F4F5'),
                color: active ? (dark ? '#FAFAFA' : '#FFFFFF') : colors.textSecondary,
              }}>
              {s.label}
            </button>
          )
        })}
      </div>

      <div style={{ borderBottom: `1px solid ${lineSep}` }} />

      {/* 리스트 */}
      <div style={{ padding: '0 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '20px 0' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                height: 64, borderRadius: 12,
                background: dark ? '#18181B' : '#F4F4F5',
                animation: 'pulse 1.4s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 15, color: colors.textPrimary, fontWeight: 600 }}>
              추적 데이터가 쌓이면 패턴이 나타납니다
            </div>
          </div>
        ) : (
          sorted.map((p, i) => {
            const isPositive = p.avg_change > 0
            const changeColor = isPositive ? '#DC2626' : p.avg_change < 0 ? '#2563EB' : colors.textMuted
            const hitColor = p.hit_rate >= 60 ? '#DC2626' : p.hit_rate >= 40 ? colors.textPrimary : '#2563EB'

            return (
              <div key={p.type} style={{
                padding: '16px 0',
                borderBottom: i < sorted.length - 1 ? `1px solid ${lineSep}` : 'none',
              }}>
                {/* 1행: 순번 + 공시유형 + 적중률 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontSize: 15, fontWeight: 700, fontFamily: FONTS.mono,
                    color: i < 3 ? '#DC2626' : colors.textMuted,
                    minWidth: 22, textAlign: 'right',
                  }}>{i + 1}</span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 15, fontWeight: 700, color: colors.textPrimary,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{p.type}</div>
                    <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      {p.total}건 · {p.up}건 상승
                    </div>
                  </div>

                  {/* 우측: 적중률 + 평균 수익률 */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{
                      fontSize: 17, fontWeight: 800, fontFamily: FONTS.mono,
                      color: hitColor,
                    }}>{p.hit_rate}%</div>
                    <div style={{
                      fontSize: 12, fontFamily: FONTS.mono, color: changeColor,
                      marginTop: 2,
                    }}>
                      {p.avg_change > 0 ? '+' : ''}{p.avg_change}%
                    </div>
                  </div>
                </div>

                {/* 적중률 바 */}
                <div style={{
                  marginTop: 8, marginLeft: 34,
                  height: 4, borderRadius: 2,
                  background: dark ? '#1A1A1E' : '#F0F0F2',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: hitColor,
                    width: `${p.hit_rate}%`,
                    transition: 'width 0.5s ease',
                    opacity: 0.7,
                  }} />
                </div>
              </div>
            )
          })
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  )
}
