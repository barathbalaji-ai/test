// A clean, minimal single-month timeline scroller for the Articles archive.
// A film-strip rail with one sprocket per month and a single draggable handle
// that snaps to one month at a time; ‹ › steppers nudge month-by-month. Every
// month change calls `onStep()` so the page can play the focus-hunt blip.
import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function short(key) {
  const [y, m] = key.split('-')
  return { m: MON[parseInt(m, 10) - 1], y: `'${y.slice(2)}` }
}

export default function Timeline({ months, index, onChange, onStep }) {
  const railRef = useRef(null)
  const dragging = useRef(false)
  const n = months.length
  const pct = (i) => (n <= 1 ? 0 : (i / (n - 1)) * 100)

  const select = useCallback((i) => {
    const clamped = Math.max(0, Math.min(n - 1, i))
    if (clamped !== index) {
      onStep?.()
      onChange(clamped)
    }
  }, [index, n, onChange, onStep])

  const idxAt = useCallback((clientX) => {
    const rail = railRef.current
    if (!rail) return index
    const r = rail.getBoundingClientRect()
    const x = (clientX - r.left) / r.width
    return Math.round(Math.max(0, Math.min(1, x)) * (n - 1))
  }, [index, n])

  const begin = (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    dragging.current = true
    select(idxAt(e.clientX))
  }
  const move = (e) => {
    if (!dragging.current) return
    select(idxAt(e.clientX))
  }
  const end = (e) => {
    if (!dragging.current) return
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    dragging.current = false
  }

  const cur = short(months[index].key)

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-stone">Drag, click a month, or use ‹ ›</span>
        <span className="font-display italic font-bold text-lg text-ink">{months[index].label}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => select(index - 1)}
          disabled={index === 0}
          data-cursor="link"
          className="shrink-0 w-9 h-9 grid place-items-center rounded-full border-2 border-ink text-ink disabled:opacity-25 disabled:cursor-not-allowed hover:bg-ink hover:text-chalk transition-colors"
          aria-label="Previous month"
        >‹</button>

        <div
          className="relative flex-1 h-16 touch-none"
          onPointerDown={begin}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
        >
          <div ref={railRef} className="absolute inset-x-1 top-5">
            {/* film-strip rail */}
            <div className="relative h-[10px] rounded-[2px] bg-paper-deep border border-ink/15">
              <div className="absolute inset-0 flex items-center justify-between px-[6px]">
                {Array.from({ length: Math.max(n * 2, 12) }).map((_, i) => (
                  <span key={i} className="block w-[3px] h-[3px] rounded-[1px] bg-ink/20" />
                ))}
              </div>
              {/* progress fill up to the selected month */}
              <div className="absolute top-0 bottom-0 left-0 bg-marker/25 border-r-2 border-marker" style={{ width: `${pct(index)}%` }} />
            </div>

            {/* month ticks + labels */}
            {months.map((mo, i) => {
              const s = short(mo.key)
              const on = i === index
              return (
                <button
                  key={mo.key}
                  onClick={() => select(i)}
                  data-cursor="link"
                  className="absolute -translate-x-1/2 flex flex-col items-center group"
                  style={{ left: `${pct(i)}%`, top: 14 }}
                  aria-label={mo.label}
                >
                  <span className={`h-3 w-px ${on ? 'bg-marker' : 'bg-ink/25'} group-hover:bg-ink`} />
                  <span className={`mt-1 font-mono text-[9px] leading-none uppercase tracking-wider ${on ? 'text-ink font-bold' : 'text-stone'}`}>{s.m}</span>
                  <span className="font-mono text-[8px] leading-tight text-stone">{s.y}</span>
                </button>
              )
            })}

            {/* single handle */}
            <motion.div
              className="absolute -translate-x-1/2 -top-[8px] z-10 grid place-items-center w-7 h-7 rounded-full bg-ink border-2 border-chalk shadow-hard-sm pointer-events-none"
              animate={{ left: `${pct(index)}%` }}
              transition={{ type: 'spring', stiffness: 500, damping: 34 }}
              style={{ left: `${pct(index)}%` }}
            >
              <span className="font-mono text-[8px] leading-none text-chalk">{cur.m}</span>
            </motion.div>
          </div>
        </div>

        <button
          onClick={() => select(index + 1)}
          disabled={index === n - 1}
          data-cursor="link"
          className="shrink-0 w-9 h-9 grid place-items-center rounded-full border-2 border-ink text-ink disabled:opacity-25 disabled:cursor-not-allowed hover:bg-ink hover:text-chalk transition-colors"
          aria-label="Next month"
        >›</button>
      </div>
    </div>
  )
}
