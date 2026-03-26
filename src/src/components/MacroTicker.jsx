import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API } from '../lib/api'

const ITEMS = [
  { key: 'KOSPI', label: 'KOSPI' },
  { key: 'KOSDAQ', label: 'KOSDAQ' },
  { key: 'NASDAQ', label: 'NASDAQ' },
  { key: 'S&P500', label: 'S&P 500' },
  { key: 'US10Y', label: 'US 10Y', isRate: true },
  { key: 'USD/KRW', label: 'USD/KRW' },
]

export default function MacroTicker() {
  const { colors, dark } = useTheme()
  const [data, setData] = useState(null)

  useEffect(() => {
    const load = () => {
      fetch(`${API}/api/macro-ticker`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d && Object.keys(d).length > 0) setData(d) })
        .catch(() => {})
    }
    load()
    const iv = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [])

  if (!data) return null

  const visibleItems = ITEMS.filter(i => data[i.key])
  if (visibleItems.length === 0) return null

  const cardBg = dark ? '#141416' : '#FFFFFF'
  const cardBorder = dark ? '#1E1E22' : '#F0F0F2'

  return (
    <div className="macro-scroll" style={{
      display: 'flex', gap: 6,
      overflowX: 'auto', WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
      padding: '1px 0', marginBottom: 14,
    }}>
      <style>{`
        .macro-scroll::-webkit-scrollbar { display: none; }
        .macro-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .macro-card:active { transform: scale(0.97); }
      `}</style>
      {visibleItems.map((item) => {
        const d = data[item.key]
        const isUp = d.change > 0
        const isDown = d.change < 0
        const noChange = d.change === 0
        const accentColor = isUp ? '#DC2626' : isDown ? '#2563EB' : (dark ? '#3F3F46' : '#D4D4D8')

        let displayValue
        if (item.isRate) {
          displayValue = d.value.toFixed(2) + '%'
        } else if (d.value >= 1000) {
          displayValue = d.value.toLocaleString(undefined, { maximumFractionDigits: 0 })
        } else {
          displayValue = d.value.toFixed(2)
        }

        return (
          <div key={item.key} className="macro-card" style={{
            flexShrink: 0, minWidth: 108,
            padding: '10px 12px',
            borderRadius: 12,
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* 상단 액센트 라인 */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 2, background: accentColor,
              opacity: noChange ? 0.3 : 0.8,
            }} />

            {/* 라벨 */}
            <div style={{
              fontSize: 10, fontWeight: 700,
              color: dark ? '#52525B' : '#A1A1AA',
              letterSpacing: '0.06em',
              marginBottom: 6,
            }}>{item.label}</div>

            {/* 숫자 */}
            <div style={{
              fontSize: 16, fontWeight: 800, fontFamily: FONTS.mono,
              color: dark ? '#F5F5F0' : '#18181B',
              letterSpacing: '-0.03em',
              lineHeight: 1, marginBottom: 4,
            }}>{displayValue}</div>

            {/* 변동률 */}
            {!noChange ? (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 2,
                fontSize: 11, fontWeight: 700, fontFamily: FONTS.mono,
                color: accentColor,
              }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill={accentColor}>
                  {isUp
                    ? <path d="M4 1L7 6H1L4 1Z" />
                    : <path d="M4 7L1 2H7L4 7Z" />
                  }
                </svg>
                {Math.abs(d.change).toFixed(2)}%
              </div>
            ) : (
              <div style={{
                fontSize: 10, fontWeight: 600, fontFamily: FONTS.mono,
                color: dark ? '#3F3F46' : '#D4D4D8',
              }}>-</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
