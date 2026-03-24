import React from 'react'
import Skeleton from './Skeleton'
import NotificationItem from './NotificationItem'
import { useTheme } from '../contexts/ThemeContext'
import { PREMIUM, FONTS } from '../constants/theme'

export default function NotificationPanel({ notifications, loading, onRead, onMarkAllRead, onSelect, alertOn, onToggleAlert }) {
  const { colors } = useTheme()

  return (
    <div
      className="notification-panel"
      style={{
        position: 'fixed',
        top: 56,
        right: 12,
        width: 'min(360px, calc(100vw - 24px))',
        maxHeight: '60vh',
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
          fontFamily: FONTS.serif, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          알림
          {notifications.filter(n => !n.is_read).length > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#fff', background: '#DC2626',
              borderRadius: 10, padding: '1px 6px', fontFamily: 'sans-serif',
            }}>{notifications.filter(n => !n.is_read).length}</span>
          )}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onMarkAllRead} style={{
            border: 'none', background: 'none', color: PREMIUM.accent,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '4px 8px',
          }}>모두 읽음</button>
          <button onClick={onToggleAlert} style={{
            border: 'none', background: alertOn ? '#DC2626' : (colors.bgCard === '#fff' ? '#E4E4E7' : '#333'),
            color: alertOn ? '#fff' : colors.textMuted,
            fontSize: 10, fontWeight: 700, cursor: 'pointer',
            padding: '4px 10px', borderRadius: 10, transition: 'all 0.2s',
          }}>
            {alertOn ? 'ON' : 'OFF'}
          </button>
        </div>
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
            알림이 없습니다
          </div>
        ) : (
          notifications.filter(n => !n.is_read).length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted }}>
              새로운 알림이 없습니다
            </div>
          ) : notifications.filter(n => !n.is_read).map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={onRead} onSelect={onSelect} />
          ))
        )}
      </div>
    </div>
  )
}
