import { useState, useEffect } from 'react'

export function useKospiStocks() {
  const [stocks, setStocks] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/kospi-stocks')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setStocks(data.stocks || [])
          setTotal(data.total || 0)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { stocks, total, loading }
}
