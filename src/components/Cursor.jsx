// Retro pixel-art arrow cursor. Follows the pointer SMOOTHLY via rAF (not 12fps).
// Swells / turns red over interactive elements. Disabled on touch / coarse pointers.
import { useEffect, useRef } from 'react'
import { isMotionPaused } from '../lib/motionPause.js'

const ARROW =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' shape-rendering='crispEdges'>
      <path d='M3 2 h2 v2 h2 v2 h2 v2 h2 v2 h2 v2 h-3 v2 h2 v2 h-2 v-2 h-2 v-2 h-2 v2 h-2 z' fill='#1A1712' stroke='#F5F1E8' stroke-width='0.5'/>
    </svg>`
  )

export default function Cursor() {
  const dotRef = useRef(null)
  const target = useRef({ x: -100, y: -100 })
  const pos = useRef({ x: -100, y: -100 })
  const linkRef = useRef(false)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine) return

    document.documentElement.classList.add('has-pixel-cursor')

    const onMove = (e) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
      const el = e.target
      const interactive = el?.closest?.(
        'a, button, input, textarea, select, [data-cursor="link"], [role="button"]'
      )
      linkRef.current = !!interactive
    }
    window.addEventListener('mousemove', onMove)

    let raf
    const loop = () => {
      if (isMotionPaused()) { raf = requestAnimationFrame(loop); return }
      // Smooth follow (lerp).
      pos.current.x += (target.current.x - pos.current.x) * 0.28
      pos.current.y += (target.current.y - pos.current.y) * 0.28
      const node = dotRef.current
      if (node) {
        const scale = linkRef.current ? 1.7 : 1
        node.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) scale(${scale})`
        node.style.filter = linkRef.current
          ? 'drop-shadow(0 0 0 #E0382B) hue-rotate(0deg)'
          : 'none'
        node.dataset.link = linkRef.current ? '1' : '0'
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.documentElement.classList.remove('has-pixel-cursor')
    }
  }, [])

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] w-6 h-6 -translate-x-px -translate-y-px will-change-transform"
      style={{ transformOrigin: '2px 2px' }}
      aria-hidden
    >
      {/* Red swell ring shown over interactive elements */}
      <span className="absolute inset-0 rounded-full bg-marker/0 data-[link=1]:bg-marker/20" />
      <img src={ARROW} alt="" className="pixelated w-6 h-6 block" draggable={false} />
    </div>
  )
}
