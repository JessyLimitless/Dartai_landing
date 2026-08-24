import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dart_user')) } catch { return null }
  })

  // 다른 탭/창과 동기화
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'dart_user') {
        try { setUser(e.newValue ? JSON.parse(e.newValue) : null) } catch { setUser(null) }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // 같은 페이지 내 컴포넌트 간 동기화
  useEffect(() => {
    const handler = (e) => setUser(e.detail)
    window.addEventListener('dart-auth-change', handler)
    return () => window.removeEventListener('dart-auth-change', handler)
  }, [])

  const login = useCallback((userData) => {
    localStorage.setItem('dart_user', JSON.stringify(userData))
    setUser(userData)
    window.dispatchEvent(new CustomEvent('dart-auth-change', { detail: userData }))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('dart_user')
    // 🔑 세션 토큰도 같이 지운다. 안 지우면 로그아웃한 브라우저에
    //    __픽 원문 열쇠가 남는다__ — 로그아웃의 의미가 사라진다.
    try { localStorage.removeItem('dart_session_token') } catch { /* 무시 */ }
    setUser(null)
    window.dispatchEvent(new CustomEvent('dart-auth-change', { detail: null }))
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
