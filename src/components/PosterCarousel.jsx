// Lazy-susan poster carousel. Posters sit on a turntable ring in 3D; the ring
// spins around its vertical axis so the front poster faces you. Drag, use the
// arrows/keys, or click a side poster to bring it round. Clicking the front
// poster opens it. Snappy spring physics.
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { PosterMotif } from './PosterCard.jsx'

const CARD_W = 280
const CARD_H = Math.round((CARD_W * 4) / 3)

// signed shortest number of steps from residue `from` to residue `to` on a ring of n
function shortestDelta(to, from, n) {
  let d = (((to - from) % n) + n) % n
  if (d > n / 2) d -= n
  return d
}

function Face({ poster }) {
  const [imgOk, setImgOk] = useState(true)
  return (
    <div className="relative w-full h-full rounded-[4px] overflow-hidden border border-ink/15 bg-chalk shadow-hard">
      {poster.img && imgOk ? (
        <img src={poster.img} alt={poster.title} onError={() => setImgOk(false)} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      ) : (
        <PosterMotif poster={poster} />
      )}
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 60px rgba(26,23,18,0.35)' }} />
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-ink/80 to-transparent">
        <span className="font-mono text-[9px] uppercase tracking-widest text-chalk/70">{poster.category}</span>
        <div className="font-display italic font-bold text-chalk text-lg leading-tight">{poster.title}</div>
      </div>
    </div>
  )
}

export default function PosterCarousel({ posters, onOpen }) {
  const n = posters.length
  const step = n ? 360 / n : 0
  const radius = n > 1
    ? Math.max(CARD_W, (CARD_W / 2) / Math.tan((step / 2) * (Math.PI / 180))) * 1.12
    : 0

  const rotation = useMotionValue(0)
  const idxRef = useRef(0)
  const [active, setActive] = useState(0)
  const drag = useRef(null)

  const goTo = (i) => {
    idxRef.current = i
    setActive(((i % n) + n) % n)
    animate(rotation, -i * step, { type: 'spring', stiffness: 90, damping: 18 })
  }
  const next = () => goTo(idxRef.current + 1)
  const prev = () => goTo(idxRef.current - 1)

  // Reset when the poster set changes (e.g. filter).
  useEffect(() => { idxRef.current = 0; setActive(0); rotation.set(0) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  const onDown = (e) => { drag.current = { x: e.clientX, base: rotation.get(), moved: 0 }; e.currentTarget.setPointerCapture?.(e.pointerId) }
  const onMove = (e) => {
    if (!drag.current) return
    const d = e.clientX - drag.current.x
    drag.current.moved = Math.max(drag.current.moved, Math.abs(d))
    rotation.set(drag.current.base + d * 0.4)
  }
  const onUp = () => {
    if (!drag.current) return
    const snapped = Math.round(-rotation.get() / step)
    drag.current = null
    goTo(snapped)
  }

  if (!n) return <p className="text-center font-hand text-2xl text-ink-soft py-16">No posters here yet.</p>

  const activePoster = posters[active]

  return (
    <div className="select-none">
      <div
        className="relative mx-auto touch-none cursor-grab active:cursor-grabbing"
        style={{ height: CARD_H + 90, perspective: 1400, maxWidth: 780 }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <motion.div
          className="absolute left-1/2 top-1/2"
          style={{ rotateY: rotation, transformStyle: 'preserve-3d', width: 0, height: 0 }}
        >
          {posters.map((p, i) => {
            const isActive = i === active
            return (
              <div
                key={p.id}
                className="absolute transition-opacity duration-300"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  left: -CARD_W / 2,
                  top: -CARD_H / 2,
                  transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                  opacity: isActive ? 1 : 0.45,
                }}
              >
                <button
                  data-cursor="link"
                  onClick={() => {
                    if (drag.current) return
                    if (isActive) onOpen(p)
                    else goTo(idxRef.current + shortestDelta(i, active, n))
                  }}
                  className="w-full h-full block"
                  style={{ transform: isActive ? 'scale(1)' : 'scale(0.9)', transition: 'transform 0.3s' }}
                  aria-label={p.title}
                >
                  <Face poster={p} />
                </button>
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-center gap-5">
        <button onClick={prev} data-cursor="link" className="w-10 h-10 grid place-items-center rounded-full border-2 border-ink text-ink hover:bg-ink hover:text-chalk transition-colors" aria-label="Previous poster">‹</button>
        <div className="text-center min-w-[180px]">
          <div className="font-display italic font-bold text-xl leading-tight">{activePoster.title}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-stone mt-0.5">{active + 1} / {n} · click to open</div>
        </div>
        <button onClick={next} data-cursor="link" className="w-10 h-10 grid place-items-center rounded-full border-2 border-ink text-ink hover:bg-ink hover:text-chalk transition-colors" aria-label="Next poster">›</button>
      </div>

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {posters.map((p, i) => (
          <button
            key={p.id}
            onClick={() => goTo(idxRef.current + shortestDelta(i, active, n))}
            data-cursor="link"
            className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-marker' : 'w-1.5 bg-ink/25 hover:bg-ink/50'}`}
            aria-label={`Go to ${p.title}`}
          />
        ))}
      </div>
    </div>
  )
}
