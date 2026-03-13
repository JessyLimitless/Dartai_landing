import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { apiFetch } from '../lib/api'

const STRATEGIES = [
  { key: 'golden_cross', label: '골든크로스', icon: '📈', color: '#F59E0B', desc: '5일선↑ 20일선 돌파' },
  { key: 'bollinger',    label: '볼린저 반등', icon: '↩',  color: '#3B82F6', desc: '밴드 하단 복귀' },
  { key: 'volume_surge', label: '거래량 폭발', icon: '🔥', color: '#10B981', desc: '20일 평균 3배+' },
  { key: 'breakout',     label: '신고가 돌파', icon: '🏆', color: '#EF4444', desc: '52주 고가 근접' },
]

export default function QuantPage({ onViewCard }) {
  const { colors, dark } = useTheme()
  const [active, setActive] = useState('golden_cross')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/quant/signals')
      .then(res => setData(res.strategies || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const meta = STRATEGIES.find(s => s.key === active)
  const items = (data[active] || []).slice(0, 15)
  const totalAll = STRATEGIES.reduce((s, st) => s + (data[st.key]?.length || 0), 0)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px', fontFamily: FONTS.body }}>

      {/* 헤더 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: FONTS.serif, fontSize: 20, fontWeight: 700, color: colors.textPrimary }}>
            퀀트 신호
          </span>
          {!loading && totalAll > 0 && (
            <span style={{
              background: '#0D9488', color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '2px 8px',
              borderRadius: 20,
            }}>{totalAll}개 감지</span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>
          전 증시 종목 대상 · 4가지 기술적 신호
        </p>
      </div>

      {/* 전략 탭 — 심플한 4개 버튼 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {STRATEGIES.map(s => {
          const isActive = active === s.key
          const cnt = data[s.key]?.length || 0
          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
                border: isActive ? `1.5px solid ${s.color}` : `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
                background: isActive
                  ? (dark ? `${s.color}18` : `${s.color}10`)
                  : (dark ? '#18181B' : '#fff'),
                color: isActive ? s.color : colors.textSecondary,
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              {s.label}
              {cnt > 0 && (
                <span style={{
                  background: isActive ? s.color : (dark ? '#27272A' : '#F4F4F5'),
                  color: isActive ? '#fff' : colors.textMuted,
                  fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 8,
                  minWidth: 18, textAlign: 'center',
                }}>{cnt}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* 전략 설명 라인 */}
      <div style={{
        fontSize: 12, color: colors.textMuted,
        marginBottom: 20, paddingLeft: 2,
      }}>
        {meta?.desc}
      </div>

      {/* 종목 리스트 */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              height: 56, borderRadius: 10,
              background: dark ? '#18181B' : '#F9FAFB',
              border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
              animation: 'pulse 1.4s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          color: colors.textMuted, fontSize: 14,
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
          신호 없음
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, idx) => {
            const strength = item.signal_strength || 0
            const change = item.change_pct
            const changeColor = change > 0 ? '#059669' : change < 0 ? '#2563EB' : '#71717A'

            return (
              <div
                key={item.stock_code}
                onClick={() => onViewCard?.(item.stock_code)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                  background: dark ? '#18181B' : '#fff',
                  border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = meta.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = dark ? '#27272A' : '#E4E4E7'}
              >
                {/* 순위 */}
                <span style={{
                  fontFamily: FONTS.mono, fontSize: 11,
                  color: colors.textMuted, width: 18, textAlign: 'right', flexShrink: 0,
                }}>{idx + 1}</span>

                {/* 신호 강도 바 */}
                <div style={{
                  width: 3, height: 36, borderRadius: 2, flexShrink: 0,
                  background: `linear-gradient(to top, ${meta.color}40, ${meta.color})`,
                  opacity: 0.4 + (strength / 100) * 0.6,
                }} />

                {/* 종목명 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600, fontSize: 14,
                    color: dark ? '#FAFAFA' : '#18181B',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.corp_name || item.stock_code}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                    {item.stock_code}
                  </div>
                </div>

                {/* 신호 강도 */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                }}>
                  <div style={{
                    width: 60, height: 4, borderRadius: 2,
                    background: dark ? '#27272A' : '#F4F4F5', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${strength}%`, height: '100%', borderRadius: 2,
                      background: meta.color, transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <span style={{
                    fontFamily: FONTS.mono, fontSize: 11, color: meta.color,
                    fontWeight: 700, width: 28, textAlign: 'right',
                  }}>{Math.round(strength)}</span>
                </div>

                {/* 등락률 */}
                <span style={{
                  fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700,
                  color: changeColor, width: 64, textAlign: 'right', flexShrink: 0,
                }}>
                  {change == null ? '—' : `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  )
}
