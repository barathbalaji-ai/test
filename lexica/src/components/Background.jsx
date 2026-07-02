import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/persist.js'

// The background universe: starfield + nebula + grain + vignette (doc §6).
// Lives entirely outside React's render loop.
export default function Background() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduced = prefersReducedMotion()
    let raf
    let stars = []

    const size = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      stars = Array.from({ length: Math.floor((canvas.width * canvas.height) / 9000) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.1 + 0.2,
        vx: (Math.random() - 0.5) * 1.4, // 0.5–2 px/s drift (doc §6)
        vy: (Math.random() - 0.5) * 1.4,
        tw: Math.random() * Math.PI * 2,
      }))
    }
    size()
    window.addEventListener('resize', size)

    let last = performance.now()
    const draw = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of stars) {
        if (!reduced) {
          s.x = (s.x + s.vx * dt + canvas.width) % canvas.width
          s.y = (s.y + s.vy * dt + canvas.height) % canvas.height
          s.tw += dt * 0.8
        }
        const a = 0.25 + 0.2 * Math.sin(s.tw)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,230,255,${a})`
        ctx.fill()
      }
      if (!reduced) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
      {/* nebulae — soft, low-opacity gravitational atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 22% 24%, rgba(45,80,190,0.10), transparent 70%),' +
            'radial-gradient(50% 45% at 78% 30%, rgba(30,140,110,0.08), transparent 70%),' +
            'radial-gradient(55% 55% at 50% 88%, rgba(150,50,60,0.08), transparent 70%),' +
            'radial-gradient(40% 40% at 20% 80%, rgba(110,70,190,0.08), transparent 70%)',
        }}
      />
      <canvas ref={ref} className="absolute inset-0" />
      {/* film grain */}
      <div className="absolute inset-0 lexica-grain" />
      {/* vignette — never exceeds 20% (doc §6) */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.18) 100%)' }}
      />
    </div>
  )
}
