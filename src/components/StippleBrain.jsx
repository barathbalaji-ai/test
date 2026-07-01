// Interactive 3D stipple brain for the hero — a point cloud of two hemispheres,
// cerebellum and stem, shaded by a gyri/sulci noise field, rendered as soft ink
// dots on the paper. Drag to rotate; it also auto-spins and reacts to the
// pointer. Adapted from the Cerebra study. `three` is loaded on demand (dynamic
// import) so it never blocks first paint; the page shows immediately and the
// brain streams in. Transparent background; fogged toward the paper for depth.
import { useEffect, useRef } from 'react'

const PAPER = 0xe9e3d6

// value noise / fbm helpers
const fract = (x) => x - Math.floor(x)
const smooth = (t) => t * t * (3 - 2 * t)
const hash3 = (x, y, z) => fract(Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453)
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const xf = x - xi, yf = y - yi, zf = z - zi
  const u = smooth(xf), v = smooth(yf), w = smooth(zf)
  const g = (a, b, c) => hash3(xi + a, yi + b, zi + c)
  const x00 = g(0, 0, 0) * (1 - u) + g(1, 0, 0) * u, x10 = g(0, 1, 0) * (1 - u) + g(1, 1, 0) * u
  const x01 = g(0, 0, 1) * (1 - u) + g(1, 0, 1) * u, x11 = g(0, 1, 1) * (1 - u) + g(1, 1, 1) * u
  const y0 = x00 * (1 - v) + x10 * v, y1 = x01 * (1 - v) + x11 * v
  return y0 * (1 - w) + y1 * w
}
function fbm(x, y, z, oct = 4) {
  let a = 0, amp = 0.5, f = 1, nrm = 0
  for (let i = 0; i < oct; i++) { a += amp * vnoise(x * f, y * f, z * f); nrm += amp; amp *= 0.5; f *= 2 }
  return a / nrm
}
const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

function dotTexture(THREE) {
  const c = document.createElement('canvas'); c.width = c.height = 64
  const g = c.getContext('2d')
  const rg = g.createRadialGradient(32, 32, 0, 32, 32, 30)
  rg.addColorStop(0, 'rgba(255,255,255,1)')
  rg.addColorStop(0.55, 'rgba(255,255,255,1)')
  rg.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = rg; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill()
  return new THREE.CanvasTexture(c)
}

function buildGeometry(THREE) {
  const L = (() => { const v = [-0.45, 0.72, 0.52]; const m = Math.hypot(v[0], v[1], v[2]); return [v[0] / m, v[1] / m, v[2] / m] })()
  const parts = [
    { c: [0, 0.05, 0.6], r: [1.38, 1.04, 0.66], sign: 1, kind: 'hemi', n: 78000 },
    { c: [0, 0.05, -0.6], r: [1.38, 1.04, 0.66], sign: -1, kind: 'hemi', n: 78000 },
    { c: [-0.98, -0.55, 0], r: [0.6, 0.5, 0.74], sign: 0, kind: 'cbl', n: 34000 },
    { c: [-0.34, -1.02, 0.02], r: [0.2, 0.55, 0.2], sign: 0, kind: 'stem', n: 11000 },
  ]
  const pos = [], col = []
  const GA = Math.PI * (1 + Math.sqrt(5))
  const inkR = 0.09, inkG = 0.075, inkB = 0.11, litR = 0.34, litG = 0.33, litB = 0.32
  for (const P of parts) {
    const { c, r, n: N } = P
    for (let i = 0; i < N; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / N), th = GA * i
      const dx = Math.sin(phi) * Math.cos(th), dy = Math.cos(phi), dz = Math.sin(phi) * Math.sin(th)
      if (P.kind === 'hemi' && dz * P.sign < -0.32) continue
      let x = c[0] + dx * r[0], y = c[1] + dy * r[1], z = c[2] + dz * r[2]
      let nx = dx / r[0], ny = dy / r[1], nz = dz / r[2]
      const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl
      const warp = (fbm(x * 0.85 + 7, y * 0.85, z * 0.85, 4) - 0.5) * 2.2
      const nn = fbm(x * 2.15 + warp, y * 2.15 + warp * 0.6, z * 2.15 - warp, 4)
      const stripe = Math.abs(fract(nn * 3.4) - 0.5) * 2
      const groove = 1 - ss(0, 0.42, stripe)
      const lam = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2])
      const shadeDark = 1 - lam
      let dark = 0.7 * groove + 0.5 * shadeDark + 0.1
      if (P.kind === 'stem') dark = 0.35 + 0.35 * shadeDark
      dark = Math.max(0, Math.min(1, dark))
      if (Math.random() >= Math.pow(dark, 1.25) * 0.94) continue
      const disp = -groove * 0.055 + (nn - 0.5) * 0.045
      x += nx * disp; y += ny * disp; z += nz * disp
      pos.push(x, y, z)
      const t = dark
      col.push(litR + (inkR - litR) * t, litG + (inkG - litG) * t, litB + (inkB - litB) * t)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  return geo
}

