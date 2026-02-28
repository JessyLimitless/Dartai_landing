import { useState, useEffect, useRef } from 'react'

/**
 * AnimatedNumber — requestAnimationFrame-based count-up animation.
 * @param {number} value - target number
 * @param {number} duration - animation ms (default 600)
 * @param {function} format - optional formatter (value) => string
 */
export default function AnimatedNumber({ value, duration = 600, format }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const from = prevRef.current
    const to = value ?? 0
    if (from === to) return

    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out cubic
      const current = Math.round(from + (to - from) * eased)
      setDisplay(current)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        prevRef.current = to
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  const text = format ? format(display) : display.toLocaleString()
  return <>{text}</>
}
