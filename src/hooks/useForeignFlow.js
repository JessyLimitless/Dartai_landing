import { useState, useEffect, useCallback } from 'react'
import { useError } from '../contexts/ErrorContext'

export function useForeignFlow() {
  const { showError } = useError()
  const [tab, setTab] = useState('foreign')          // 'foreign' | 'institutional'
  const [period, setPeriod] = useState('week')         // 'day' | 'week' | 'month'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(() => {
    setLoading(true)
    const endpoint = tab === 'foreign'
      ? `/api/foreign-flow?period=${period}`
      : `/api/institutional-flow?period=${period}`

    fetch(endpoint)
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((data) => {
        setItems(data.items || [])
      })
      .catch(() => {
        setItems([])
        showError('수급 데이터를 불러올 수 없습니다')
      })
      .finally(() => setLoading(false))
  }, [tab, period, showError])

  useEffect(() => { fetchData() }, [fetchData])

  return {
    tab,
    setTab,
    period,
    setPeriod,
    items,
    loading,
    refresh: fetchData,
  }
}
