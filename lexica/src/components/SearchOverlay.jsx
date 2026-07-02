import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { searchNodes, connectionSummary } from '../graph/search.js'
import { categoryOf, CATEGORIES } from '../config/theme.js'

// Command-palette search. A result is a destination, not a page (doc §10).
export default function SearchOverlay({ open, onClose, graph, query, setQuery, onPick }) {
  const inputRef = useRef()
  const [cursor, setCursor] = useState(0)
  const results = useMemo(() => searchNodes(graph, query), [graph, query])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    setCursor(0)
  }, [open, query])

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
    if (e.key === 'Enter' && results[cursor]) onPick(results[cursor])
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-start justify-center pt-[16vh] px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-lg rounded-xl border border-line bg-panel/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            initial={{ y: -12, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKey}
              placeholder="Search the universe…  (FD, Gen AI, etiquette…)"
              aria-label="Search all knowledge"
              className="w-full bg-transparent px-5 py-4 text-sm font-body text-white/90 outline-none placeholder:text-white/25 border-b border-line"
            />
            <ul className="max-h-[46vh] overflow-y-auto py-1" role="listbox">
              {results.map((n, i) => {
                const cat = categoryOf(n)
                const counts = connectionSummary(graph, n.id)
                const summary = Object.entries(counts)
                  .sort((a, b) => b[1] - a[1]).slice(0, 3)
                  .map(([c, k]) => `${k} ${(CATEGORIES[c]?.label || c).toLowerCase()}`)
                  .join(' · ')
                return (
                  <li key={n.id} role="option" aria-selected={i === cursor}>
                    <button
                      onClick={() => onPick(n)}
                      onMouseEnter={() => setCursor(i)}
                      className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors ${i === cursor ? 'bg-white/[0.06]' : ''}`}
                    >
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: cat.color, boxShadow: `0 0 8px ${cat.color}88` }} />
                      <span className="min-w-0">
                        <span className="block text-sm font-body text-white/85 truncate">{n.title}</span>
                        <span className="block text-[11px] font-mono text-white/35 truncate">
                          {cat.label}{summary ? ` — ${summary}` : ''}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
              {query.trim() && !results.length && (
                <li className="px-5 py-6 text-center text-xs font-body text-white/30">
                  Nothing in this universe matches yet.
                </li>
              )}
              {!query.trim() && (
                <li className="px-5 py-5 text-xs font-body text-white/30">
                  Type to brighten matching stars. Enter flies you there.
                </li>
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
