import { useState, useEffect, useCallback } from 'react'
import { useError } from '../contexts/ErrorContext'

const PAGE_SIZE = 50

export function useVariableScores() {
  const { showError } = useError()
  const [scores, setScores] = useState([])
  const [distribution, setDistribution] = useState({})
  const [loading, setLoading] = useState(true)
  const [gradeFilter, setGradeFilter] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchScores = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (gradeFilter) params.set('grade', gradeFilter)
    if (search) params.set('search', search)
    params.set('limit', String(PAGE_SIZE))
    params.set('offset', String((page - 1) * PAGE_SIZE))

    fetch(`/api/variables?${params}`)
      .then((r) => r.ok ? r.json() : { scores: [], distribution: {}, total: 0 })
      .then((data) => {
        setScores(data.scores || [])
        setDistribution(data.distribution || {})
        setTotalCount(data.total || 0)
      })
      .catch(() => {
        setScores([])
        setDistribution({})
        setTotalCount(0)
        showError('변수 분석을 불러올 수 없습니다')
      })
      .finally(() => setLoading(false))
  }, [gradeFilter, search, page, showError])

  useEffect(() => { fetchScores() }, [fetchScores])

  // 필터/검색 변경 시 1페이지 리셋
  const setGradeFilterAndReset = useCallback((g) => {
    setGradeFilter(g)
    setPage(1)
  }, [])

  const setSearchAndReset = useCallback((s) => {
    setSearch(s)
    setPage(1)
  }, [])

  return {
    scores, distribution, loading,
    gradeFilter, setGradeFilter: setGradeFilterAndReset,
    search, setSearch: setSearchAndReset,
    page, setPage, totalCount, pageSize: PAGE_SIZE,
    refresh: fetchScores,
  }
}

export function useVariableDetail(corpCode) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!corpCode) { setDetail(null); return }
    setLoading(true)
    fetch(`/api/variables/${corpCode}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setDetail(data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false))
  }, [corpCode])

  return { detail, loading }
}

export function useVariableDistribution() {
  const [distribution, setDistribution] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/variables/distribution')
      .then((r) => r.ok ? r.json() : {})
      .then((data) => setDistribution(data))
      .catch(() => setDistribution({}))
      .finally(() => setLoading(false))
  }, [])

  return { distribution, loading }
}
