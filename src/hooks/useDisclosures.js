import { useState, useEffect, useCallback } from 'react'
import { useError } from '../contexts/ErrorContext'
import { API } from '../lib/api'

export function useDisclosures() {
  const { showError } = useError()
  const [disclosures, setDisclosures] = useState([])
  const [counts, setCounts] = useState({ S: 0, A: 0, D: 0, total: 0 })
  const [loading, setLoading] = useState(false)
  const [gradeFilter, setGradeFilter] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedRceptNo, setSelectedRceptNo] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [prices, setPrices] = useState({}) // stock_code → {price, change_pct}

  const fetchDisclosures = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (gradeFilter) params.set('grade', gradeFilter)
      if (search.trim()) params.set('search', search.trim())
      params.set('limit', '100')

      const res = await fetch(`${API}/api/disclosures?${params}`)
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      const items = data.disclosures || []
      setDisclosures(items)
      setCounts(data.counts || { S: 0, A: 0, D: 0, total: 0 })

      // 종목코드 있는 것만 배치 시세 조회
      const codes = [...new Set(items.map(d => d.stock_code).filter(Boolean))]
      if (codes.length > 0) {
        fetch(`${API}/api/prices/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock_codes: codes }),
        })
          .then(r => r.ok ? r.json() : {})
          .then(priceMap => setPrices(priceMap))
          .catch(() => {})
      }
    } catch {
      setDisclosures([])
      showError('공시 목록을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [gradeFilter, search, showError])

  const fetchDetail = useCallback(async (rceptNo) => {
    setSelectedRceptNo(rceptNo)
    setDetailLoading(true)
    try {
      const res = await fetch(`${API}/api/disclosures/${rceptNo}`)
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setDetail(data)
    } catch {
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDisclosures()
  }, [fetchDisclosures])

  return {
    disclosures,
    counts,
    loading,
    gradeFilter,
    setGradeFilter,
    search,
    setSearch,
    selectedRceptNo,
    detail,
    detailLoading,
    fetchDetail,
    setSelectedRceptNo,
    refresh: fetchDisclosures,
    prices,
  }
}
