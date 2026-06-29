// Reactive stipple brain for the hero. Fills its (caller-positioned) parent.
// Draws a lumpy brain, clips to it, paints meandering gyri + fissure + stem,
// samples drawn pixels into stipple dots that wiggle at rest and scatter from
// the cursor, springing back. A deterministic SVG wireframe sits behind as a
// guaranteed-visible fallback.
//
// Gotcha (bit the blueprint twice): give the WRAPPER exactly one position class
// from the caller (absolute …). Here we only use `absolute inset-0`, never a bare
// `relative`, and build the canvas via ResizeObserver so it never measures 0.
import { useEffect, useRef } from 'react'

// Deterministic brain path (also used by the SVG fallback). Drawn in a 0..1 box.
function brainOutline(w, h) {
  const x = (n) => n * w
  const y = (n) => n * h
  // A lumpy ovoid with a few bumps; closed path.
  return [
    [x(0.16), y(0.5)],
    [x(0.14), y(0.34)],
    [x(0.26), y(0.2)],
    [x(0.4), y(0.16)],
    [x(0.5), y(0.22)],
    [x(0.6), y(0.15)],
    [x(0.74), y(0.18)],
    [x(0.86), y(0.3)],
    [x(0.88), y(0.46)],
    [x(0.86), y(0.62)],
    [x(0.76), y(0.78)],
    [x(0.62), y(0.86)],
    [x(0.5), y(0.82)],
    [x(0.38), y(0.87)],
    [x(0.24), y(0.8)],
    [x(0.15), y(0.66)],
  ]
}

function traceOutline(ctx, pts) {
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1]
    const [cx, cy] = pts[i]
    ctx.quadraticCurveTo(px, py, (px + cx) / 2, (py + cy) / 2)
  }
  // close smoothly back to start
  const [px, py] = pts[pts.length - 1]
  ctx.quadraticCurveTo(px, py, pts[0][0], pts[0][1])
  ctx.closePath()
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

      // Render the brain to an offscreen buffer, then sample pixels.
      const off = document.createElement('canvas')
      off.width = W
      off.height = H
      const o = off.getContext('2d')
      const pts = brainOutline(W * 0.92, H * 0.92)
      o.save()
      o.translate(W * 0.04, H * 0.04)
      traceOutline(o, pts)
      o.clip()
      // base fill
      o.fillStyle = '#000'
      o.fillRect(0, 0, W, H)
      // gyri folds — meandering strokes
      o.strokeStyle = '#fff'
      o.lineWidth = 2
      for (let i = 0; i < 16; i++) {
        o.beginPath()
        const baseY = (H * (i + 1)) / 17
        for (let xx = 0; xx <= W; xx += 8) {
          const wob = Math.sin(xx / 26 + i * 1.3) * 10 + Math.sin(xx / 11 + i) * 4
          const yy = baseY + wob
          if (xx === 0) o.moveTo(xx, yy)
          else o.lineTo(xx, yy)
        }
        o.stroke()
      }
      // central fissure + stem
      o.lineWidth = 3
      o.beginPath()
      o.moveTo(W * 0.5, H * 0.16)
      o.lineTo(W * 0.5, H * 0.82)
      o.stroke()
      o.beginPath()
      o.moveTo(W * 0.5, H * 0.82)
      o.lineTo(W * 0.52, H * 0.95)
      o.lineWidth = 6
      o.stroke()
      o.restore()

      // Sample bright pixels into stipple dots.
      const img = o.getImageData(0, 0, W, H).data
      dots = []
      const step = Math.max(4, Math.round(W / 90))
      for (let yy = 0; yy < H; yy += step) {
        for (let xx = 0; xx < W; xx += step) {
          const idx = (yy * W + xx) * 4
          const lum = img[idx] // white on black, so red channel ~ brightness
          const alpha = img[idx + 3]
          if (alpha > 10 && lum > 60) {
            // jitter a touch so it does not look like a grid
            const jx = ((xx * 13 + yy * 7) % 5) - 2
            const jy = ((xx * 5 + yy * 11) % 5) - 2
            dots.push({ x: xx + jx, y: yy + jy, ox: xx + jx, oy: yy + jy, vx: 0, vy: 0, p: (xx + yy) % 100 })
          }
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
        // wiggle at rest
        if (!reduced) {
          d.ox += 0 // origin fixed
        }
        const wob = reduced ? 0 : Math.sin(t / 16 + d.p) * 0.6
        // scatter from cursor
        const dx = d.x - mx
        const dy = d.y - my
        const dist2 = dx * dx + dy * dy
        if (dist2 < 90 * 90) {
          const dist = Math.sqrt(dist2) || 1
          const force = (90 - dist) / 90
          d.vx += (dx / dist) * force * 2.4
          d.vy += (dy / dist) * force * 2.4
        }
        // spring back to origin
        d.vx += (d.ox - d.x) * 0.06
        d.vy += (d.oy - d.y) * 0.06
        d.vx *= 0.82
        d.vy *= 0.82
        d.x += d.vx
        d.y += d.vy
        ctx.globalAlpha = 0.85
        ctx.fillRect(d.x + wob, d.y - wob, 1.6, 1.6)
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
      {/* Deterministic SVG wireframe fallback (always visible) */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <path
          d="M16 50 C14 34 26 20 40 16 C50 22 60 15 74 18 C86 30 88 46 86 62 C76 78 62 86 50 82 C38 87 24 80 15 66 C16 60 14 54 16 50 Z"
          fill="none"
          stroke="#1A1712"
          strokeWidth="0.8"
        />
        {[28, 38, 48, 58, 68].map((y, i) => (
          <path
            key={i}
            d={`M20 ${y} q10 -6 20 0 t20 0 t20 0`}
            fill="none"
            stroke="#1A1712"
            strokeWidth="0.5"
            opacity="0.6"
          />
        ))}
        <line x1="50" y1="18" x2="50" y2="82" stroke="#1A1712" strokeWidth="0.6" opacity="0.6" />
      </svg>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
