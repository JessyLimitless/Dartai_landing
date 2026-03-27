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
  const [prices, setPrices] = useState({})

  // 공시 + 시세 조회 — 캐시 없이 매번 서버에서 받은 값을 그대로 사용
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/disclosures?limit=200`)
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      const items = data.disclosures || []
      setDisclosures(items)
      setCounts(data.counts || { S: 0, A: 0, D: 0, total: 0 })

      const codes = [...new Set(items.map(d => d.stock_code).filter(Boolean))]
      if (codes.length > 0) {
        try {
          const pr = await fetch(`${API}/api/prices/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock_codes: codes }),
          })
          if (pr.ok) {
            setPrices(await pr.json()) // 캐시 없음 — 서버 응답을 그대로 사용
          }
        } catch {}
      }
    } catch {
      setDisclosures([])
      showError('공시 목록을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [showError])

  const fetchDetail = useCallback(async (rceptNo) => {
    setSelectedRceptNo(rceptNo)
    setDetailLoading(true)
    try {
      const res = await fetch(`${API}/api/disclosures/${rceptNo}`)
      if (!res.ok) throw new Error('fetch failed')
      setDetail(await res.json())
    } catch {
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  // 초기 로드
  useEffect(() => { fetchAll() }, [fetchAll])

  // 30분마다 전체 갱신 — 장중/장외 구분 없이 동일
  // 서버(prices/batch)가 장외에는 DB 종가를 반환하므로 프론트에서 분기 불필요
  useEffect(() => {
    const iv = setInterval(fetchAll, 600000) // 10분 (서버 캐시 갱신 주기와 동일)
    return () => clearInterval(iv)
  }, [fetchAll])

  return {
    disclosures, counts, loading,
    gradeFilter, setGradeFilter,
    search, setSearch,
    selectedRceptNo, detail, detailLoading,
    fetchDetail, setSelectedRceptNo,
    refresh: fetchAll,
    prices,
  }
}
