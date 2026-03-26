import { useState, useEffect, useCallback } from 'react'
import { API } from '../lib/api'

export function useLandingData() {
  const [disclosures, setDisclosures] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [discRes, statsRes] = await Promise.all([
        fetch(`${API}/api/disclosures?grade=S,A,D&limit=8`),
        fetch(`${API}/api/stats`),
      ])
      if (discRes.ok) {
        const data = await discRes.json()
        setDisclosures(data.disclosures || [])
      }
      if (statsRes.ok) {
        setStats(await statsRes.json())
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const iv = setInterval(fetchAll, 30000)
    return () => clearInterval(iv)
  }, [fetchAll])

  return { disclosures, stats, loading }
}
