// Hero artwork — the "Cerebra" cortical-study print. It's a finished, framed
// illustration (its own labels + title), so we simply present the image with a
// gentle pointer parallax + idle float for a little life. Fills its parent.
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function StippleBrain() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5
        const y = e.clientY / window.innerHeight - 0.5
        el.style.transform = `translate3d(${x * -16}px, ${y * -16}px, 0) rotateX(${y * -2.5}deg) rotateY(${x * 3}deg)`
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove) }
  }, [])

  return (
    <div className="relative w-full h-full" style={{ perspective: 1200 }}>
      {/* wrapper carries the pointer parallax; the image carries its own float */}
      <div ref={ref} className="absolute inset-0 will-change-transform" style={{ transition: 'transform 0.25s ease-out' }}>
        <motion.img
          src="/stipple_brain.png"
          alt="Cerebra — a cortical study"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{ opacity: { duration: 0.8 }, scale: { duration: 0.8 }, y: { duration: 9, repeat: Infinity, ease: 'easeInOut' } }}
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />
      </div>
    </div>
  )
}
