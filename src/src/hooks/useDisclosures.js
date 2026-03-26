import { useState, useEffect, useCallback, useRef } from 'react'
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
  const pricesRef = useRef({}) // 누적 캐시 — 필터 변경 시에도 유지

  const fetchDisclosures = useCallback(async () => {
    setLoading(true)
    try {
      // 전체 공시를 항상 가져옴 (필터링은 클라이언트에서)
      const params = new URLSearchParams()
      params.set('limit', '200')

      const res = await fetch(`${API}/api/disclosures?${params}`)
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      const items = data.disclosures || []
      setDisclosures(items)
      setCounts(data.counts || { S: 0, A: 0, D: 0, total: 0 })

      // 종목코드 있는 것만 배치 시세 조회 (이미 캐시에 있는 것 제외)
      const allCodes = [...new Set(items.map(d => d.stock_code).filter(Boolean))]
      const newCodes = allCodes.filter(c => !pricesRef.current[c])
      const codesToFetch = newCodes.length > 0 ? newCodes : allCodes // 초회엔 전부, 이후엔 새것만

      if (codesToFetch.length > 0) {
        try {
          const priceRes = await fetch(`${API}/api/prices/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock_codes: codesToFetch }),
          })
          if (priceRes.ok) {
            const priceMap = await priceRes.json()
            // 누적 병합 — 기존 데이터 보존 + 새 데이터 덮어쓰기
            pricesRef.current = { ...pricesRef.current, ...priceMap }
            setPrices({ ...pricesRef.current })
          }
        } catch {
          // 시세 조회 실패해도 기존 캐시는 유지
          if (Object.keys(pricesRef.current).length > 0) {
            setPrices({ ...pricesRef.current })
          }
        }
      }
    } catch {
      setDisclosures([])
      showError('공시 목록을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [showError]) // gradeFilter, search 제거 — 서버 필터링 안 함

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

  // 초기 로드 + 30초 간격 자동 갱신 (시세 업데이트)
  useEffect(() => {
    fetchDisclosures()
    const iv = setInterval(fetchDisclosures, 30000)
    return () => clearInterval(iv)
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
