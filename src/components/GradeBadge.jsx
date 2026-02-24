import React from 'react'
import { GRADE_COLORS } from '../constants/theme'

const EXTRA_STYLES = {
  report: { bg: '#8b5cf6', color: '#fff', label: 'R' },
  signal: { bg: '#0D9488', color: '#fff', label: 'SG' },
  error: { bg: '#991B1B', color: '#fff', label: '!' },
}

export default function GradeBadge({ grade, size = 'sm' }) {
  const style = GRADE_COLORS[grade] || EXTRA_STYLES[grade] || { bg: '#94A3B8', color: '#fff', label: grade }
  const px = size === 'lg' ? '4px 10px' : '2px 8px'
  const fontSize = size === 'lg' ? '13px' : '11px'
  const borderRadius = size === 'lg' ? '6px' : '4px'

  return (
    <span
      style={{
        display: 'inline-block',
        padding: px,
        borderRadius,
        backgroundColor: style.bg,
        color: style.color,
        fontSize,
        fontWeight: 700,
        lineHeight: '1.4',
        letterSpacing: '0.02em',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {style.label || grade}
    </span>
  )
}
