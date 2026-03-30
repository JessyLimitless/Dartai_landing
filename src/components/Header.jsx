import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM, PREMIUM_GOLD } from '../constants/theme'
import { isAdmin } from './AdminPage'

const TABS = [
  { key: '/', label: '홈', mobileLabel: '홈', exact: true },
  { key: '/briefing', label: '브리핑', mobileLabel: '브리핑' },
  { key: '/today', label: '공시', mobileLabel: '공시' },
  { key: '/issues', label: '이슈', mobileLabel: '이슈' },
  { key: '/dart-view', label: '재무분석', mobileLabel: '재무분석' },
  { key: '/dart-event', label: '일정', mobileLabel: '일정' },
  { key: '/deep-dive', label: '기업카드', mobileLabel: '기업카드', desktopOnly: true },
]

const TAB_ICONS = {
  '/': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  '/briefing': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  '/today': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  '/issues': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  '/dart-view': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  '/dart-event': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  '/deep-dive': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
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
  hiddenTopBar = false,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, toggle, colors } = useTheme()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleNav = (path) => navigate(path)

  const accentColor = '#DC2626'

  return (
    <>
      {/* ── 데스크톱 상단 바 ── */}
      {!hiddenTopBar && <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56,
        backgroundColor: dark ? 'rgba(9,9,11,0.97)' : 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Left: Logo */}
        <div onClick={() => navigate(isAdmin() ? '/admin' : '/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: 'linear-gradient(135deg, #DC2626, #991B1B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{
            fontSize: 16, fontWeight: 700, letterSpacing: -0.5,
            fontFamily: FONTS.serif, color: colors.textPrimary,
          }}>
            DART <span style={{ color: accentColor }}>Insight</span>
          </span>
        </div>

        {/* Center: Desktop nav — 5탭만 */}
        <nav className="desktop-nav" style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          {TABS.map((tab, idx) => {
            const active = isActive(tab.key)
            return (
              <button key={tab.key}
                onClick={() => handleNav(tab.key)}
                style={{
                  padding: '8px 20px', borderRadius: 8,
                  border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: active ? 700 : 400,
                  fontFamily: FONTS.serif,
                  letterSpacing: '0.02em',
                  backgroundColor: active
                    ? (dark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.06)')
                    : 'transparent',
                  color: active ? accentColor : colors.textMuted,
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = colors.textPrimary
                    e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = colors.textMuted
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                {tab.label}
                {active && <div style={{
                  position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                  width: 16, height: 2, borderRadius: 1, background: accentColor,
                }} />}
              </button>
            )
          })}
        </nav>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <button onClick={toggle} aria-label={dark ? 'Light' : 'Dark'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, fontSize: 14, color: colors.textMuted, borderRadius: 8, lineHeight: 1,
            }}>
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
      </header>}

      {/* ── 모바일 하단 탭 바 ── */}
      {!hiddenTopBar && <nav className="bottom-tab-bar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        display: 'none', // CSS로 모바일에서만 flex
        justifyContent: 'space-around', alignItems: 'center',
        height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: dark ? 'rgba(9,9,11,0.97)' : 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }}>
        {TABS.filter(tab => !tab.desktopOnly).map((tab) => {
          const active = isActive(tab.key)
          const iconColor = active ? accentColor : '#94A3B8'
          const IconFn = TAB_ICONS[tab.key]
          return (
            <button key={tab.key}
              onClick={() => handleNav(tab.key)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 2, padding: '6px 0', border: 'none', cursor: 'pointer',
                background: 'transparent', minWidth: 56,
                transition: 'all 0.15s',
              }}>
              {IconFn && IconFn(iconColor, 20)}
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 500,
                color: iconColor, letterSpacing: '0.02em',
                fontFamily: FONTS.serif,
              }}>
                {tab.mobileLabel}
              </span>
            </button>
          )
        })}
      </nav>}

      <style>{`
        .desktop-nav { display: flex; }
        .bottom-tab-bar { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .bottom-tab-bar { display: flex !important; }
        }
      `}</style>
    </>
  )
}
