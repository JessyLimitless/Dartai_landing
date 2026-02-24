import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'

const LIGHT_COLORS = {
  bgPrimary: '#FAFAFA',
  bgCard: '#FFFFFF',
  bgDark: '#18181B',
  bgDarkHover: '#27272A',
  border: '#E4E4E7',
  borderLight: '#F4F4F5',
  textPrimary: '#18181B',
  textSecondary: '#52525B',
  textMuted: '#A1A1AA',
  accent: '#DC2626',
  positive: '#059669',
  negative: '#2563EB',
}

const DARK_COLORS = {
  bgPrimary: '#09090B',
  bgCard: '#18181B',
  bgDark: '#09090B',
  bgDarkHover: '#18181B',
  border: '#27272A',
  borderLight: '#18181B',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  accent: '#EF4444',
  positive: '#10B981',
  negative: '#60A5FA',
}

const STORAGE_KEY = 'dart-theme'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark') return true
    if (saved === 'light') return false
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const handler = (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) setDark(e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggle = () => setDark((d) => !d)
  const colors = dark ? DARK_COLORS : LIGHT_COLORS

  const value = useMemo(() => ({ dark, toggle, colors }), [dark, colors])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
