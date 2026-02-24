import { useState, useEffect, useCallback } from 'react'
import { useError } from '../contexts/ErrorContext'

export function useScreener() {
  const { showError } = useError()
  const [results, setResults] = useState([])
  const [summary, setSummary] = useState({ total: 0, filtered: 0 })
  const [presets, setPresets] = useState([])
  const [loading, setLoading] = useState(true)

  const [activePreset, setActivePreset] = useState(null)
  const [customFilters, setCustomFilters] = useState({})
  const [sortKey, setSortKey] = useState('market_cap')
  const [sortOrder, setSortOrder] = useState('desc')
  const [liveMode, setLiveMode] = useState(false)

  const fetchScreener = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()

    if (activePreset) {
      params.set('preset', activePreset)
    } else {
      // 커스텀 필터
      Object.entries(customFilters).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '' && v !== false) {
          params.set(k, String(v))
        }
      })
    }

    if (sortKey) params.set('sort', sortKey)
    if (sortOrder) params.set('order', sortOrder)
    if (liveMode) params.set('live', 'true')
    params.set('limit', '200')

    fetch(`/api/screener?${params}`)
      .then((r) => r.ok ? r.json() : { results: [], total: 0, filtered: 0, presets: [] })
      .then((data) => {
        setResults(data.results || [])
        setSummary({ total: data.total || 0, filtered: data.filtered || 0 })
        if (data.presets && data.presets.length > 0) {
          setPresets(data.presets)
        }
      })
      .catch(() => {
        setResults([])
        setSummary({ total: 0, filtered: 0 })
        showError('스크리너 결과를 불러올 수 없습니다')
      })
      .finally(() => setLoading(false))
  }, [activePreset, customFilters, sortKey, sortOrder, liveMode, showError])

  useEffect(() => { fetchScreener() }, [fetchScreener])

  const selectPreset = useCallback((key) => {
    setActivePreset(key === activePreset ? null : key)
    setCustomFilters({})
  }, [activePreset])

  const updateFilter = useCallback((key, value) => {
    setActivePreset(null)
    setCustomFilters((prev) => {
      const next = { ...prev }
      if (value === null || value === undefined || value === '') {
        delete next[key]
      } else {
        next[key] = value
      }
      return next
    })
  }, [])

  const clearFilters = useCallback(() => {
    setActivePreset(null)
    setCustomFilters({})
  }, [])

  const toggleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortOrder((prev) => prev === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }, [sortKey])

  const toggleLive = useCallback(() => {
    setLiveMode((prev) => !prev)
  }, [])

  return {
    results,
    summary,
    presets,
    loading,
    activePreset,
    customFilters,
    sortKey,
    sortOrder,
    liveMode,
    selectPreset,
    updateFilter,
    clearFilters,
    toggleSort,
    toggleLive,
    refresh: fetchScreener,
  }
}
