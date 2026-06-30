// A clean, minimal timeline range-scroller for the Articles archive.
// A horizontal film-strip rail with one tick per month; two draggable handles
// select the visible [from, to] range. Dragging (or clicking a sprocket) winds
// the reel — `onWind(intensity)` fires with the scrub speed so the page can play
// the winding ambience, and `onWindStop()` fires when the gesture ends.
import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function short(key) {
  const [y, m] = key.split('-')
  return { m: MON[parseInt(m, 10) - 1], y: `'${y.slice(2)}` }
}

export default function Timeline({ months, from, to, onChange, onWind, onWindStop }) {
  const railRef = useRef(null)
  const drag = useRef(null) // 'from' | 'to' | null
  const last = useRef(null)
  const n = months.length
  const pct = (i) => (n <= 1 ? 0 : (i / (n - 1)) * 100)

  const idxAt = useCallback((clientX) => {
    const rail = railRef.current
    if (!rail) return 0
    const r = rail.getBoundingClientRect()
    const x = (clientX - r.left) / r.width
    return Math.round(Math.max(0, Math.min(1, x)) * (n - 1))
  }, [n])

  const begin = (handle) => (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = handle
    last.current = handle === 'from' ? from : to
  }

  const move = (e) => {
    if (!drag.current) return
    const idx = idxAt(e.clientX)
    let nf = from
    let nt = to
    if (drag.current === 'from') nf = Math.min(idx, to)
    else nt = Math.max(idx, from)
    const moved = Math.abs(idx - (last.current ?? idx))
    if (nf !== from || nt !== to) {
      last.current = idx
      onWind?.(Math.min(1, 0.45 + moved * 0.3))
      onChange({ from: nf, to: nt })
    } else {
      onWind?.(0.22) // friction whirr while holding at an end-stop
    }
  }

  const end = (e) => {
    if (!drag.current) return
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    drag.current = null
    onWindStop?.()
  }

  // Clicking a sprocket moves the nearer handle to it.
  const tap = (i) => {
    const dFrom = Math.abs(i - from)
    const dTo = Math.abs(i - to)
    onWind?.(0.6)
    if (dFrom <= dTo) onChange({ from: Math.min(i, to), to })
    else onChange({ from, to: Math.max(i, from) })
    onWindStop?.()
  }

  return (
    <div className="select-none">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-stone mb-3">
        <span>Wind the reel — drag the handles to pick a range</span>
        <span className="text-ink-soft">
          {short(months[from].key).m} {short(months[from].key).y}
          {from !== to && <> → {short(months[to].key).m} {short(months[to].key).y}</>}
        </span>
      </div>

      <div
        className="relative h-20 px-3 touch-none"
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={end}
      >
        {/* film-strip rail */}
        <div ref={railRef} className="absolute left-3 right-3 top-7">
          <div className="relative h-[10px] rounded-[2px] bg-paper-deep border border-ink/15">
            {/* sprocket holes */}
            <div className="absolute inset-0 flex items-center justify-between px-[6px]">
              {Array.from({ length: Math.max(n * 2, 12) }).map((_, i) => (
                <span key={i} className="block w-[3px] h-[3px] rounded-[1px] bg-ink/20" />
              ))}
            </div>
            {/* selected band */}
            <div
              className="absolute top-0 bottom-0 bg-marker/25 border-x-2 border-marker"
              style={{ left: `${pct(from)}%`, right: `${100 - pct(to)}%` }}
            />
          </div>

          {/* ticks + labels */}
          {months.map((mo, i) => {
            const s = short(mo.key)
            const inRange = i >= from && i <= to
            return (
              <button
                key={mo.key}
                onClick={() => tap(i)}
                data-cursor="link"
                className="absolute -translate-x-1/2 flex flex-col items-center group"
                style={{ left: `${pct(i)}%`, top: 14 }}
                aria-label={`${mo.label}`}
              >
                <span className={`h-3 w-px ${inRange ? 'bg-marker' : 'bg-ink/25'} group-hover:bg-ink`} />
                <span className={`mt-1 font-mono text-[9px] leading-none uppercase tracking-wider ${inRange ? 'text-ink' : 'text-stone'}`}>{s.m}</span>
                <span className="font-mono text-[8px] leading-tight text-stone">{s.y}</span>
              </button>
            )
          })}

          {/* handles */}
          {['from', 'to'].map((h) => {
            const i = h === 'from' ? from : to
            return (
              <motion.button
                key={h}
                onPointerDown={begin(h)}
                data-cursor="link"
                whileTap={{ scale: 1.15 }}
                className="absolute -translate-x-1/2 -top-[7px] z-10 grid place-items-center w-6 h-6 rounded-full bg-ink border-2 border-chalk shadow-hard-sm cursor-grab active:cursor-grabbing touch-none"
                style={{ left: `${pct(i)}%` }}
                aria-label={`${h === 'from' ? 'Start' : 'End'} of range`}
              >
                <span className="w-[2px] h-2 bg-chalk/80" />
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
