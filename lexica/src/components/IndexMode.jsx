import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORIES, categoryOf } from '../config/theme.js'

// Accessible fallback: the whole universe as a plain, screen-reader-friendly
// list (doc §17). Canvas graphs alone can't serve assistive tech.
export default function IndexMode({ open, onClose, graph, onPick }) {
  const groups = useMemo(() => {
    const by = {}
    for (const n of graph.nodes) {
      if (n.category === 'core') continue
      ;(by[n.category] ||= []).push(n)
    }
    for (const list of Object.values(by)) list.sort((a, b) => b.importance - a.importance || a.title.localeCompare(b.title))
    return by
  }, [graph])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex justify-center overflow-hidden"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            role="dialog" aria-label="Knowledge index"
            className="relative mt-[8vh] mb-[6vh] w-full max-w-2xl rounded-2xl border border-line bg-panel/95 backdrop-blur-xl overflow-y-auto lexica-scroll p-6"
            initial={{ y: 16 }} animate={{ y: 0 }} exit={{ y: 10 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-sm tracking-[0.3em] text-white/80">INDEX</h2>
              <button onClick={onClose} aria-label="Close index" className="h-7 w-7 rounded-lg border border-line text-white/40 hover:text-white/80 text-xs">✕</button>
            </div>
            {Object.entries(groups).map(([cat, nodes]) => (
              <section key={cat} className="mb-5">
                <h3 className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: (CATEGORIES[cat] || {}).color }}>
                  {(CATEGORIES[cat] || { label: cat }).label} <span className="text-white/25">({nodes.length})</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  {nodes.map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => onPick(n)}
                        className="w-full text-left rounded px-2 py-1 text-xs font-body text-white/60 hover:text-white/90 hover:bg-white/[0.05] transition-colors truncate"
                        title={n.description}
                      >
                        <span className="inline-block h-1.5 w-1.5 rounded-full mr-2 align-middle" style={{ background: categoryOf(n).color }} />
                        {n.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
