import { useState, useEffect, useCallback } from 'react'
import { useError } from '../contexts/ErrorContext'
import { API } from '../lib/api'

export function useIndustries() {
  const { showError } = useError()
  const [categories, setCategories] = useState([])
  const [totalCategories, setTotalCategories] = useState(0)
  const [totalCompanies, setTotalCompanies] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState(null)
  const [sortOrder, setSortOrder] = useState('desc')
  const [activeCategory, setActiveCategory] = useState(null)

  const fetchIndustries = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (sortKey) params.set('sort', sortKey)
    if (sortOrder) params.set('order', sortOrder)

    fetch(`${API}/api/industries?${params}`)
      .then((r) => r.ok ? r.json() : { categories: [], total_categories: 0, total_companies: 0 })
      .then((data) => {
        setCategories(data.categories || [])
        setTotalCategories(data.total_categories || 0)
        setTotalCompanies(data.total_companies || 0)
      })
      .catch(() => {
        setCategories([])
        setTotalCategories(0)
        setTotalCompanies(0)
        showError('업종 데이터를 불러올 수 없습니다')
      })
      .finally(() => setLoading(false))
  }, [sortKey, sortOrder, showError])

  useEffect(() => { fetchIndustries() }, [fetchIndustries])

  const toggleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortOrder((prev) => prev === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }, [sortKey])

  const selectCategory = useCallback((cat) => {
    setActiveCategory((prev) => prev === cat ? null : cat)
  }, [])

  return {
    categories,
    totalCategories,
    totalCompanies,
    loading,
    sortKey,
    sortOrder,
    activeCategory,
    toggleSort,
    selectCategory,
    refresh: fetchIndustries,
  }
}
