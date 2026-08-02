import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch } from '../lib/api'

/** 쿼리스트링 빌더 — null/undefined/'' 는 제외 */
function qs(params) {
  const p = new URLSearchParams()
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') p.set(k, v)
  })
  const s = p.toString()
  return s ? `?${s}` : ''
}

/**
 * 배당 데이터 fetcher.
 * kind: 'screener' | 'calendar' | 'capture'
 * 요청이 겹칠 때 늦게 도착한 이전 응답이 최신 결과를 덮지 않도록 순번으로 방어한다.
 */
export function useDividend(kind, params) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const seq = useRef(0)

  const key = JSON.stringify(params || {})

  const load = useCallback(async () => {
    const mine = ++seq.current
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch(`/api/dividend/${kind}${qs(params)}`)
      if (mine === seq.current) setData(res)
    } catch (e) {
      if (mine === seq.current) setError(e.message || '조회 실패')
    } finally {
      if (mine === seq.current) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, key])

  useEffect(() => { load() }, [load])

  return { data, loading, error, reload: load }
}

/** 종목 상세 (행 펼침용) — 열었을 때만 조회 */
export function useDividendStock(code) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!code) { setData(null); return }
    let alive = true
    setLoading(true)
    apiFetch(`/api/dividend/stock/${code}`)
      .then((r) => { if (alive) setData(r) })
      .catch(() => { if (alive) setData(null) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [code])

  return { data, loading }
}
