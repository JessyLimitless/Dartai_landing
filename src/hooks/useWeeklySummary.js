import { useState, useEffect } from 'react'
import { useError } from '../contexts/ErrorContext'

export function useWeeklySummary() {
  const { showError } = useError()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/weekly-summary')
      .then((r) => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => { setData(null); showError('주간 요약을 불러올 수 없습니다') })
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}
