import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { PREMIUM } from '../constants/theme'

const ICONS = {
  search: (accent, muted) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <circle cx="28" cy="28" r="16" stroke={muted} strokeWidth="2" />
      <path d="M40 40L50 50" stroke={muted} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="28" cy="28" r="6" fill={accent} opacity="0.12" />
      <path d="M24 28H32" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  ),
  calendar: (accent, muted) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="12" y="16" width="40" height="36" rx="6" stroke={muted} strokeWidth="2" />
      <path d="M12 26H52" stroke={muted} strokeWidth="2" />
      <path d="M22 10V18" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M42 10V18" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="38" r="4" fill={accent} opacity="0.2" />
      <circle cx="32" cy="38" r="1.5" fill={accent} opacity="0.6" />
    </svg>
  ),
  chart: (accent, muted) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="12" y="36" width="8" height="16" rx="3" fill={accent} opacity="0.15" />
      <rect x="24" y="26" width="8" height="26" rx="3" fill={accent} opacity="0.25" />
      <rect x="36" y="18" width="8" height="34" rx="3" fill={accent} opacity="0.4" />
      <rect x="48" y="30" width="4" height="22" rx="2" fill={muted} opacity="0.15" />
      <path d="M10 54H54" stroke={muted} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M14 34L28 24L40 16" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" opacity="0.3" />
    </svg>
  ),
}

export default function EmptyState({ icon = 'search', title, description, action, onAction }) {
  const { colors, dark } = useTheme()
  const accent = PREMIUM.accent
  const muted = dark ? 'rgba(255,255,255,0.15)' : '#D4D4D8'
  const renderIcon = ICONS[icon] || ICONS.search

  return (
    <div className="page-enter" style={{
      padding: '56px 24px',
      textAlign: 'center',
    }}>
      <div style={{ marginBottom: '20px' }}>
        {renderIcon(accent, muted)}
      </div>
      {title && (
        <div style={{
          fontSize: '16px', fontWeight: 700, color: colors.textPrimary,
          marginBottom: '8px', lineHeight: 1.4,
        }}>
          {title}
        </div>
      )}
      {description && (
        <div style={{
          fontSize: '14px', color: colors.textMuted,
          marginBottom: action ? '20px' : '0',
          lineHeight: 1.6, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto',
        }}>
          {description}
        </div>
      )}
      {action && onAction && (
        <button
          className="touch-press"
          onClick={onAction}
          style={{
            padding: '10px 24px', borderRadius: '10px', border: 'none',
            cursor: 'pointer', fontSize: '14px', fontWeight: 700,
            backgroundColor: PREMIUM.accent, color: '#fff',
            minHeight: 44,
          }}
        >
          {action}
        </button>
      )}
    </div>
  )
}
