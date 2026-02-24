import { useState, useEffect, useCallback } from 'react'
import { useError } from '../contexts/ErrorContext'

export function useCompanyCards() {
  const { showError } = useError()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const fetchCompanies = useCallback((q) => {
    setLoading(true)
    const url = q
      ? `/api/companies/search?q=${encodeURIComponent(q)}&limit=30`
      : '/api/companies/search?limit=30'
    fetch(url)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setCompanies(data?.companies || []))
      .catch(() => { setCompanies([]); showError('기업 목록을 불러올 수 없습니다') })
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
