import { useState, useEffect } from 'react'

export function useEdgeSignalDetail(corpCode) {
  const [signal, setSignal] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!corpCode) return
    setLoading(true)
    fetch(`/api/edge/signals/${corpCode}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setSignal(data))
      .catch(() => setSignal(null))
      .finally(() => setLoading(false))
  }, [corpCode])

  return { signal, loading }
}
