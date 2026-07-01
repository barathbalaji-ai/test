// An editorial "thick book" of posters. Each poster is a spread: the left page
// is the full poster (never cropped), the right page is its name + description.
// Turning a page runs a weighted 3D page-flip with a few pages fluttering, then
// settles to reveal the next spread. Drag / arrows / dots / click all navigate.
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { PosterMotif } from './PosterCard.jsx'

const EASE = [0.76, 0, 0.24, 1]
const DUR = 0.9

// ── page faces ──────────────────────────────────────────────────────────────
function PosterFace({ poster, onOpen }) {
  const [ok, setOk] = useState(true)
  return (
    <div className="absolute inset-0 bg-[#F3EEE1] flex items-center justify-center p-5 sm:p-7">
      {/* gutter shadow (spine side = right edge of the left page) */}
      <div className="absolute inset-y-0 right-0 w-14 pointer-events-none" style={{ background: 'linear-gradient(to right, transparent, rgba(26,23,18,0.16))' }} />
      <button
        onClick={() => onOpen?.(poster)}
        data-cursor="link"
        className="relative block h-full w-full"
        aria-label={`Open ${poster.title}`}
      >
        {poster.img && ok
          ? <img src={poster.img} alt={poster.title} draggable={false} onError={() => setOk(false)} className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_10px_24px_rgba(26,23,18,0.28)]" />
          : <div className="absolute inset-0 rounded-[3px] overflow-hidden"><PosterMotif poster={poster} /></div>}
      </button>
    </div>
  )
}

