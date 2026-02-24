import React from 'react'
import Skeleton from './Skeleton'
import NotificationItem from './NotificationItem'
import { useTheme } from '../contexts/ThemeContext'
import { PREMIUM, FONTS } from '../constants/theme'

export default function NotificationPanel({ notifications, loading, onRead, onMarkAllRead, onSelect }) {
  const { colors } = useTheme()

  return (
    <div
      className="notification-panel"
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        width: '400px',
        maxHeight: '500px',
        backgroundColor: colors.bgCard,
        borderRadius: '16px',
        boxShadow: PREMIUM.shadowLg,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.bgPrimary,
        }}
      >
        <span style={{
          fontWeight: 700, fontSize: '14px', color: colors.textPrimary,
          fontFamily: FONTS.serif,
        }}>Notifications</span>
        <button
          onClick={onMarkAllRead}
          style={{
            border: 'none',
            background: 'none',
            color: PREMIUM.accent,
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          Mark all read
        </button>
      </div>

      {/* Notification List */}
      <div style={{ maxHeight: '440px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '12px 16px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Skeleton width="28px" height="20px" borderRadius="4px" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="120px" height="13px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="180px" height="11px" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted }}>
            No notifications
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={onRead} onSelect={onSelect} />
          ))
        )}
      </div>
    </div>
  )
}
