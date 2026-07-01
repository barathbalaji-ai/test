// An editorial "thick book" of posters bound in the Support Codex. It opens with
// a hardcover swing, then each poster is a spread: left page is the full poster
// (never cropped), right page is its name + description. Turning a page runs a
// quick weighted 3D flip with several pages fluttering, then settles.
// Drag / arrows / dots / click navigate.
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { PosterMotif } from './PosterCard.jsx'

const EASE = [0.76, 0, 0.24, 1]
const DUR = 0.58        // page-turn duration (faster)
const GHOSTS = 5        // fluttering pages per turn

// ── the Support Codex hardcover ───────────────────────────────────────────────
function BrainMark({ className }) {
  return (
    <svg viewBox="0 0 64 56" className={className} fill="none" stroke="#c7a34e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M26 8c-6-3-14 0-15 7-5 1-8 6-6 11-3 3-3 9 2 11 1 6 8 9 14 6" />
      <path d="M38 8c6-3 14 0 15 7 5 1 8 6 6 11 3 3 3 9-2 11-1 6-8 9-14 6" />
      <path d="M32 6v44M22 18c4 2 6 6 4 10M42 18c-4 2-6 6-4 10M24 34c4 0 7 2 8 6M40 34c-4 0-7 2-8 6" />
    </svg>
  )
}

function Cover({ onOpen, coverRot }) {
  return (
    <motion.div
      className="absolute inset-0 z-50 origin-left"
      style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d', rotateY: coverRot }}
    >
      <button onClick={onOpen} data-cursor="link" className="absolute inset-0 block text-left" style={{ backfaceVisibility: 'hidden' }} aria-label="Open the Support Codex">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(130% 110% at 28% 18%, #3c2b20, #1b130e 72%)' }} />
        <div className="absolute inset-0 paper-grain opacity-[0.18]" />
        {/* foil frames */}
        <div className="absolute inset-4 border-2" style={{ borderColor: '#b9922e' }} />
        <div className="absolute inset-5 border" style={{ borderColor: 'rgba(185,146,46,0.45)' }} />
        {/* corners */}
        {[['top-3 left-3', ''], ['top-3 right-3', 'scale-x-[-1]'], ['bottom-3 left-3', 'scale-y-[-1]'], ['bottom-3 right-3', 'scale-x-[-1] scale-y-[-1]']].map(([pos, flip], i) => (
          <svg key={i} className={`absolute ${pos} ${flip} w-8 h-8`} viewBox="0 0 32 32" fill="none" stroke="#b9922e" strokeWidth="1.2"><path d="M2 2h12M2 2v12M2 2l10 10" /></svg>
        ))}
        <div className="absolute top-9 inset-x-0 text-center font-mono text-[9px] tracking-[0.4em]" style={{ color: '#c7a34e' }}>CEREBRAL&nbsp;STUDIES&nbsp;·&nbsp;NO.&nbsp;01</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
          <BrainMark className="w-16 h-14" />
          <div className="text-center leading-[0.95]" style={{ color: '#f0e6cf', textShadow: '0 1px 0 rgba(0,0,0,0.55)' }}>
            <div className="font-display italic font-black text-4xl sm:text-5xl tracking-tightest">Support</div>
            <div className="font-display italic font-black text-5xl sm:text-6xl tracking-tightest" style={{ color: '#c7a34e' }}>Codex</div>
          </div>
          <div className="w-16 h-px" style={{ background: '#b9922e' }} />
        </div>
        <div className="absolute bottom-9 inset-x-0 text-center font-mono text-[9px] tracking-[0.35em]" style={{ color: '#a98a3f' }}>OPEN&nbsp;THE&nbsp;CODEX&nbsp;→</div>
        {/* spine + edge lighting */}
        <div className="absolute inset-y-0 left-0 w-8" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.55), transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-10" style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.35), transparent)' }} />
      </button>
      {/* dark inside face when it swings past vertical */}
      <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg,#241a13,#15100b)' }} />
    </motion.div>
  )
}

