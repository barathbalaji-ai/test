// Stipple brain diagram for the hero. Fills its (caller-positioned) parent.
// The brain is generated mathematically: a jittered grid of dots is clipped to
// the brain silhouette (point-in-polygon), and the sulci (fold grooves) +
// central fissure are carved out as gaps so the folds read clearly. Dots wiggle
// gently at rest and scatter from the cursor, springing back. A thin SVG
// outline sits behind to frame it like a diagram (and as a canvas fallback).
//
// Gotcha (bit the blueprint twice): give the WRAPPER exactly one position class
// from the caller (absolute …). Here we only use `absolute inset-0`, never a bare
// `relative`, and build via ResizeObserver so it never measures 0.
import { useEffect, useRef } from 'react'

// Lumpy brain outline control points in a padded box.
function outlineCtrl(bw, bh, ox, oy) {
  const x = (n) => ox + n * bw
  const y = (n) => oy + n * bh
  return [
    [x(0.16), y(0.5)], [x(0.14), y(0.34)], [x(0.26), y(0.2)], [x(0.4), y(0.16)],
    [x(0.5), y(0.22)], [x(0.6), y(0.15)], [x(0.74), y(0.18)], [x(0.86), y(0.3)],
    [x(0.88), y(0.46)], [x(0.86), y(0.62)], [x(0.76), y(0.78)], [x(0.62), y(0.86)],
    [x(0.5), y(0.82)], [x(0.38), y(0.87)], [x(0.24), y(0.8)], [x(0.15), y(0.66)],
  ]
}

// Sample the quadratic-smoothed outline into a dense polygon for hit-testing.
function outlinePolygon(ctrl, perSeg = 8) {
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const quad = (p0, pc, p1, t) => {
    const u = 1 - t
    return [u * u * p0[0] + 2 * u * t * pc[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * pc[1] + t * t * p1[1]]
  }
  const pts = []
  const n = ctrl.length
  for (let i = 0; i < n; i++) {
    const prev = ctrl[(i - 1 + n) % n]
    const cur = ctrl[i]
    const start = mid(prev, cur)
    const end = mid(cur, ctrl[(i + 1) % n])
    for (let s = 0; s < perSeg; s++) pts.push(quad(start, cur, end, s / perSeg))
  }
  return pts
}

function inside(poly, x, y) {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1]
    if (((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

export default function StippleBrain({ className = '' }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let dots = []
    let raf
    let W = 0
    let H = 0
    const DPR = Math.min(window.devicePixelRatio || 1, 2)

    function build() {
      const rect = wrap.getBoundingClientRect()
      W = Math.max(1, rect.width)
      H = Math.max(1, rect.height)
      canvas.width = W * DPR
      canvas.height = H * DPR
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)

      const padX = W * 0.06
      const padY = H * 0.07
      const bw = W - padX * 2
      const bh = H - padY * 2
      const poly = outlinePolygon(outlineCtrl(bw, bh, padX, padY))

      // Sulci: y = f(x) curves; dots within grooveHalf of one are skipped (folds).
      const SULCI = 7
      const grooveHalf = bh * 0.02
      const sulcusY = (i, x) => {
        const t = (x - padX) / bw
        const base = padY + (bh * (i + 0.75)) / (SULCI + 0.4)
        return base + Math.sin(t * 8 + i * 1.7) * (bh * 0.05) + Math.sin(t * 19 + i) * (bh * 0.02)
      }
      // Central fissure (vertical-ish gap).
      const fissureX = (y) => padX + bw * 0.5 + Math.sin(((y - padY) / bh) * 4.2) * (bw * 0.02)
      const fissureHalf = bw * 0.016

      dots = []
      const step = Math.max(3, Math.round(W / 115))
      for (let yy = padY * 0.5; yy < H; yy += step) {
        for (let xx = padX * 0.5; xx < W; xx += step) {
          const h = (xx * 13 + yy * 7) % 100
          const jx = (h % 5) - 2
          const jy = ((xx * 5 + yy * 11) % 5) - 2
          const px = xx + jx
          const py = yy + jy
          if (!inside(poly, px, py)) continue
          // carve grooves
          let inGroove = Math.abs(px - fissureX(py)) < fissureHalf
          for (let i = 0; i < SULCI && !inGroove; i++) {
            if (Math.abs(py - sulcusY(i, px)) < grooveHalf) inGroove = true
          }
          if (inGroove) continue
          if (h < 8) continue // sparse organic thinning
          dots.push({ x: px, y: py, ox: px, oy: py, vx: 0, vy: 0, p: h, a: 0.6 + (h % 35) / 100 })
        }
      }
    }

    let t = 0
    function frame() {
      t += 1
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#1A1712'
      const mx = mouse.current.x
      const my = mouse.current.y
      for (const d of dots) {
        const wob = reduced ? 0 : Math.sin(t / 18 + d.p) * 0.5
        const dx = d.x - mx
        const dy = d.y - my
        const dist2 = dx * dx + dy * dy
        if (dist2 < 80 * 80) {
          const dist = Math.sqrt(dist2) || 1
          const force = (80 - dist) / 80
          d.vx += (dx / dist) * force * 2.2
          d.vy += (dy / dist) * force * 2.2
        }
        d.vx += (d.ox - d.x) * 0.06
        d.vy += (d.oy - d.y) * 0.06
        d.vx *= 0.82
        d.vy *= 0.82
        d.x += d.vx
        d.y += d.vy
        ctx.globalAlpha = d.a
        ctx.fillRect(d.x + wob, d.y - wob, 1.8, 1.8)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect()
      mouse.current.x = e.clientX - rect.left
      mouse.current.y = e.clientY - rect.top
    }
    const onLeave = () => {
      mouse.current.x = -9999
      mouse.current.y = -9999
    }

    const ro = new ResizeObserver(() => build())
    ro.observe(wrap)
    build()
    window.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div ref={wrapRef} className={`absolute inset-0 ${className}`} aria-hidden>
      {/* Thin outline frames the stipple like a diagram (and is a canvas fallback). */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <path
          d="M16 50 C14 34 26 20 40 16 C50 22 60 15 74 18 C86 30 88 46 86 62 C76 78 62 86 50 82 C38 87 24 80 15 66 C16 60 14 54 16 50 Z"
          fill="none"
          stroke="#1A1712"
          strokeWidth="0.5"
        />
      </svg>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
