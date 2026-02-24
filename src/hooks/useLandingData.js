import { useState, useEffect, useCallback } from 'react'

export function useLandingData() {
  const [disclosures, setDisclosures] = useState([])
  const [stats, setStats] = useState(null)
  const [recentCards, setRecentCards] = useState(null)
  const [variableDist, setVariableDist] = useState(null)
  const [foreignFlow, setForeignFlow] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [discRes, statsRes, cardsRes, varRes, flowRes] = await Promise.all([
        fetch('/api/disclosures?grade=S,A,D&limit=8'),
        fetch('/api/stats'),
        fetch('/api/companies/recent?limit=5'),
        fetch('/api/variables?limit=1'),
        fetch('/api/foreign-flow?period=week'),
      ])
      if (discRes.ok) {
        const data = await discRes.json()
        setDisclosures(data.disclosures || [])
      }
      if (statsRes.ok) {
        setStats(await statsRes.json())
      }
      if (cardsRes.ok) {
        const data = await cardsRes.json()
        setRecentCards(data.cards || [])
      }
      if (varRes.ok) {
        const data = await varRes.json()
        setVariableDist(data.distribution || null)
      }
      if (flowRes.ok) {
        const data = await flowRes.json()
        setForeignFlow(data.items || [])
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

  return { disclosures, stats, recentCards, variableDist, foreignFlow, loading }
}
