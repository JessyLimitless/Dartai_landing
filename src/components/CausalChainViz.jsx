import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

/**
 * 4단 인과 사슬 시각화 — US Event ──→ Tech ──→ KR Ticker ──→ Disclosure
 *
 * Props:
 *   chain: { stage1_us, stage2_tech, stage3_kr, stage4_signal }
 *   sig:   { tier1_count, max_excess, category_count } (선택)
 */
export default function CausalChainViz({ chain, sig, height = 120 }) {
  const { colors, dark } = useTheme()
  if (!chain) return null

  const stages = [
    { key: 'us',       label: 'US Event',     value: chain.stage1_us,     accent: '#DC2626' },
    { key: 'tech',     label: 'Tech',          value: chain.stage2_tech,   accent: '#0EA5E9' },
    { key: 'kr',       label: 'KR Ticker',     value: chain.stage3_kr,     accent: '#0D9488' },
    { key: 'signal',   label: 'KR Disclosure', value: chain.stage4_signal, accent: '#E8364E' },
  ]

  const boxBg = dark ? '#0F0F11' : '#FAFAFA'
  const boxBorder = dark ? '#27272A' : '#E4E4E7'
  const arrowColor = dark ? '#52525B' : '#A1A1AA'

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', gap: 0,
      margin: '14px 0',
      overflowX: 'auto', WebkitOverflowScrolling: 'touch',
    }}>
      {stages.map((s, i) => (
        <React.Fragment key={s.key}>
          <div style={{
            flex: '1 1 0', minWidth: 140,
            padding: '12px 14px',
            background: boxBg,
            border: `1px solid ${boxBorder}`,
            borderLeft: `3px solid ${s.accent}`,
            borderRadius: 8,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: colors.textMuted,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {s.label}
            </div>
            <div style={{
              fontSize: 13, fontWeight: 600, color: colors.textPrimary,
              marginTop: 6, lineHeight: 1.4,
              wordBreak: 'keep-all',
            }}>
              {s.value || '-'}
            </div>
          </div>
          {i < stages.length - 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 24, color: arrowColor, fontSize: 18,
            }}>
              →
            </div>
          )}
        </React.Fragment>
      ))}
      {sig && (sig.tier1_count > 0 || sig.max_excess > 5) && (
        <div style={{
          marginLeft: 12, padding: '10px 12px',
          background: '#FEF3C7', border: `1px solid #F59E0B`,
          borderRadius: 8, minWidth: 110,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', letterSpacing: '0.06em' }}>
            STRENGTH
          </div>
          {sig.tier1_count > 0 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginTop: 4 }}>
              ★ TIER 1 × {sig.tier1_count}
            </div>
          )}
          <div style={{ fontSize: 11, color: '#92400E', marginTop: 2 }}>
            초과수익 +{sig.max_excess}%
          </div>
        </div>
      )}
    </div>
  )
}
