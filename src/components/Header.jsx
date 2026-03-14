import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM, PREMIUM_GOLD } from '../constants/theme'

const TABS = [
  { key: '/today', label: 'Today', icon: 'today' },
  { key: '/ai-live', label: 'AI Live', icon: 'ailive' },
  { key: '/deep-dive', label: 'Company Card', icon: 'deepdive' },
  { key: '/deep-data', label: 'Deep Data', icon: 'deepdata' },
  { key: '/premium', label: 'Premium', icon: 'premium', premium: true },
]

const TAB_ICONS = {
  ailive: (color) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  today: (color) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  deepdive: (color) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  customer: (color) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  deepdata: (color) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  premium: (color) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '56px',
        backgroundColor: dark ? 'rgba(9,9,11,0.92)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: colors.textPrimary,
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            style={{ color: colors.textMuted }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileMenuOpen ? (
                <><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>

          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
            {/* Logo mark */}
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: 'linear-gradient(135deg, #DC2626, #991B1B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span style={{
              fontSize: '15px', fontWeight: 700, letterSpacing: '-0.4px',
              fontFamily: FONTS.serif, color: colors.textPrimary,
            }}>
              DART <span style={{ color: '#DC2626' }}>Insight</span>
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
          gap: 2,
        }}>
          {TABS.map((tab) => {
            const active = isActive(tab.key)
            const isPremium = tab.premium
            const activeColor = isPremium ? PREMIUM_GOLD.primary : '#DC2626'
            const iconColor = active ? activeColor : colors.textMuted
            const IconFn = TAB_ICONS[tab.icon]
            return (
              <button
                key={tab.key}
                onClick={() => handleNav(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 400,
                  backgroundColor: active
                    ? (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                    : 'transparent',
                  color: active ? activeColor : (isPremium ? PREMIUM_GOLD.primary : colors.textSecondary),
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
                    e.currentTarget.style.color = isPremium ? PREMIUM_GOLD.primary : colors.textPrimary
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = isPremium ? PREMIUM_GOLD.primary : colors.textSecondary
                  }
                }}
              >
                {IconFn && IconFn(iconColor)}
                {tab.label}
                {isPremium && (
                  <span style={{
                    fontSize: '9px', fontWeight: 800,
                    padding: '1px 4px', borderRadius: 3,
                    background: PREMIUM_GOLD.gradient, color: '#fff',
                    letterSpacing: '0.4px',
                  }}>PRO</span>
                )}
                {/* Active underline dot */}
                {active && !isPremium && (
                  <span style={{
                    position: 'absolute', bottom: 2, left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4, height: 4, borderRadius: '50%',
                    backgroundColor: activeColor,
                  }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <a
            href="https://dartbook.cloud5.socialbrain.co.kr/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="전자공시 시그널 전자책"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', lineHeight: 1,
              color: colors.textMuted, transition: 'all 0.15s',
              borderRadius: 6, textDecoration: 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#9E7A2F'; e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = colors.textMuted; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </a>
          <button
            onClick={toggle}
            aria-label={dark ? 'Light mode' : 'Dark mode'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', fontSize: '15px', lineHeight: 1,
              color: colors.textMuted, transition: 'color 0.15s',
              borderRadius: 6,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.textPrimary; e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = colors.textMuted; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            {dark ? '☀' : '🌙'}
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
        <div className="mobile-menu-overlay open" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {TABS.map((tab) => (
          <button key={tab.key} className={isActive(tab.key) ? 'active' : ''} onClick={() => handleNav(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bottom tab bar (mobile only) */}
      <nav className="bottom-tab-bar">
        {TABS.map((tab) => {
          const active = isActive(tab.key)
          const isPremium = tab.premium
          const activeCol = isPremium ? PREMIUM_GOLD.primary : '#DC2626'
          const iconColor = active ? activeCol : '#94A3B8'
          const IconFn = TAB_ICONS[tab.icon]
          return (
            <button
              key={tab.key}
              className={`bottom-tab-item ${active ? 'active' : ''} ${isPremium ? 'premium-tab' : ''}`}
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
