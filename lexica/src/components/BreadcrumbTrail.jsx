import { categoryOf } from '../config/theme.js'

// Journey history, not hierarchy (doc §13). The last few stops, clickable.
export default function BreadcrumbTrail({ trail, graph, onJump }) {
  if (trail.length < 2) return null
  const nodes = trail.map((id) => graph.byId.get(id)).filter(Boolean).slice(-5)
  return (
    <nav
      className="fixed bottom-5 left-5 z-30 flex items-center gap-1.5 max-w-[60vw] overflow-hidden"
      aria-label="Journey history"
    >
      {nodes.map((n, i) => (
        <span key={`${n.id}-${i}`} className="flex items-center gap-1.5 min-w-0">
          {i > 0 && <span className="text-white/20 text-[10px]">→</span>}
          <button
            onClick={() => onJump(n)}
            className={`truncate rounded-full border border-line bg-panel/70 backdrop-blur px-2.5 py-1 text-[11px] font-body transition-colors ${i === nodes.length - 1 ? 'text-white/85' : 'text-white/40 hover:text-white/70'}`}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full mr-1.5 align-middle" style={{ background: categoryOf(n).color }} />
            {n.title}
          </button>
        </span>
      ))}
    </nav>
  )
}
