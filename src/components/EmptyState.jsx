import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { PREMIUM } from '../constants/theme'

const ICONS = {
  search: (color) => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="22" cy="22" r="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M31 31L38 38" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 22H26" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  ),
  calendar: (color) => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="12" width="32" height="28" rx="4" stroke={color} strokeWidth="2.5" />
      <path d="M8 20H40" stroke={color} strokeWidth="2.5" />
      <path d="M16 8V14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 8V14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="30" r="2" fill={color} opacity="0.4" />
    </svg>
  ),
  chart: (color) => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="28" width="6" height="12" rx="2" fill={color} opacity="0.3" />
      <rect x="18" y="20" width="6" height="20" rx="2" fill={color} opacity="0.5" />
      <rect x="28" y="14" width="6" height="26" rx="2" fill={color} opacity="0.7" />
      <rect x="38" y="24" width="2" height="16" rx="1" fill={color} opacity="0.2" />
      <path d="M6 42H42" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </svg>
  ),
}

export default function EmptyState({ icon = 'search', title, description, action, onAction }) {
  const { colors, dark } = useTheme()
  const iconColor = dark ? 'rgba(255,255,255,0.2)' : '#D4D4D8'
  const renderIcon = ICONS[icon] || ICONS.search

  return (
    <div className="content-fade-in" style={{
      padding: '60px 24px',
      textAlign: 'center',
      borderRadius: '16px',
      backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
      border: `1px dashed ${dark ? 'rgba(255,255,255,0.08)' : '#E4E4E7'}`,
    }}>
      <div style={{ marginBottom: '16px', opacity: 0.8 }}>
        {renderIcon(iconColor)}
      </div>
      {title && (
        <div style={{
          fontSize: '14px', fontWeight: 600, color: colors.textSecondary,
          marginBottom: '6px',
        }}>
          {title}
        </div>
      )}
      {description && (
        <div style={{
          fontSize: '12px', color: colors.textMuted,
          marginBottom: action ? '16px' : '0',
          lineHeight: 1.5,
        }}>
          {description}
        </div>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '7px 20px', borderRadius: '8px', border: 'none',
            cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            backgroundColor: PREMIUM.accent, color: '#fff',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          {action}
        </button>
      )}
    </div>
  )
}