// ── page faces ────────────────────────────────────────────────────────────────
function PosterFace({ poster, onOpen }) {
  const [ok, setOk] = useState(true)
  return (
    <div className="absolute inset-0 bg-[#F3EEE1] flex items-center justify-center p-5 sm:p-7">
      <div className="absolute inset-y-0 right-0 w-14 pointer-events-none" style={{ background: 'linear-gradient(to right, transparent, rgba(26,23,18,0.16))' }} />
      <button onClick={() => onOpen?.(poster)} data-cursor="link" className="relative block h-full w-full" aria-label={`Open ${poster.title}`}>
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
  const [phase, setPhase] = useState('closed') // closed | opening | open
  const [index, setIndex] = useState(0)
  const [anim, setAnim] = useState(null) // { dir, target }
  const rot = useMotionValue(0)
  const coverRot = useMotionValue(0)
  const drag = useRef(null)
  const moved = useRef(false)
  const reduced = useRef(false)

  const guardedOpen = (p) => { if (moved.current) { moved.current = false; return } onOpen?.(p) }

  useEffect(() => {
    reduced.current = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }, [])
  useEffect(() => { setIndex(0); setAnim(null); setPhase('closed'); coverRot.set(0) // reset on filter change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  const sheen = useTransform(rot, (v) => { const a = Math.abs(v); return (a < 90 ? a / 90 : (180 - a) / 90) * 0.5 })

  const openCover = () => {
    if (phase !== 'closed') return
    if (reduced.current) { setPhase('open'); return }
    setPhase('opening')
    const c = animate(coverRot, -168, { duration: 0.95, ease: EASE })
    c.then(() => setPhase('open'))
  }

  const go = (target) => {
    if (phase !== 'open' || anim || target === index || target < 0 || target >= n) return
    if (reduced.current) { setIndex(target); return }
    setAnim({ dir: target > index ? 1 : -1, target })
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
    const onKey = (e) => {
      if (phase !== 'open') { if (e.key === 'Enter' || e.key === ' ') openCover(); return }
      if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, anim, n, phase])

  if (!n) return <p className="text-center font-hand text-2xl text-ink-soft py-16">No posters here yet.</p>

  const leftPoster = anim ? (anim.dir === 1 ? posters[index] : posters[anim.target]) : posters[index]
  const rightPoster = anim ? (anim.dir === 1 ? posters[anim.target] : posters[index]) : posters[index]
  const rightNum = (anim && anim.dir === 1 ? anim.target : index) + 1

  const flip = anim && (anim.dir === 1
    ? { front: <TextFace poster={posters[index]} num={index + 1} total={n} onOpen={guardedOpen} />, back: <PosterFace poster={posters[anim.target]} onOpen={guardedOpen} />, side: 'right' }
    : { front: <PosterFace poster={posters[index]} onOpen={guardedOpen} />, back: <TextFace poster={posters[anim.target]} num={anim.target + 1} total={n} onOpen={guardedOpen} />, side: 'left' })

  const onDown = (e) => { if (phase !== 'open') return; drag.current = { x: e.clientX }; moved.current = false }
  const onMove = (e) => { if (drag.current && Math.abs(e.clientX - drag.current.x) > 6) moved.current = true }
  const onUp = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    drag.current = null
    if (dx < -50) next(); else if (dx > 50) prev()
  }

  return (
    <div className="select-none">
      <div className="relative mx-auto w-full max-w-4xl">
        {/* stacked page thickness behind the book */}
        <div className="absolute -inset-x-1 -bottom-2 top-2 rounded-[6px] bg-[#e7e0cf] border border-ink/15 translate-x-2 translate-y-2" />
        <div className="absolute -inset-x-0.5 -bottom-1 top-1 rounded-[6px] bg-[#eee7d6] border border-ink/15 translate-x-1 translate-y-1" />

        <div
          className="relative rounded-[6px] overflow-hidden border border-ink/25 shadow-[0_40px_80px_-30px_rgba(26,23,18,0.6)]"
          style={{ aspectRatio: '3 / 2', perspective: 2600 }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => (drag.current = null)}
        >
          {/* underlying spread */}
          <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"><PosterFace poster={leftPoster} onOpen={guardedOpen} /></div>
          <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"><TextFace poster={rightPoster} num={rightNum} total={n} onOpen={guardedOpen} /></div>

          {/* spine */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 pointer-events-none z-30" style={{ background: 'linear-gradient(to right, rgba(26,23,18,0.22), rgba(26,23,18,0.02) 45%, rgba(26,23,18,0.02) 55%, rgba(26,23,18,0.22))' }} />

          {/* fluttering ghost pages */}
          {anim && Array.from({ length: GHOSTS }).map((_, k) => (
            <motion.div
              key={k}
              className="absolute inset-y-0 w-1/2 z-20 bg-[#f2ecdd] border-r border-ink/10"
              style={{ left: flip.side === 'right' ? '50%' : 0, transformOrigin: flip.side === 'right' ? 'left center' : 'right center', backfaceVisibility: 'hidden' }}
              initial={{ rotateY: 0, opacity: 0.75 }}
              animate={{ rotateY: anim.dir === 1 ? -180 : 180, opacity: 0 }}
              transition={{ duration: DUR * 0.85, ease: EASE, delay: 0.03 + k * 0.055 }}
            />
          ))}

          {/* main flipping sheet */}
          {anim && (
            <motion.div className="absolute inset-y-0 w-1/2 z-40" style={{ left: flip.side === 'right' ? '50%' : 0, transformOrigin: flip.side === 'right' ? 'left center' : 'right center', transformStyle: 'preserve-3d', rotateY: rot }}>
              <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>{flip.front}</div>
              <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>{flip.back}</div>
              <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: sheen, background: 'linear-gradient(to right, rgba(26,23,18,0.35), rgba(255,255,255,0.18))' }} />
            </motion.div>
          )}

          {/* hardcover */}
          {phase !== 'open' && <Cover onOpen={openCover} coverRot={coverRot} />}
        </div>
      </div>

      {/* controls */}
      {phase === 'open' ? (
        <>
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
        </>
      ) : (
        <div className="mt-7 text-center">
          <button onClick={openCover} data-cursor="link" className="btn-ink">Open the Codex →</button>
        </div>
      )}
    </div>
  )
}
