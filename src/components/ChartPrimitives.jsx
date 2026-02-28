import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { PREMIUM } from '../constants/theme'

/**
 * StyledTooltip — premium chart tooltip with shadow + rounded corners
 * Usage: <Tooltip content={<StyledTooltip />} /> or spread contentStyle
 */
export function StyledTooltip({ active, payload, label, formatter }) {
  const { colors, dark } = useTheme()
  if (!active || !payload || payload.length === 0) return null

  return (
    <div style={{
      backgroundColor: dark ? '#27272A' : '#fff',
      padding: '10px 14px',
      borderRadius: '10px',
      border: 'none',
      boxShadow: PREMIUM.shadowLg,
      fontSize: '12px',
      color: colors.textPrimary,
      lineHeight: 1.5,
    }}>
      {label && (
        <div style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', color: colors.textSecondary }}>
          {label}
        </div>
      )}
      {payload.map((entry, i) => {
        const [val, name] = formatter ? formatter(entry.value, entry.name) : [entry.value, entry.name]
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '2px',
              backgroundColor: entry.color || entry.fill,
            }} />
            <span style={{ color: colors.textMuted, fontSize: '11px' }}>{name}</span>
            <span style={{ fontWeight: 600, marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>
              {val}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * tooltipStyle — inline contentStyle for Recharts <Tooltip>
 */
export function tooltipStyle(colors, dark) {
  return {
    backgroundColor: dark ? '#27272A' : '#fff',
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    boxShadow: PREMIUM.shadowLg,
    fontSize: '12px',
    color: colors.textPrimary,
  }
}

/**
 * chartGrid — CartesianGrid props helper
 */
export function chartGrid(dark) {
  return {
    strokeDasharray: '3 3',
    stroke: dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0',
    vertical: false,
  }
}

/**
 * chartAxis — XAxis/YAxis common props
 */
export function chartAxis(colors) {
  return {
    tick: { fontSize: 10, fill: colors.textMuted },
    axisLine: false,
    tickLine: false,
  }
}
