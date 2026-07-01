// A page-turning book reader shared by every book on the Posters shelf.
// A hardcover swings open, then you turn spreads with a quick weighted 3D flip
// (several pages flutter). Two kinds of spread:
//   poster → left page is the poster image, right page is its name/description
//   doc    → two consecutive document pages, like a real book
// Only the current/target spreads mount, so document pages load lazily.
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { docPage } from '../data/books.js'
import { PosterMotif } from './PosterCard.jsx'

const EASE = [0.76, 0, 0.24, 1]
const DUR = 0.58
const GHOSTS = 5

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
        <button onClick={() => onOpen?.(poster)} data-cursor="link" className="mt-7 btn-ink text-[10px]">Open poster →</button>
      </div>
      <div className="absolute bottom-6 right-8 sm:right-12 font-mono text-[10px] uppercase tracking-widest text-stone">{String(num).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>
    </div>
  )
}

function ImgFace({ src, side }) {
  if (!src) return <div className="absolute inset-0 bg-[#F5F1E7]" />
  return (
    <div className="absolute inset-0 bg-[#F5F1E7] flex items-center justify-center">
      <div className={`absolute inset-y-0 ${side === 'left' ? 'right-0' : 'left-0'} w-12 pointer-events-none`} style={{ background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, transparent, rgba(26,23,18,0.14))` }} />
      <img src={src} alt="" draggable={false} loading="lazy" className="absolute inset-0 w-full h-full object-contain" />
    </div>
  )
}

export default function Book({ book, onOpen, onClose }) {
  const isDoc = book.type === 'doc'
  const N = isDoc ? Math.ceil(book.pages / 2) : book.posters.length

  const leftNode = (i) => isDoc
    ? <ImgFace src={docPage(book, i * 2 + 1)} side="left" />
    : <PosterFace poster={book.posters[i]} onOpen={onOpen} />
  const rightNode = (i) => isDoc
    ? <ImgFace src={i * 2 + 2 <= book.pages ? docPage(book, i * 2 + 2) : null} side="right" />
    : <TextFace poster={book.posters[i]} num={i + 1} total={N} onOpen={onOpen} />

  const [phase, setPhase] = useState('closed')
  const [index, setIndex] = useState(0)
  const [anim, setAnim] = useState(null)
  const rot = useMotionValue(0)
  const coverRot = useMotionValue(0)
  const drag = useRef(null)
  const reduced = useRef(false)

  const sheen = useTransform(rot, (v) => { const a = Math.abs(v); return (a < 90 ? a / 90 : (180 - a) / 90) * 0.5 })

  useEffect(() => {
    reduced.current = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    // auto-open shortly after the book is picked from the shelf
    if (reduced.current) { setPhase('open'); return }
    const t = setTimeout(() => {
      setPhase('opening')
      animate(coverRot, -168, { duration: 0.95, ease: EASE }).then(() => setPhase('open'))
    }, 420)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openNow = () => {
    if (phase !== 'closed') return
    if (reduced.current) { setPhase('open'); return }
    setPhase('opening')
    animate(coverRot, -168, { duration: 0.9, ease: EASE }).then(() => setPhase('open'))
  }

  const go = (target) => {
    if (phase !== 'open' || anim || target === index || target < 0 || target >= N) return
    if (reduced.current) { setIndex(target); return }
    setAnim({ dir: target > index ? 1 : -1, target })
  }
  const next = () => go(index + 1)
  const prev = () => go(index - 1)

  useEffect(() => {
    if (!anim) return
    rot.set(0)
    const c = animate(rot, anim.dir === 1 ? -180 : 180, { duration: DUR, ease: EASE })
    c.then(() => { setIndex(anim.target); setAnim(null); rot.set(0) })
    return () => c.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose?.()
      if (phase !== 'open') return
      if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, anim, phase])

  const leftUnder = anim ? (anim.dir === 1 ? leftNode(index) : leftNode(anim.target)) : leftNode(index)
  const rightUnder = anim ? (anim.dir === 1 ? rightNode(anim.target) : rightNode(index)) : rightNode(index)
  const flip = anim && (anim.dir === 1
    ? { front: rightNode(index), back: leftNode(anim.target), side: 'right' }
    : { front: leftNode(index), back: rightNode(anim.target), side: 'left' })

  const onDown = (e) => { if (phase !== 'open') return; drag.current = { x: e.clientX } }
  const onUp = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    drag.current = null
    if (dx < -50) next(); else if (dx > 50) prev()
  }

  const counter = isDoc
    ? `pp. ${index * 2 + 1}–${Math.min(book.pages, index * 2 + 2)} / ${book.pages}`
    : `${index + 1} / ${N}`

  return (
    <div className="select-none">
      {/* toolbar */}
      <div className="mx-auto max-w-4xl flex items-center justify-between gap-4 mb-5">
        <button onClick={onClose} data-cursor="link" className="font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-marker flex items-center gap-2">‹ Shelf</button>
        <div className="text-center">
          <div className="font-display italic font-bold text-xl tracking-tightest leading-none">{book.title}</div>
          {book.subtitle && <div className="font-mono text-[9px] uppercase tracking-widest text-stone mt-1">{book.subtitle}</div>}
        </div>
        {book.download
          ? <a href={book.download} target="_blank" rel="noopener noreferrer" data-cursor="link" className="font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-marker">PDF ↗</a>
          : <span className="w-10" />}
      </div>

      <div className="relative mx-auto w-full max-w-4xl">
        <div className="absolute -inset-x-1 -bottom-2 top-2 rounded-[6px] bg-[#e7e0cf] border border-ink/15 translate-x-2 translate-y-2" />
        <div className="absolute -inset-x-0.5 -bottom-1 top-1 rounded-[6px] bg-[#eee7d6] border border-ink/15 translate-x-1 translate-y-1" />

        <div
          className="relative rounded-[6px] overflow-hidden border border-ink/25 shadow-[0_40px_80px_-30px_rgba(26,23,18,0.6)]"
          style={{ aspectRatio: '3 / 2', perspective: 2600 }}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={() => (drag.current = null)}
        >
          <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">{leftUnder}</div>
          <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">{rightUnder}</div>

          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 pointer-events-none z-30" style={{ background: 'linear-gradient(to right, rgba(26,23,18,0.22), rgba(26,23,18,0.02) 45%, rgba(26,23,18,0.02) 55%, rgba(26,23,18,0.22))' }} />

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

          {anim && (
            <motion.div className="absolute inset-y-0 w-1/2 z-40" style={{ left: flip.side === 'right' ? '50%' : 0, transformOrigin: flip.side === 'right' ? 'left center' : 'right center', transformStyle: 'preserve-3d', rotateY: rot }}>
              <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>{flip.front}</div>
              <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>{flip.back}</div>
              <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: sheen, background: 'linear-gradient(to right, rgba(26,23,18,0.35), rgba(255,255,255,0.18))' }} />
            </motion.div>
          )}

          {/* hardcover */}
          {phase !== 'open' && (
            <motion.div className="absolute inset-0 z-50 origin-left" style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d', rotateY: coverRot }}>
              <button onClick={openNow} data-cursor="link" className="absolute inset-0 block" style={{ backfaceVisibility: 'hidden', background: book.spine || '#15100b' }} aria-label={`Open ${book.title}`}>
                <img src={book.cover} alt={book.title} className="absolute inset-0 w-full h-full object-contain" draggable={false} />
                <div className="absolute inset-y-0 left-0 w-8" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.55), transparent)' }} />
              </button>
              <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg,#241a13,#15100b)' }} />
            </motion.div>
          )}
        </div>
      </div>

      {/* controls */}
      {phase === 'open' && (
        <>
          <div className="mt-7 flex items-center justify-center gap-6">
            <button onClick={prev} disabled={index === 0} data-cursor="link" className="w-11 h-11 grid place-items-center rounded-full border-2 border-ink text-ink disabled:opacity-25 disabled:cursor-not-allowed hover:bg-ink hover:text-chalk transition-colors" aria-label="Previous">‹</button>
            <span className="font-mono text-[10px] uppercase tracking-widest text-stone min-w-[120px] text-center">{counter}</span>
            <button onClick={next} disabled={index === N - 1} data-cursor="link" className="w-11 h-11 grid place-items-center rounded-full border-2 border-ink text-ink disabled:opacity-25 disabled:cursor-not-allowed hover:bg-ink hover:text-chalk transition-colors" aria-label="Next">›</button>
          </div>
          {N <= 12 && (
            <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap">
              {Array.from({ length: N }).map((_, i) => (
                <button key={i} onClick={() => go(i)} data-cursor="link" className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-marker' : 'w-1.5 bg-ink/25 hover:bg-ink/50'}`} aria-label={`Go to ${i + 1}`} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
