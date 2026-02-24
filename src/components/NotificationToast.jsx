import React from 'react'
import GradeBadge from './GradeBadge'
import { GRADE_COLORS, PREMIUM } from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'

const AUTO_DISMISS_MS = 7000

export default function NotificationToast({ notification, onDismiss, onClick }) {
  const { colors } = useTheme()
  const { id, grade, corp_name, report_nm, ai_summary, gemini_comment, exiting } = notification
  const preview = gemini_comment || ai_summary || ''
  const previewText = preview.length > 60 ? preview.slice(0, 60) + '...' : preview

  const borderColor = grade === 'error' ? '#991B1B' : (GRADE_COLORS[grade]?.bg || '#94A3B8')

  return (
    <div
      className="toast-card"
      onClick={() => onClick?.(notification)}
      style={{
        width: '380px',
        backgroundColor: colors.bgCard,
        borderRadius: '16px',
        boxShadow: PREMIUM.shadowLg,
        borderLeft: `4px solid ${borderColor}`,
        overflow: 'hidden',
        cursor: 'pointer',
        animation: exiting
          ? 'toastSlideOut 0.3s ease-in forwards'
          : 'toastSlideIn 0.3s ease-out',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.01)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      <div style={{ padding: '14px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <GradeBadge grade={grade} />
          <strong style={{ fontSize: '14px', flex: 1, color: colors.textPrimary }}>
            {corp_name || 'DART Insight'}
          </strong>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDismiss?.(id)
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '16px', color: colors.textMuted, padding: '2px 4px', lineHeight: 1,
            }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Report name */}
        {report_nm && (
          <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '4px' }}>
            {report_nm}
          </div>
        )}

        {/* Preview */}
        {previewText && (
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            {previewText}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!exiting && (
        <div style={{ height: '3px', backgroundColor: colors.borderLight }}>
          <div
            style={{
              height: '100%',
              backgroundColor: borderColor,
              opacity: 0.6,
              animation: `toastProgress ${AUTO_DISMISS_MS}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  )
}
