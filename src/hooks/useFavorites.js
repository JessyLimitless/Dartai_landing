import { useState, useCallback } from 'react'

const STORAGE_KEY = 'dart-insight-favorites'

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveFavorites(favs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs))
  } catch {
    // storage full — ignore
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(loadFavorites)

  const toggle = useCallback((item) => {
    setFavorites((prev) => {
      const key = item.corp_code || item.rcept_no
      const exists = prev.some((f) => (f.corp_code || f.rcept_no) === key)
      const next = exists
        ? prev.filter((f) => (f.corp_code || f.rcept_no) !== key)
        : [...prev, { corp_code: item.corp_code, corp_name: item.corp_name, stock_code: item.stock_code }]
      saveFavorites(next)
      return next
    })
  }, [])

  const isFavorite = useCallback((corpCodeOrRcept) => {
    return favorites.some((f) => f.corp_code === corpCodeOrRcept || f.rcept_no === corpCodeOrRcept)
  }, [favorites])

  const clear = useCallback(() => {
    setFavorites([])
    saveFavorites([])
  }, [])

  return { favorites, toggle, isFavorite, clear }
}
