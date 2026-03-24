import React, { useState, useRef, useEffect } from 'react'
import NotificationPanel from './NotificationPanel'

export default function NotificationBell({ notifications, unreadCount, loading, onRead, onMarkAllRead, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const [alertOn, setAlertOn] = useState(() => {
    try { return localStorage.getItem('dart_alert') !== 'off' } catch { return true }
  })

  const toggleAlert = () => {
    const next = !alertOn
    setAlertOn(next)
    localStorage.setItem('dart_alert', next ? 'on' : 'off')
    // 전역 이벤트로 App.jsx에 전달
    window.dispatchEvent(new CustomEvent('dart-alert-toggle', { detail: next }))
  }

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const displayCount = unreadCount > 9 ? '9+' : unreadCount

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: 6, lineHeight: 1, borderRadius: 8,
        }}
        aria-label="알림"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={alertOn && unreadCount > 0 ? '#DC2626' : 'currentColor'}
          strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {/* OFF 표시 */}
        {!alertOn && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%) rotate(-45deg)',
            width: 22, height: 2, background: '#DC2626', borderRadius: 1,
          }} />
        )}
        {alertOn && unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            minWidth: 16, height: 16, borderRadius: 8,
            backgroundColor: '#dc2626', color: '#fff',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px',
          }}>
            {displayCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationPanel
          notifications={notifications}
          loading={loading}
          onRead={onRead}
          onMarkAllRead={onMarkAllRead}
          alertOn={alertOn}
          onToggleAlert={toggleAlert}
          onSelect={(n) => { setOpen(false); onSelect?.(n) }}
        />
      )}
    </div>
  )
}
