import { useState, useEffect, useCallback, useRef } from 'react'
import { useError } from '../contexts/ErrorContext'
import { API } from '../lib/api'

const CACHE_KEY = 'dart_company_cards_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5분

function getCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch { return null }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* quota exceeded 등 무시 */ }
}

export function useCompanyCards() {
  const { showError } = useError()
  const cached = useRef(getCache())
  const [companies, setCompanies] = useState(cached.current || [])
  const [loading, setLoading] = useState(!cached.current)
  const [query, setQuery] = useState('')

  const fetchCompanies = useCallback((q) => {
    // 검색어 없고 캐시 있으면 백그라운드 갱신만
    const hasCache = !q && cached.current
    if (!hasCache) setLoading(true)

    const url = q
      ? `${API}/api/companies/search?q=${encodeURIComponent(q)}&limit=30`
      : `${API}/api/companies/search?limit=30`
    fetch(url)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const list = data?.companies || []
        setCompanies(list)
        if (!q) { setCache(list); cached.current = list }
      })
      .catch(() => { if (!hasCache) { setCompanies([]); showError('기업 목록을 불러올 수 없습니다') } })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchCompanies('')
  }, [fetchCompanies])

  const search = useCallback((q) => {
    setQuery(q)
    fetchCompanies(q)
  }, [fetchCompanies])

  return { companies, loading, query, search }
}
