import React, { createContext, useContext, useCallback, useRef } from 'react'

const ErrorContext = createContext(null)

export function ErrorProvider({ addToast, children }) {
  const lastErrorRef = useRef({ msg: '', ts: 0 })

  const showError = useCallback((message, detail) => {
    // 같은 에러 3초 내 중복 방지
    const now = Date.now()
    if (lastErrorRef.current.msg === message && now - lastErrorRef.current.ts < 3000) return
    lastErrorRef.current = { msg: message, ts: now }

    if (addToast) {
      addToast({
        id: `error-${now}`,
        grade: 'error',
        corp_name: '오류',
        report_nm: message,
        message: detail || '',
      })
    } else {
      console.error(`[DART Insight] ${message}`, detail)
    }
  }, [addToast])

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const ctx = useContext(ErrorContext)
  if (!ctx) throw new Error('useError must be used within ErrorProvider')
  return ctx
}
