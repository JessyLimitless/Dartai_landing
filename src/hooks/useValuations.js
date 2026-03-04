import { useState, useEffect, useCallback } from 'react'
import { useError } from '../contexts/ErrorContext'
import { API } from '../lib/api'

export function useValuations() {
  const { showError } = useError()
  const [companies, setCompanies] = useState([])
  const [summary, setSummary] = useState({ total: 0, risk_count: 0, undervalued_count: 0, overvalued_count: 0 })
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState('market_cap')
  const [sortOrder, setSortOrder] = useState('desc')
  const [activeFilter, setActiveFilter] = useState(null) // null | 'undervalued' | 'overvalued' | 'risk'

  const fetchValuations = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (sortKey) params.set('sort', sortKey)
    if (sortOrder) params.set('order', sortOrder)

    fetch(`${API}/api/valuations?${params}`)
      .then((r) => r.ok ? r.json() : { companies: [], summary: {} })
      .then((data) => {
        setCompanies(data.companies || [])
        setSummary(data.summary || { total: 0, risk_count: 0, undervalued_count: 0, overvalued_count: 0 })
      })
      .catch(() => {
        setCompanies([])
        setSummary({ total: 0, risk_count: 0, undervalued_count: 0, overvalued_count: 0 })
        showError('밸류에이션 데이터를 불러올 수 없습니다')
      })
      .finally(() => setLoading(false))
  }, [sortKey, sortOrder, showError])

  useEffect(() => { fetchValuations() }, [fetchValuations])

  const toggleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortOrder((prev) => prev === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }, [sortKey])

  const setFilter = useCallback((filter) => {
    setActiveFilter((prev) => prev === filter ? null : filter)
  }, [])

  const filtered = companies.filter((c) => {
    if (!activeFilter) return true
    if (activeFilter === 'risk') return c.risk_flags && c.risk_flags.length > 0
    if (activeFilter === 'undervalued') return c.peer?.verdict === '저평가'
    if (activeFilter === 'overvalued') return c.peer?.verdict === '고평가'
    return true
  })

  return {
    companies: filtered,
    allCompanies: companies,
    summary,
    loading,
    sortKey,
    sortOrder,
    toggleSort,
    activeFilter,
    setFilter,
    refresh: fetchValuations,
  }
}
