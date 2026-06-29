// Slide-over panel: response counts, average score, pass rate, per-response answers.
import { motion } from 'framer-motion'
import { useStore } from '../lib/store.js'

export default function ResponsesPanel({ form, onClose }) {
  const responses = useStore((s) => s.responses[form.id]) || []
  const scored = responses.filter((r) => typeof r.score === 'number')
  const avg = scored.length ? Math.round(scored.reduce((a, r) => a + r.score, 0) / scored.length) : null
  const passRate = scored.length ? Math.round((scored.filter((r) => r.score >= (form.passPct || 70)).length / scored.length) * 100) : null

  const labelFor = (fieldId) => form.fields?.find((f) => f.id === fieldId)?.label || fieldId

  return (
    <motion.div className="fixed inset-0 z-[200] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="relative w-full max-w-md bg-chalk border-l border-ink/20 h-full overflow-y-auto no-scrollbar p-6"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-ink-soft hover:text-marker" data-cursor="link">✕</button>
        <div className="eyebrow">Responses</div>
        <h2 className="font-display italic font-bold text-2xl tracking-tightest">{form.title}</h2>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="paper-card p-3"><div className="font-display italic font-black text-3xl">{responses.length}</div><div className="font-mono text-[9px] uppercase tracking-widest text-stone">responses</div></div>
          <div className="paper-card p-3"><div className="font-display italic font-black text-3xl">{avg ?? '—'}{avg != null ? '%' : ''}</div><div className="font-mono text-[9px] uppercase tracking-widest text-stone">avg score</div></div>
          <div className="paper-card p-3"><div className="font-display italic font-black text-3xl">{passRate ?? '—'}{passRate != null ? '%' : ''}</div><div className="font-mono text-[9px] uppercase tracking-widest text-stone">pass rate</div></div>
        </div>

        <div className="mt-6 space-y-4">
          {responses.length === 0 && <p className="text-ink-soft font-hand text-xl">No responses yet.</p>}
          {responses.map((r) => (
            <div key={r.id} className="paper-card p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-stone">{r.by || 'anonymous'}</span>
                {typeof r.score === 'number' && <span className="tag" style={{ color: r.score >= (form.passPct || 70) ? '#0E8F6E' : '#E0382B' }}>{r.score}%</span>}
              </div>
              <dl className="mt-2 space-y-1.5 text-sm">
                {r.answers && Object.entries(r.answers).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-ink-soft text-xs">{labelFor(k)}</dt>
                    <dd className="text-ink">{Array.isArray(v) ? v.join(', ') : String(v)}</dd>
                  </div>
                ))}
                {r.outcome && <div><dt className="text-ink-soft text-xs">Outcome</dt><dd>{r.outcome}</dd></div>}
              </dl>
            </div>
          ))}
        </div>
      </motion.aside>
    </motion.div>
  )
}
