import React from 'react'
import GradeBadge from './GradeBadge'

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
  const { id, grade, corp_name, report_nm, ai_summary, gemini_comment, is_read, created_at, parsed_data } = notification

  const summary = gemini_comment || ai_summary || ''
  const preview = summary.length > 80 ? summary.slice(0, 80) + '...' : summary

  // 주가 추적 알림
  const priceData = notification.type === 'price_update' ? parsed_data : null

  const handleClick = () => {
    if (!is_read) onRead?.(id)
    onSelect?.(notification)
  }

  return (
    <div
      onClick={handleClick}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: is_read ? '#fff' : '#eff6ff',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = is_read ? '#f8fafc' : '#dbeafe' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = is_read ? '#fff' : '#eff6ff' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <GradeBadge grade={grade} />
        <strong style={{ fontSize: '14px', flex: 1 }}>{corp_name || 'DART Insight'}</strong>
        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{timeAgo(created_at)}</span>
      </div>

      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>
        {report_nm}
      </div>

      {priceData && (
        <div style={{ fontSize: '13px', color: priceData.change > 0 ? '#dc2626' : '#2563eb' }}>
          {priceData.current_price?.toLocaleString()}원 ({priceData.change > 0 ? '+' : ''}{priceData.change?.toFixed(2)}%)
        </div>
      )}

      {preview && (
        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
          {preview}
        </div>
      )}
    </div>
  )
}
