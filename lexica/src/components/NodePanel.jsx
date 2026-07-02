import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { categoryOf, relStyle, CATEGORIES } from '../config/theme.js'
import { contextPath } from '../lib/loader.js'

// Museum label, not documentation page (doc §12). The graph stays visible.
// Category-specific sections come from configuration, not branching logic.
const CATEGORY_FIELDS = {
  course: [['level', 'Level'], ['source', 'Hosted on']],
  release: [['month', 'Released'], ['product', 'Product']],
  poster: [['campaign', 'Campaign']],
  event: [['date', 'Date'], ['location', 'Location'], ['type', 'Type']],
}

const LINK_LABELS = { link: 'Open resource', download: 'Download', image: 'View artwork' }

export default function NodePanel({ graph, node, pinned, onTogglePin, onSelect, onClose }) {
  const path = useMemo(() => (node ? contextPath(graph, node.id) : []), [graph, node])
  const neighbors = useMemo(() => {
    if (!node) return []
    return (graph.neighbors.get(node.id) || [])
      .map((nb) => ({ ...nb, node: graph.byId.get(nb.id) }))
      .filter((nb) => nb.node)
      .slice(0, 14)
  }, [graph, node])

  const cat = node ? categoryOf(node) : null
  const fields = node ? (CATEGORY_FIELDS[node.category] || []) : []
  const resources = node
    ? Object.entries(node.assets).filter(([k, v]) => v && k !== 'thumbnail' && k !== 'cover' && k !== 'linkTitle')
    : []
  const artwork = node?.assets?.image || node?.assets?.cover || node?.assets?.thumbnail

  return (
    <AnimatePresence>
      {node && (
        <motion.aside
          key={node.id}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 30, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.25, 0.8, 0.35, 1] }}
          className="fixed right-4 top-16 bottom-5 z-30 w-[360px] max-w-[88vw] rounded-2xl border border-line bg-panel/90 backdrop-blur-xl overflow-y-auto lexica-scroll"
          aria-label={`Details for ${node.title}`}
        >
          <div className="p-5">
            {/* context strip — where this lives in the ecosystem */}
            {path.length > 1 && (
              <div className="flex flex-wrap items-center gap-1 mb-4 text-[10px] font-mono text-white/35">
                {path.map((id, i) => {
                  const p = graph.byId.get(id)
                  if (!p) return null
                  return (
                    <span key={id} className="flex items-center gap-1">
                      {i > 0 && <span className="text-white/20">›</span>}
                      <button onClick={() => i < path.length - 1 && onSelect(p)} className={i === path.length - 1 ? 'text-white/60' : 'hover:text-white/60'}>
                        {p.id === 'lexica' ? 'LEXICA' : p.title}
                      </button>
                    </span>
                  )
                })}
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-mono tracking-wider mb-2"
                  style={{ color: cat.color, border: `1px solid ${cat.color}55`, background: `${cat.color}14` }}
                >
                  {cat.label.toUpperCase()}
                </span>
                <h2 className="font-display text-lg text-white/95 leading-snug">{node.title}</h2>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onTogglePin(node.id)}
                  title={pinned.has(node.id) ? 'Unpin' : 'Pin this node'}
                  className={`h-7 w-7 rounded-lg border border-line text-xs transition-colors ${pinned.has(node.id) ? 'text-amber-300 bg-white/10' : 'text-white/40 hover:text-white/80'}`}
                >
                  ⭑
                </button>
                <button onClick={onClose} aria-label="Close panel" className="h-7 w-7 rounded-lg border border-line text-white/40 hover:text-white/80 text-xs transition-colors">
                  ✕
                </button>
              </div>
            </div>

            {artwork && (
              <img src={artwork} alt={node.title} className="mt-4 w-full rounded-xl border border-line" loading="lazy" />
            )}

            <p className="mt-4 text-[13px] leading-relaxed font-body text-white/65">{node.description}</p>

            {fields.length > 0 && (
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                {fields.map(([key, label]) =>
                  node.metadata[key] ? (
                    <div key={key}>
                      <dt className="text-[10px] font-mono text-white/30 uppercase tracking-wider">{label}</dt>
                      <dd className="text-xs font-body text-white/70 mt-0.5">{node.metadata[key]}</dd>
                    </div>
                  ) : null
                )}
              </dl>
            )}

            {resources.length > 0 && (
              <div className="mt-5">
                <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-2">External resources</h3>
                <div className="flex flex-col gap-2">
                  {resources.map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-line bg-white/[0.04] hover:bg-white/[0.09] px-3 py-2.5 text-xs font-body text-white/80 transition-colors flex items-center justify-between"
                    >
                      <span>{key === 'link' && node.assets.linkTitle ? node.assets.linkTitle : (LINK_LABELS[key] || key)}</span>
                      <span className="font-mono text-white/30">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {neighbors.length > 0 && (
              <div className="mt-5">
                <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-2">
                  You may also explore
                </h3>
                <ul className="flex flex-col gap-1">
                  {neighbors.map((nb) => {
                    const ncat = categoryOf(nb.node)
                    return (
                      <li key={nb.id}>
                        <button
                          onClick={() => onSelect(nb.node)}
                          className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-white/[0.05] transition-colors"
                        >
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: ncat.color }} />
                          <span className="flex-1 min-w-0 text-xs font-body text-white/70 truncate">{nb.node.title}</span>
                          <span className="text-[9px] font-mono text-white/25 shrink-0">{relStyle(nb.type).label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-line grid grid-cols-2 gap-2 text-[10px] font-mono text-white/25">
              <span>id {node.id}</span>
              <span className="text-right">{(graph.neighbors.get(node.id) || []).length} connections</span>
              <span>importance {node.importance.toFixed(2)}</span>
              {node.tags.length > 0 && <span className="text-right truncate">{node.tags.join(' · ')}</span>}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
