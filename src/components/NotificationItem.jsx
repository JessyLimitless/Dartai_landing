import React from 'react'
import GradeBadge from './GradeBadge'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return '방금'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function NotificationItem({ notification, onRead, onSelect }) {
  const { colors, dark } = useTheme()
  const { id, grade, corp_name, report_nm, is_read, created_at, parsed_data } = notification

  const summary = notification.message || ''
  const preview = summary.length > 60 ? summary.slice(0, 60) + '...' : summary

  const priceData = notification.type === 'price_update' ? parsed_data : null

  const handleClick = () => {
    if (!is_read) onRead?.(id)
    onSelect?.(notification)
  }

  const bgDefault = is_read
    ? 'transparent'
    : (dark ? 'rgba(220,38,38,0.04)' : 'rgba(220,38,38,0.03)')
  const bgHover = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'

  return (
    <div
      onClick={handleClick}
      style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#F4F4F5'}`,
        backgroundColor: bgDefault,
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = bgHover }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = bgDefault }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <GradeBadge grade={grade} />
        <strong style={{ fontSize: 14, color: colors.textPrimary, flex: 1 }}>
          {corp_name || 'DART Insight'}
        </strong>
        {!is_read && (
          <span style={{
            width: 6, height: 6, borderRadius: 3,
            background: '#DC2626', flexShrink: 0,
          }} />
        )}
        <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
          {timeAgo(created_at)}
        </span>
      </div>

      <div style={{
        fontSize: 13, color: colors.textSecondary,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {report_nm}
      </div>

      {priceData && (
        <div style={{
          fontSize: 13, fontWeight: 600, fontFamily: FONTS.mono, marginTop: 3,
          color: priceData.change > 0 ? '#DC2626' : '#2563EB',
        }}>
          {priceData.current_price?.toLocaleString()}원 ({priceData.change > 0 ? '+' : ''}{priceData.change?.toFixed(1)}%)
        </div>
      )}

      {preview && !priceData && (
        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 3, lineHeight: 1.4 }}>
          {preview}
        </div>
      )}
    </div>
  )
}
