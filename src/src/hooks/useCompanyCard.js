import { useState, useEffect } from 'react'
import { useError } from '../contexts/ErrorContext'
import { API } from '../lib/api'

export function useCompanyCard(corpCode) {
  const { showError } = useError()
  const [card, setCard] = useState(null)
  const [trend, setTrend] = useState(null)
  const [candles, setCandles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!corpCode) {
      setCard(null)
      setTrend(null)
      setCandles([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      fetch(`${API}/api/companies/${corpCode}/card`).then((r) => r.ok ? r.json() : null),
      fetch(`${API}/api/companies/${corpCode}/candles?days=60`).then((r) => r.ok ? r.json() : null),
    ])
      .then(([cardData, candleData]) => {
        if (cancelled) return
        if (cardData) {
          setCard(cardData.card || null)
          setTrend(cardData.trend || null)
        } else {
          setCard(null)
          setTrend(null)
          setError('기업 카드를 찾을 수 없습니다')
        }
        setCandles(candleData?.candles || [])
      })
      .catch(() => {
        if (!cancelled) {
          setError('데이터를 불러오는 중 오류가 발생했습니다')
          showError('기업 카드를 불러올 수 없습니다')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [corpCode])

  return { card, trend, candles, loading, error }
}
