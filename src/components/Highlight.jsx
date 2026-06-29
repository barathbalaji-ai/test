// Marker highlighter sweep. Animates background-size via the `.hl` CSS class
// (stop-motion steps()), turning on when scrolled into view.
import { useEffect, useRef, useState } from 'react'

export default function Highlight({ children, className = '' }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold: 0.7 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <span ref={ref} className={`hl ${on ? 'is-on' : ''} ${className}`}>
      {children}
    </span>
  )
}