const LABELS = [
  { t: 'THINKING', s: 'top-[12%] left-0' },
  { t: 'ANALYSING', s: 'top-[8%] right-0 text-right' },
  { t: 'FEELING', s: 'bottom-[16%] left-0' },
  { t: 'WRITING', s: 'bottom-[8%] left-1/2 -translate-x-1/2 text-center' },
]

export default function StippleBrain({ showLabels = false }) {
  const mount = useRef(null)

  useEffect(() => {
    const el = mount.current
    if (!el) return
    let cleanup = null
    let cancelled = false

    import('three').then((THREE) => {
      if (cancelled || !mount.current) return
      let w = el.clientWidth || 1, h = el.clientHeight || 1

      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(PAPER, 0.1)
      const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100)
      camera.position.set(0, 0, 7.2)
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(w, h)
      renderer.setClearColor(PAPER, 0)
      el.appendChild(renderer.domElement)
      const cv = renderer.domElement
      cv.style.display = 'block'; cv.style.width = '100%'; cv.style.height = '100%'; cv.style.touchAction = 'pan-y'

      const sprite = dotTexture(THREE)
      const geo = buildGeometry(THREE)
      const mat = new THREE.PointsMaterial({ size: 0.017, map: sprite, vertexColors: true, transparent: true, opacity: 0.92, alphaTest: 0.35, sizeAttenuation: true, depthWrite: false, fog: true })
      const group = new THREE.Group(); group.add(new THREE.Points(geo, mat)); scene.add(group)

      const rot = { x: -0.14, y: -0.78 }
      const par = { x: 0, y: 0 }
      let drag = false, lx = 0, ly = 0, raf = 0
      const autospin = 0.0024

      const pt = (e) => { const t = e.touches ? e.touches[0] : e; return { x: t.clientX, y: t.clientY } }
      const down = (e) => { drag = true; const p = pt(e); lx = p.x; ly = p.y }
      const move = (e) => {
        if (!drag) return
        const p = pt(e)
        rot.y += (p.x - lx) * 0.006; rot.x += (p.y - ly) * 0.006
        rot.x = Math.max(-1.2, Math.min(1.2, rot.x)); lx = p.x; ly = p.y
        if (e.cancelable) e.preventDefault()
      }
      const up = () => { drag = false }
      const parallax = (e) => {
        const r = el.getBoundingClientRect()
        par.x = ((e.clientY - r.top) / r.height - 0.5) * 0.3
        par.y = ((e.clientX - r.left) / r.width - 0.5) * 0.5
      }

      cv.addEventListener('mousedown', down)
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
      cv.addEventListener('touchstart', down, { passive: true })
      window.addEventListener('touchmove', move, { passive: false })
      window.addEventListener('touchend', up)
      window.addEventListener('mousemove', parallax)

      const ro = new ResizeObserver(() => {
        w = el.clientWidth || 1; h = el.clientHeight || 1
        camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h)
      })
      ro.observe(el)

      const animate = () => {
        raf = requestAnimationFrame(animate)
        if (!drag) rot.y += autospin
        group.rotation.y += ((rot.y + par.y) - group.rotation.y) * 0.08
        group.rotation.x += ((rot.x + par.x) - group.rotation.x) * 0.08
        renderer.render(scene, camera)
      }
      animate()

      cleanup = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        cv.removeEventListener('mousedown', down)
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseup', up)
        cv.removeEventListener('touchstart', down)
        window.removeEventListener('touchmove', move)
        window.removeEventListener('touchend', up)
        window.removeEventListener('mousemove', parallax)
        geo.dispose(); mat.dispose(); sprite.dispose(); renderer.dispose()
        if (cv.parentNode) cv.parentNode.removeChild(cv)
      }
    })

    return () => { cancelled = true; if (cleanup) cleanup() }
  }, [])

  return (
    <div className="relative w-full h-full">
      <div ref={mount} className="absolute inset-0" />
      {showLabels && (
        <div className="absolute inset-0 pointer-events-none hidden xl:block">
          {LABELS.map((l) => (
            <span key={l.t} className={`absolute ${l.s} font-mono text-[10px] tracking-[0.3em] text-stone/80`}>{l.t}</span>
          ))}
        </div>
      )}
    </div>
  )
}
