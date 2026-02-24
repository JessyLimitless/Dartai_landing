import { useState, useEffect } from 'react'
import { API } from '../lib/api'

export function useSupplyDemand(stockCode) {
  const [instTrend, setInstTrend] = useState([])
  const [foreignTrend, setForeignTrend] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!stockCode || stockCode.length !== 6) {
      setInstTrend([])
      setForeignTrend([])
      return
    }

    let cancelled = false
    setLoading(true)

    fetch(`${API}/api/companies/${stockCode}/supply-demand`)
      .then((r) => r.ok ? r.json() : { inst_trend: [], foreign_trend: [] })
      .then((data) => {
        if (cancelled) return
        setInstTrend(data.inst_trend || [])
        setForeignTrend(data.foreign_trend || [])
      })
      .catch(() => {
        if (!cancelled) {
          setInstTrend([])
          setForeignTrend([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [stockCode])

  return { instTrend, foreignTrend, loading }
}
