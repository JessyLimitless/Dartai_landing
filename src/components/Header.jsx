import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const TABS = [
  { key: '/today', label: 'Today', icon: 'today' },
  { key: '/deep-dive', label: 'Deep Dive', icon: 'deepdive' },
  { key: '/discover', label: 'Discover', icon: 'discover' },
  { key: '/market', label: 'Market', icon: 'market' },
]

const TAB_ICONS = {
  today: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
    </svg>
  ),
  deepdive: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  discover: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  market: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
}

export default function Header({
  notifications,
  unreadCount,
  loading,
  onRead,
  onMarkAllRead,
  onSelectNotification,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, toggle, colors } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleNav = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          height: '60px',
          backgroundColor: colors.bgCard,
          color: colors.textPrimary,
          borderBottom: `1px solid ${PREMIUM.borderLight}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: PREMIUM.shadowSm,
        }}
      >
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {/* Hamburger button (mobile only) */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>

          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <span style={{
              fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.5px',
              fontFamily: FONTS.serif, color: colors.textPrimary,
            }}>
              DART <span style={{ color: PREMIUM.accent }}>Insight</span>
            </span>
          </div>
        </div>

        {/* Center: Desktop nav */}
        <nav className="desktop-nav" style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
          borderRadius: '12px',
          backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
        }}>
          {TABS.map((tab) => {
            const active = isActive(tab.key)
            const iconColor = active ? PREMIUM.accent : colors.textMuted
            const IconFn = TAB_ICONS[tab.icon]
            return (
              <button
                key={tab.key}
                onClick={() => handleNav(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  backgroundColor: active ? colors.bgCard : 'transparent',
                  color: active ? PREMIUM.accent : colors.textSecondary,
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                    e.currentTarget.style.color = colors.textPrimary
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = colors.textSecondary
                  }
                }}
              >
                {IconFn && IconFn(iconColor)}
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <button
            onClick={toggle}
            aria-label={dark ? 'Light mode' : 'Dark mode'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              fontSize: '18px',
              lineHeight: 1,
              color: colors.textMuted,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.target.style.color = colors.textPrimary }}
            onMouseLeave={(e) => { e.target.style.color = colors.textMuted }}
          >
            {dark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
          </button>

          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            loading={loading}
            onRead={onRead}
            onMarkAllRead={onMarkAllRead}
            onSelect={onSelectNotification}
          />
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay open"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile slide-in menu (legacy, hidden when bottom-tab-bar shows) */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={isActive(tab.key) ? 'active' : ''}
            onClick={() => handleNav(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bottom tab bar (mobile only) */}
      <nav className="bottom-tab-bar">
        {TABS.map((tab) => {
          const active = isActive(tab.key)
          const iconColor = active ? PREMIUM.accent : '#94A3B8'
          const IconFn = TAB_ICONS[tab.icon]
          return (
            <button
              key={tab.key}
              className={`bottom-tab-item ${active ? 'active' : ''}`}
              onClick={() => handleNav(tab.key)}
            >
              {IconFn && IconFn(iconColor)}
              <span style={{ color: iconColor }}>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
