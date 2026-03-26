import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'dart_watchlist'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function useWatchlist() {
  const [list, setList] = useState(load)

  useEffect(() => { save(list) }, [list])

  const isWatching = useCallback((corpCode) => list.includes(corpCode), [list])

  const toggle = useCallback((corpCode) => {
    setList(prev =>
      prev.includes(corpCode)
        ? prev.filter(c => c !== corpCode)
        : [...prev, corpCode].slice(-30) // 최대 30개
    )
  }, [])

  return { list, isWatching, toggle }
}
