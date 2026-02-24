import React from 'react'
import GradeBadge from './GradeBadge'
import { GRADE_COLORS, FONTS, PREMIUM } from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'

/**
 * Simple markdown renderer — *bold*, `code`, line breaks
 */
function SimpleMarkdown({ text }) {
  const { colors } = useTheme()
  if (!text) return null

  const lines = text.split('\n')
  return (
    <div style={{ fontSize: '14px', lineHeight: '1.7', color: colors.textSecondary }}>
      {lines.map((line, i) => {
        let parts = line.split(/(\*[^*]+\*)/g)
        const rendered = parts.map((part, j) => {
          if (part.startsWith('*') && part.endsWith('*')) {
            return <strong key={j}>{part.slice(1, -1)}</strong>
          }
          const codeParts = part.split(/(`[^`]+`)/g)
          return codeParts.map((cp, k) => {
            if (cp.startsWith('`') && cp.endsWith('`')) {
              return (
                <code
                  key={`${j}-${k}`}
                  style={{
                    backgroundColor: colors.borderLight,
                    padding: '1px 4px',
                    borderRadius: '3px',
                    fontSize: '13px',
                    fontFamily: FONTS.mono,
                  }}
                >
                  {cp.slice(1, -1)}
                </code>
              )
            }
            return cp
          })
        })

        return (
          <div key={i} style={{ minHeight: line.trim() === '' ? '8px' : 'auto' }}>
            {rendered}
          </div>
        )
      })}
    </div>
  )
}

export default function NotificationDetailModal({ notification, onClose }) {
  const { colors } = useTheme()
  if (!notification) return null

  const { grade, corp_name, stock_code, report_nm, message, ai_summary, created_at, type } = notification
  const borderColor = GRADE_COLORS[grade]?.bg || '#94A3B8'
  const content = message || ai_summary || ''

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '600px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          backgroundColor: colors.bgCard,
          borderRadius: '16px',
          boxShadow: PREMIUM.shadowLg,
          borderTop: `4px solid ${borderColor}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 20px',
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.bgPrimary,
          }}
        >
          <GradeBadge grade={grade} size="lg" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '16px', color: colors.textPrimary, fontFamily: FONTS.serif }}>
              {corp_name || 'DART Insight'}
            </div>
            {stock_code && (
              <span style={{ fontSize: '12px', color: colors.textSecondary, fontFamily: FONTS.mono }}>
                {stock_code}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '22px', color: colors.textMuted, lineHeight: 1, padding: '4px',
            }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Report Name */}
        {report_nm && (
          <div style={{ padding: '10px 20px 0', fontSize: '14px', color: colors.textSecondary }}>
            {report_nm}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {content ? (
            <SimpleMarkdown text={content} />
          ) : (
            <div style={{ color: colors.textMuted, fontSize: '14px' }}>
              No detail information available.
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 20px',
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.bgPrimary,
            fontSize: '12px',
            color: colors.textMuted,
          }}
        >
          <span>{type === 'card' ? 'Company Card' : type === 'daily_report' ? 'Daily Report' : 'Filing Alert'}</span>
          <span>{created_at ? new Date(created_at).toLocaleString('ko-KR') : ''}</span>
        </div>
      </div>
    </div>
  )
}
