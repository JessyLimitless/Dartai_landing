import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM, PREMIUM_GOLD } from '../constants/theme'

const TABS = [
  { key: '/today', label: 'Today', icon: 'today', mobileLabel: '홈', mobileIcon: 'home' },
  { key: '/history', label: 'History', icon: 'chart', mobileLabel: '추적', mobileIcon: 'chart' },
  { key: '/deep-dive', label: 'Company Card', icon: 'deepdive', mobileLabel: '종목', mobileIcon: 'deepdive' },
  { key: '/dart-event', label: 'Insight', icon: 'dartevent', desktopOnly: true },
  { key: '/library', label: 'Library', icon: 'library', mobileLabel: '서재', mobileIcon: 'library' },
  { key: '/premium', label: 'Premium', icon: 'premium', premium: true, mobileLabel: 'AI', mobileIcon: 'premium' },
]

const MOBILE_TABS = TABS.filter(t => !t.desktopOnly)

const TAB_ICONS = {
  home: (color, size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  chart: (color, size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  ailive: (color, size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  today: (color, size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  deepdive: (color, size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  customer: (color, size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  deepdata: (color, size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  dartevent: (color, size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  library: (color, size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  premium: (color, size = 14) => (
    <img src="/bufit.png" alt="AI" style={{
      width: size * 2.2, height: size * 2.2, borderRadius: '50%', objectFit: 'cover',
      border: `2px solid ${color === '#94A3B8' ? 'rgba(148,163,184,0.3)' : 'rgba(212,160,23,0.5)'}`,
      boxShadow: color !== '#94A3B8' ? '0 0 8px rgba(212,160,23,0.2)' : 'none',
    }} />
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
        padding: '0 20px',
        height: '52px',
        backgroundColor: dark ? 'rgba(9,9,11,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: colors.textPrimary,
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
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
              width: 24, height: 24, borderRadius: 6,
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
                    fontSize: '10px', fontWeight: 800,
                    padding: '2px 5px', borderRadius: 4,
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
            href="https://jessylimitless.github.io/dartbook/"
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
        {MOBILE_TABS.map((tab) => {
          const active = isActive(tab.key)
          const isPremium = tab.premium
          const activeCol = isPremium ? PREMIUM_GOLD.primary : '#DC2626'
          const iconColor = active ? activeCol : '#94A3B8'
          const IconFn = TAB_ICONS[tab.mobileIcon || tab.icon]
          return (
            <button
              key={tab.key}
              className={`bottom-tab-item ${active ? 'active' : ''} ${isPremium ? 'premium-tab' : ''}`}
              onClick={() => handleNav(tab.key)}
            >
              {IconFn && IconFn(iconColor, 20)}
              <span style={{ color: iconColor }}>{tab.mobileLabel || tab.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
