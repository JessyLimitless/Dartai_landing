import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'

export default function PwaInstallBanner() {
  const { colors, dark } = useTheme()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // 이미 설치됐는지 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // 24시간 내 닫은 적 있으면 표시 안 함
    const dismissed = localStorage.getItem('pwa_banner_dismissed')
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) return

    // beforeinstallprompt 이벤트 감지
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari에서는 beforeinstallprompt 없음 → 수동 안내
    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    const isSafari = /safari/.test(navigator.userAgent.toLowerCase()) && !/chrome/.test(navigator.userAgent.toLowerCase())
    if (isIos && isSafari && !window.matchMedia('(display-mode: standalone)').matches) {
      setTimeout(() => setShow(true), 3000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      if (result.outcome === 'accepted') {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    }
    setShow(false)
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('pwa_banner_dismissed', Date.now().toString())
  }

  if (!show || isInstalled) return null

  const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(130px + env(safe-area-inset-bottom, 0px))',
      left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)', maxWidth: 400,
      zIndex: 95,
      background: dark ? '#18181B' : '#FFFFFF',
      borderRadius: 16,
      border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      padding: '16px 20px',
      animation: 'pwa-slide-up 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* 앱 아이콘 */}
        <img src="/dart.png" alt="DART" style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        }} />

        {/* 텍스트 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 700, color: colors.textPrimary,
            marginBottom: 2,
          }}>DART Insight 앱 설치</div>
          <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.4 }}>
            {isIos
              ? '공유 버튼 → "홈 화면에 추가"를 눌러주세요'
              : '홈 화면에 추가하면 앱처럼 사용할 수 있어요'
            }
          </div>
        </div>

        {/* 버튼 */}
        {!isIos ? (
          <button className="touch-press" onClick={handleInstall} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: '#DC2626', color: '#fff',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            minHeight: 36,
          }}>설치</button>
        ) : (
          <button className="touch-press" onClick={handleDismiss} style={{
            padding: '8px 12px', borderRadius: 8, border: 'none',
            background: dark ? '#27272A' : '#F4F4F5', color: colors.textSecondary,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
          }}>확인</button>
        )}
      </div>

      {/* 닫기 */}
      <button onClick={handleDismiss} style={{
        position: 'absolute', top: 8, right: 8,
        background: 'none', border: 'none', cursor: 'pointer',
        color: colors.textMuted, fontSize: 14, padding: '4px',
      }}>✕</button>

      <style>{`
        @keyframes pwa-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