function TextFace({ poster, num, total, onOpen }) {
  return (
    <div className="absolute inset-0 bg-[#F7F3E9] flex flex-col justify-center px-8 sm:px-12 py-10">
      {/* gutter shadow (spine side = left edge of the right page) */}
      <div className="absolute inset-y-0 left-0 w-14 pointer-events-none" style={{ background: 'linear-gradient(to left, transparent, rgba(26,23,18,0.16))' }} />
      <div className="relative">
        <div className="eyebrow">{poster.category}</div>
        <h3 className="mt-3 font-display italic font-black text-3xl sm:text-4xl md:text-5xl tracking-tightest leading-[0.95]">{poster.title}</h3>
        <div className="mt-5 w-12 h-px bg-ink/40" />
        {poster.caption && <p className="mt-5 text-ink-soft leading-relaxed max-w-sm">{poster.caption}</p>}
        <button onClick={() => onOpen?.(poster)} data-cursor="link" className="mt-7 btn-ink text-[10px]">
          {poster.guide ? 'Open the full guide →' : 'Open poster →'}
        </button>
      </div>
      <div className="absolute bottom-6 right-8 sm:right-12 font-mono text-[10px] uppercase tracking-widest text-stone">
        {String(num).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
    </div>
  )
}

// ── the book ─────────────────────────────────────────────────────────────────
export default function PosterBook({ posters, onOpen }) {
  const n = posters.length
  const [index, setIndex] = useState(0)
  const [anim, setAnim] = useState(null) // { dir: 1|-1, target }
  const rot = useMotionValue(0)
  const drag = useRef(null)
  const moved = useRef(false)
  const reduced = useRef(false)

  // Open the lightbox on a genuine click, not at the end of a drag.
  const guardedOpen = (p) => { if (moved.current) { moved.current = false; return } onOpen?.(p) }

  useEffect(() => {
    reduced.current = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }, [])
  useEffect(() => { setIndex(0); setAnim(null) }, [n]) // reset on filter change

  // Sheen strengthens as the page passes vertical (|rot| → 90°).
  const sheen = useTransform(rot, (v) => {
    const a = Math.abs(v)
    return (a < 90 ? a / 90 : (180 - a) / 90) * 0.5
  })

  const go = (target) => {
    if (anim || target === index || target < 0 || target >= n) return
    if (reduced.current) { setIndex(target); return }
    const dir = target > index ? 1 : -1
    setAnim({ dir, target })
  }
  const next = () => go(index + 1)
  const prev = () => go(index - 1)

  useEffect(() => {
    if (!anim) return
    rot.set(0)
    const controls = animate(rot, anim.dir === 1 ? -180 : 180, { duration: DUR, ease: EASE })
    controls.then(() => { setIndex(anim.target); setAnim(null); rot.set(0) })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') prev() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, anim, n])

  if (!n) return <p className="text-center font-hand text-2xl text-ink-soft py-16">No posters here yet.</p>

  // Underlying spread content (what shows beneath/around the flipping sheet).
  const leftPoster = anim ? (anim.dir === 1 ? posters[index] : posters[anim.target]) : posters[index]
  const rightPoster = anim ? (anim.dir === 1 ? posters[anim.target] : posters[index]) : posters[index]

  // Flipping sheet faces.
  const flip = anim && (anim.dir === 1
    ? { front: <TextFace poster={posters[index]} num={index + 1} total={n} onOpen={guardedOpen} />, back: <PosterFace poster={posters[anim.target]} onOpen={guardedOpen} />, side: 'right' }
    : { front: <PosterFace poster={posters[index]} onOpen={guardedOpen} />, back: <TextFace poster={posters[anim.target]} num={anim.target + 1} total={n} onOpen={guardedOpen} />, side: 'left' })

  const onDown = (e) => { drag.current = { x: e.clientX }; moved.current = false }
  const onMove = (e) => { if (drag.current && Math.abs(e.clientX - drag.current.x) > 6) moved.current = true }
  const onUp = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    drag.current = null
    if (dx < -50) next()
    else if (dx > 50) prev()
  }

  return (
    <div className="select-none">
      <div className="relative mx-auto w-full max-w-4xl">
        {/* stacked page thickness behind the book */}
        <div className="absolute -inset-x-1 -bottom-2 top-2 rounded-[6px] bg-[#e7e0cf] border border-ink/15 translate-x-2 translate-y-2" />
        <div className="absolute -inset-x-0.5 -bottom-1 top-1 rounded-[6px] bg-[#eee7d6] border border-ink/15 translate-x-1 translate-y-1" />

        {/* the open book */}
        <div
          className="relative rounded-[6px] overflow-hidden border border-ink/25 shadow-[0_40px_80px_-30px_rgba(26,23,18,0.6)]"
          style={{ aspectRatio: '3 / 2', perspective: 2600 }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => (drag.current = null)}
        >
          {/* underlying pages */}
          <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"><PosterFace poster={leftPoster} onOpen={guardedOpen} /></div>
          <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"><TextFace poster={rightPoster} num={(anim && anim.dir === 1 ? anim.target : index) + 1} total={n} onOpen={guardedOpen} /></div>

          {/* spine */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 pointer-events-none z-30" style={{ background: 'linear-gradient(to right, rgba(26,23,18,0.22), rgba(26,23,18,0.02) 45%, rgba(26,23,18,0.02) 55%, rgba(26,23,18,0.22))' }} />

          {/* fluttering ghost pages during a turn */}
          {anim && [0, 1].map((k) => (
            <motion.div
              key={k}
              className="absolute inset-y-0 w-1/2 z-20 bg-[#f2ecdd] border-r border-ink/10"
              style={{ left: flip.side === 'right' ? '50%' : 0, transformOrigin: flip.side === 'right' ? 'left center' : 'right center', backfaceVisibility: 'hidden' }}
              initial={{ rotateY: 0, opacity: 0.7 }}
              animate={{ rotateY: anim.dir === 1 ? -180 : 180, opacity: 0 }}
              transition={{ duration: DUR * 0.7, ease: EASE, delay: 0.04 + k * 0.05 }}
            />
          ))}

          {/* the main flipping sheet */}
          {anim && (
            <motion.div
              className="absolute inset-y-0 w-1/2 z-40"
              style={{ left: flip.side === 'right' ? '50%' : 0, transformOrigin: flip.side === 'right' ? 'left center' : 'right center', transformStyle: 'preserve-3d', rotateY: rot }}
            >
              <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>{flip.front}</div>
              <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>{flip.back}</div>
              {/* moving sheen */}
              <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: sheen, background: 'linear-gradient(to right, rgba(26,23,18,0.35), rgba(255,255,255,0.18))' }} />
            </motion.div>
          )}
        </div>
      </div>

      {/* controls */}
      <div className="mt-7 flex items-center justify-center gap-6">
        <button onClick={prev} disabled={index === 0} data-cursor="link" className="w-11 h-11 grid place-items-center rounded-full border-2 border-ink text-ink disabled:opacity-25 disabled:cursor-not-allowed hover:bg-ink hover:text-chalk transition-colors" aria-label="Previous page">‹</button>
        <span className="font-mono text-[10px] uppercase tracking-widest text-stone min-w-[70px] text-center">{index + 1} / {n}</span>
        <button onClick={next} disabled={index === n - 1} data-cursor="link" className="w-11 h-11 grid place-items-center rounded-full border-2 border-ink text-ink disabled:opacity-25 disabled:cursor-not-allowed hover:bg-ink hover:text-chalk transition-colors" aria-label="Next page">›</button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap">
        {posters.map((p, i) => (
          <button key={p.id} onClick={() => go(i)} data-cursor="link" className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-marker' : 'w-1.5 bg-ink/25 hover:bg-ink/50'}`} aria-label={`Go to ${p.title}`} />
        ))}
      </div>
    </div>
  )
}
