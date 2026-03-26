import { useState, useCallback, useRef } from 'react'

const MAX_TOASTS = 4
const AUTO_DISMISS_MS = 7000
const EXIT_ANIMATION_MS = 300

export function useToastManager() {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  const dismissToast = useCallback((id) => {
    // 퇴장 애니메이션 시작
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)))

    // 애니메이션 후 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id])
        delete timersRef.current[id]
      }
    }, EXIT_ANIMATION_MS)
  }, [])

  const addToast = useCallback((notification) => {
    const id = notification.id || Date.now().toString()

    setToasts((prev) => {
      // 중복 방지
      if (prev.some((t) => t.id === id)) return prev

      const newToast = { ...notification, id, exiting: false, addedAt: Date.now() }
      const updated = [newToast, ...prev]

      // 최대 개수 초과 시 오래된 것 제거
      if (updated.length > MAX_TOASTS) {
        const removed = updated.slice(MAX_TOASTS)
        removed.forEach((t) => {
          if (timersRef.current[t.id]) {
            clearTimeout(timersRef.current[t.id])
            delete timersRef.current[t.id]
          }
        })
        return updated.slice(0, MAX_TOASTS)
      }
      return updated
    })

    // 자동 소멸 타이머
    timersRef.current[id] = setTimeout(() => {
      dismissToast(id)
    }, AUTO_DISMISS_MS)
  }, [dismissToast])

  return { toasts, addToast, dismissToast }
}
