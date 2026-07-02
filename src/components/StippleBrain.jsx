// Hero artwork — the "Cerebra" brain (background knocked out). We present the
// image with a gentle pointer parallax, a slow idle rotation + float, and a
// light layer of ink particles that drift off the brain and fade into the paper.
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { isMotionPaused } from '../lib/motionPause.js'

const INK = '26,23,18'

export default function StippleBrain() {
  const wrap = useRef(null)   // pointer parallax
  const canvas = useRef(null) // drifting particles

  // Pointer parallax
  useEffect(() => {
    const el = wrap.current
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5
        const y = e.clientY / window.innerHeight - 0.5
        el.style.transform = `translate3d(${x * -18}px, ${y * -18}px, 0) rotateX(${y * -2.5}deg) rotateY(${x * 3.5}deg)`
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove) }
  }, [])

  // Drifting ink particles
  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const ctx = cv.getContext('2d')
    let w = 1, h = 1, dpr = Math.min(window.devicePixelRatio || 1, 2), raf = 0
    const rand = (a, b) => a + Math.random() * (b - a)

    const parent = cv.parentElement
    const resize = () => {
      w = parent.clientWidth || 1; h = parent.clientHeight || 1
      cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ro = new ResizeObserver(resize); ro.observe(parent); resize()

    const N = 72
    const spawn = () => {
      // emit from within the central brain ellipse
      const cx = w * 0.5, cy = h * 0.48, rx = w * 0.36, ry = h * 0.26
      const a = rand(0, Math.PI * 2), rr = Math.sqrt(Math.random())
      const x = cx + Math.cos(a) * rx * rr
      const y = cy + Math.sin(a) * ry * rr
      // drift outward from centre, with a gentle upward bias
      const dx = (x - cx) / rx, dy = (y - cy) / ry
      const sp = rand(0.05, 0.28)
      return {
        x, y,
        vx: dx * sp + rand(-0.08, 0.08),
        vy: dy * sp * 0.6 - rand(0.06, 0.22),
        life: 0, max: rand(2.6, 6.2),
        size: rand(0.6, 2.2), amp: rand(0.18, 0.5),
      }
    }
    let ps = Array.from({ length: N }, () => { const p = spawn(); p.life = rand(0, p.max); return p })

    let last = 0
    const tick = (t) => {
      raf = requestAnimationFrame(tick)
      if (isMotionPaused()) { last = t; return }
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0.016
      last = t
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]
        p.life += dt
        if (p.life >= p.max) { ps[i] = spawn(); continue }
        p.x += p.vx; p.y += p.vy
        p.vy -= 0.006 // slight lift
        const k = p.life / p.max
        const fade = Math.sin(Math.PI * k) // 0→1→0
        ctx.fillStyle = `rgba(${INK},${(p.amp * fade).toFixed(3)})`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill()
      }
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <div className="relative w-full h-full" style={{ perspective: 1300 }}>
      <div ref={wrap} className="absolute inset-0 will-change-transform" style={{ transition: 'transform 0.25s ease-out' }}>
        <motion.img
          src="/stipple_brain.webp"
          alt="Cerebra — a cortical study"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1, rotate: [-2.2, 2.2, -2.2], y: [0, -12, 0] }}
          transition={{
            opacity: { duration: 0.9 },
            scale: { duration: 0.9 },
            rotate: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />
        <canvas ref={canvas} className="absolute inset-0 pointer-events-none" />
      </div>
    </div>
  )
}
