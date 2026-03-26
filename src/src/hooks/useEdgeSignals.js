import { useState, useEffect } from 'react'
import { API } from '../lib/api'

export function useEdgeSignalDetail(corpCode) {
  const [signal, setSignal] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!corpCode) return
    setLoading(true)
    fetch(`${API}/api/edge/signals/${corpCode}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setSignal(data))
      .catch(() => setSignal(null))
      .finally(() => setLoading(false))
  }, [corpCode])

  return { signal, loading }
}
