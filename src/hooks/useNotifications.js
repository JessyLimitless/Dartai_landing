import { useState, useEffect, useCallback, useRef } from 'react'
import { API } from '../lib/api'

const API_BASE = `${API}/api`
const POLL_INTERVAL = 30000 // 30초

export function useNotifications({ onNewNotifications } = {}) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(null)
  const seenIdsRef = useRef(null) // null = 첫 로드 전
  const onNewRef = useRef(onNewNotifications)
  onNewRef.current = onNewNotifications

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications?limit=20`)
      if (res.ok) {
        const data = await res.json()
        const items = data.notifications || []
        setNotifications(items)
        setUnreadCount(data.unread_count || 0)

        // 신규 알림 감지
        const currentIds = new Set(items.map((n) => n.id))
        if (seenIdsRef.current === null) {
          // 첫 로드 — ID만 세팅 (토스트 폭주 방지)
          seenIdsRef.current = currentIds
        } else {
          const newItems = items.filter((n) => !seenIdsRef.current.has(n.id))
          if (newItems.length > 0 && onNewRef.current) {
            onNewRef.current(newItems)
          }
          seenIdsRef.current = currentIds
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (id) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, { method: 'POST' })
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }, [])

  // 초기 로드 + 30초 폴링
  useEffect(() => {
    fetchNotifications()

    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  }
}
