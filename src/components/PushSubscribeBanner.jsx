import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { PREMIUM } from '../constants/theme'
import { API } from '../lib/api'

const DISMISS_KEY = 'dart-push-banner-dismissed'

async function subscribeToPush() {
  try {
    const res = await fetch(`${API}/api/push/vapid-key`)
    if (!res.ok) return false
    const { vapid_public_key } = await res.json()
    if (!vapid_public_key) return false

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapid_public_key,
    })

    const subRes = await fetch(`${API}/api/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON()),
    })

    return subRes.ok
  } catch (err) {
    console.error('Push subscription failed:', err)
    return false
  }
}

export default function PushSubscribeBanner() {
  const { dark, colors } = useTheme()
  const [visible, setVisible] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      if (Date.now() - dismissedAt < 24 * 60 * 60 * 1000) return
    }

    if (!('PushManager' in window) || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (!sub) setVisible(true)
      })
    })
  }, [])

  if (!visible || subscribed) return null

  const handleSubscribe = async () => {
    const result = await subscribeToPush()
    if (result) {
      setSubscribed(true)
      setVisible(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setVisible(false)
  }

  return (
    <div
      className="push-banner"
      style={{
        padding: '12px 20px',
        backgroundColor: PREMIUM.accentLight,
        borderBottom: `1px solid ${PREMIUM.accent}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <span style={{ fontSize: '14px', color: colors.textPrimary }}>
        Enable push notifications to receive real-time S/A/D grade alerts in your browser.
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSubscribe}
          style={{
            padding: '6px 16px',
            backgroundColor: PREMIUM.accent,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          Enable
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: '6px 12px',
            background: 'none',
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            fontSize: '13px',
            cursor: 'pointer',
            color: colors.textSecondary,
          }}
        >
          Later
        </button>
      </div>
    </div>
  )
}
