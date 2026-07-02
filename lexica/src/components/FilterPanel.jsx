import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORIES } from '../config/theme.js'

// Filters reshape visibility, never data. Collapsed by default (doc §11/§13).
// Also doubles as the colour legend.
export default function FilterPanel({ hiddenCats, setHiddenCats }) {
  const [open, setOpen] = useState(false)

  const toggle = (cat) => {
    setHiddenCats((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  return (
    <div className="fixed left-5 top-16 z-30">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-line bg-panel/80 backdrop-blur px-3 py-1.5 text-xs font-body text-faint hover:text-white/80 transition-colors"
        aria-expanded={open}
      >
        Layers {hiddenCats.size > 0 && <span className="font-mono text-[10px]">({hiddenCats.size} off)</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-2 w-48 rounded-xl border border-line bg-panel/90 backdrop-blur-xl p-2 space-y-0.5"
          >
            {Object.entries(CATEGORIES).filter(([k]) => k !== 'ai').map(([key, cat]) => {
              const off = hiddenCats.has(key)
              return (
                <li key={key}>
                  <button
                    onClick={() => toggle(key)}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-body transition-colors ${off ? 'text-white/25' : 'text-white/75 hover:bg-white/[0.05]'}`}
                    aria-pressed={!off}
                  >
                    <span
                      className="h-2 w-2 rounded-full transition-opacity"
                      style={{ background: cat.color, opacity: off ? 0.25 : 1, boxShadow: off ? 'none' : `0 0 6px ${cat.color}66` }}
                    />
                    <span className="flex-1 text-left">{cat.label}</span>
                    <span className="font-mono text-[10px] opacity-50">{off ? '✕' : '✓'}</span>
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
