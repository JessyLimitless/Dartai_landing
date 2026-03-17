import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const STORAGE_KEY = 'dart_email_captured'

export default function EmailCapture() {
  const { colors, dark } = useTheme()
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setVisible(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible || done) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.includes('@')) return
    localStorage.setItem(STORAGE_KEY, email)
    // TODO: POST to backend when endpoint is ready
    setDone(true)
    setTimeout(() => setVisible(false), 2000)
  }

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'dismissed')
    setVisible(false)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: 16, right: 16,
      zIndex: 900, maxWidth: 400, margin: '0 auto',
      animation: 'pageEnter 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
    }}>
      <div style={{
        background: dark ? '#18181B' : '#FFFFFF',
        borderRadius: 16, padding: '18px 20px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
      }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>
              감사합니다!
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted }}>
              주요 공시 알림을 보내드릴게요
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, marginBottom: 3 }}>
                  핵심 공시, 놓치지 마세요
                </div>
                <div style={{ fontSize: 13, color: colors.textMuted }}>
                  S등급 공시 발생 시 이메일로 알려드려요
                </div>
              </div>
              <button onClick={dismiss} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: colors.textMuted, fontSize: 16, padding: 4,
              }}>x</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="이메일 주소"
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 10,
                  border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
                  background: dark ? '#09090B' : '#F8F8FA',
                  color: colors.textPrimary, fontSize: 14,
                  outline: 'none', fontFamily: FONTS.body,
                }}
              />
              <button className="touch-press" type="submit" style={{
                padding: '10px 18px', borderRadius: 10, border: 'none',
                background: PREMIUM.accent, color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                minHeight: 44, flexShrink: 0,
              }}>알림 받기</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
