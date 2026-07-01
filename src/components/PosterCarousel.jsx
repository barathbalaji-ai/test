// Cinematic lazy-susan poster carousel. Posters sit on a turntable ring inside a
// dark, spotlit stage; the ring spins so the front poster faces you, with the
// side posters dimmed, blurred and receding for depth. Drag, use arrows/keys or
// a horizontal wheel/trackpad swipe, or click a side poster to bring it round.
// Clicking the front poster opens it (image lightbox, or the full guide for PDF
// posters). Title/description live BELOW the stage so they never fight the art.
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { PosterMotif } from './PosterCard.jsx'

const CARD_W = 300
const CARD_H = Math.round((CARD_W * 4) / 3)

function shortestDelta(to, from, n) {
  let d = (((to - from) % n) + n) % n
  if (d > n / 2) d -= n
  return d
}

function Face({ poster }) {
  const [ok, setOk] = useState(true)
  return (
    <div className="relative w-full h-full rounded-[6px] overflow-hidden ring-1 ring-black/50 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85)]">
      {poster.img && ok
        ? <img src={poster.img} alt={poster.title} onError={() => setOk(false)} draggable={false} className="absolute inset-0 w-full h-full object-cover" />
        : <PosterMotif poster={poster} />}
      {/* glossy top sheen */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 32%)' }} />
      {poster.guide && (
        <span className="absolute top-2 right-2 font-mono text-[8px] uppercase tracking-widest bg-chalk/90 text-ink px-1.5 py-0.5 rounded-[2px] shadow">Guide</span>
      )}
    </div>
  )
}

export default function PosterCarousel({ posters, onOpen }) {
  const n = posters.length
  const step = n ? 360 / n : 0
  const radius = n > 1 ? Math.max(CARD_W, (CARD_W / 2) / Math.tan((step / 2) * (Math.PI / 180))) * 1.18 : 0

  const rotation = useMotionValue(0)
  const idxRef = useRef(0)
  const [active, setActive] = useState(0)
  const dragRef = useRef(null)
  const movedRef = useRef(0)
  const wheelLock = useRef(0)

  const goTo = (i) => {
    idxRef.current = i
    setActive(((i % n) + n) % n)
    animate(rotation, -i * step, { type: 'spring', stiffness: 80, damping: 17 })
  }
  const next = () => goTo(idxRef.current + 1)
  const prev = () => goTo(idxRef.current - 1)

  useEffect(() => { idxRef.current = 0; setActive(0); rotation.set(0) // reset on filter change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') prev() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  // Drag WITHOUT pointer capture, so a tap still reaches the card's click.
  const onDown = (e) => { dragRef.current = { x: e.clientX, base: rotation.get() }; movedRef.current = 0 }
  const onMove = (e) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    movedRef.current = Math.max(movedRef.current, Math.abs(dx))
    rotation.set(dragRef.current.base + dx * 0.4)
  }
  const onUp = () => {
    if (!dragRef.current) return
    const moved = movedRef.current
    dragRef.current = null
    if (moved > 8) goTo(Math.round(-rotation.get() / step))
  }
  // Horizontal wheel/trackpad only — don't hijack vertical page scroll.
  const onWheel = (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return
    const now = Date.now()
    if (now - wheelLock.current < 260) return
    wheelLock.current = now
    e.deltaX > 0 ? next() : prev()
  }

  if (!n) return <p className="text-center font-hand text-2xl text-ink-soft py-16">No posters here yet.</p>
  const activePoster = posters[active]

  return (
    <div className="select-none">
      {/* Cinematic stage */}
      <div className="relative overflow-hidden rounded-[12px] border border-ink/25" style={{ height: CARD_H + 150 }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 95% at 50% 26%, #2c2820, #131009 72%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 170px rgba(0,0,0,0.8)' }} />

        <div
          className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
          style={{ perspective: 1500 }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
          onWheel={onWheel}
        >
          <motion.div className="absolute left-1/2" style={{ rotateY: rotation, transformStyle: 'preserve-3d', width: 0, height: 0, top: CARD_H / 2 + 30 }}>
            {posters.map((p, i) => {
              const dist = Math.abs(shortestDelta(i, active, n))
              const isActive = i === active
              const filter = isActive ? 'none' : dist === 1 ? 'brightness(0.6) saturate(0.9) blur(1.3px)' : 'brightness(0.4) saturate(0.8) blur(2.6px)'
              return (
                <div
                  key={p.id}
                  className="absolute transition-[opacity,filter] duration-300"
                  style={{
                    width: CARD_W, height: CARD_H, left: -CARD_W / 2, top: -CARD_H / 2,
                    transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                    backfaceVisibility: 'hidden',
                    opacity: dist >= 3 ? 0 : 1,
                    filter,
                    zIndex: isActive ? 30 : 20 - dist,
                  }}
                >
                  <button
                    data-cursor="link"
                    className="w-full h-full block"
                    onClick={() => {
                      if (movedRef.current > 8) return
                      if (isActive) onOpen(p)
                      else goTo(idxRef.current + shortestDelta(i, active, n))
                    }}
                    aria-label={p.title}
                  >
                    <Face poster={p} />
                  </button>
                </div>
              )
            })}
          </motion.div>

          {/* floor shadow under the front poster */}
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ bottom: 42, width: CARD_W * 0.82, height: 26, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.55), transparent 70%)', filter: 'blur(5px)' }} />
        </div>
      </div>

      {/* Info — below the art, always readable */}
      <div className="text-center mt-6 max-w-xl mx-auto">
        <div className="eyebrow">{activePoster.category}</div>
        <h3 className="mt-1 font-display italic font-black text-3xl tracking-tightest">{activePoster.title}</h3>
        {activePoster.caption && <p className="mt-2 text-ink-soft">{activePoster.caption}</p>}
        <button onClick={() => onOpen(activePoster)} data-cursor="link" className="mt-3 font-mono text-[10px] uppercase tracking-widest text-marker hover:underline">
          {activePoster.guide ? 'Open the full guide →' : 'Open poster →'}
        </button>
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center justify-center gap-5">
        <button onClick={prev} data-cursor="link" className="w-10 h-10 grid place-items-center rounded-full border-2 border-ink text-ink hover:bg-ink hover:text-chalk transition-colors" aria-label="Previous poster">‹</button>
        <span className="font-mono text-[10px] uppercase tracking-widest text-stone min-w-[64px] text-center">{active + 1} / {n}</span>
        <button onClick={next} data-cursor="link" className="w-10 h-10 grid place-items-center rounded-full border-2 border-ink text-ink hover:bg-ink hover:text-chalk transition-colors" aria-label="Next poster">›</button>
      </div>

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap">
        {posters.map((p, i) => (
          <button key={p.id} onClick={() => goTo(idxRef.current + shortestDelta(i, active, n))} data-cursor="link" className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-marker' : 'w-1.5 bg-ink/25 hover:bg-ink/50'}`} aria-label={`Go to ${p.title}`} />
        ))}
      </div>
    </div>
  )
}
