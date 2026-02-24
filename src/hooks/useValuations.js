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
  const [riskOnly, setRiskOnly] = useState(false)

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

  const toggleRiskOnly = useCallback(() => {
    setRiskOnly((prev) => !prev)
  }, [])

  const filtered = riskOnly
    ? companies.filter((c) => c.risk_flags && c.risk_flags.length > 0)
    : companies

  return {
    companies: filtered,
    allCompanies: companies,
    summary,
    loading,
    sortKey,
    sortOrder,
    toggleSort,
    riskOnly,
    toggleRiskOnly,
    refresh: fetchValuations,
  }
}
