// Builder for Forms, graded Quizzes, and branching Decision Trees.
// Calls onSave(form) with the assembled object (shape consumed by FormRunner
// and the store).
import { useState } from 'react'

const FIELD_TYPES = [
  { id: 'short', label: 'Short answer' },
  { id: 'paragraph', label: 'Paragraph' },
  { id: 'multiple-choice', label: 'Multiple choice' },
  { id: 'checkboxes', label: 'Checkboxes' },
  { id: 'rating', label: 'Rating' },
]
const ACCENTS = ['#E0382B', '#8E2A20', '#1F6FEB', '#0E8F6E', '#7A3FF2']

let seq = 0
const nid = (p) => `${p}-${Date.now().toString(36)}-${seq++}`
const hasOptions = (t) => t === 'multiple-choice' || t === 'checkboxes'

function blankForm(type) {
  if (type === 'tree') {
    const startId = nid('node')
    return {
      type: 'tree',
      title: '',
      description: '',
      accent: ACCENTS[0],
      startNode: startId,
      nodes: [
        { id: startId, kind: 'question', text: '', options: [{ id: nid('b'), text: '', to: '' }] },
      ],
    }
  }
  return { type, title: '', description: '', accent: ACCENTS[0], passPct: 70, fields: [] }
}

// ---- Field editor (form/quiz) ---------------------------------------------
function FieldEditor({ field, isQuiz, onChange, onRemove, onMove }) {
  const set = (patch) => onChange({ ...field, ...patch })
  const setOpt = (id, patch) => set({ options: field.options.map((o) => (o.id === id ? { ...o, ...patch } : o)) })
  return (
    <div className="paper-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <select value={field.type} onChange={(e) => set({ type: e.target.value, options: hasOptions(e.target.value) ? field.options || [{ id: nid('o'), text: '', correct: false }] : undefined })} className="field max-w-[160px] py-1.5">
          {FIELD_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => onMove(-1)} className="tag" data-cursor="link">↑</button>
          <button onClick={() => onMove(1)} className="tag" data-cursor="link">↓</button>
          <button onClick={onRemove} className="tag text-marker" data-cursor="link">✕</button>
        </div>
      </div>
      <input value={field.label} onChange={(e) => set({ label: e.target.value })} placeholder="Question / prompt" className="field" />

      {hasOptions(field.type) && (
        <div className="space-y-2 pl-2 border-l-2 border-ink/15">
          {field.options.map((o) => (
            <div key={o.id} className="flex items-center gap-2">
              <input value={o.text} onChange={(e) => setOpt(o.id, { text: e.target.value })} placeholder="Option" className="field py-1.5" />
              {isQuiz && (
                <label className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-ink-soft whitespace-nowrap" data-cursor="link">
                  <input type="checkbox" checked={!!o.correct} onChange={(e) => setOpt(o.id, { correct: e.target.checked })} /> correct
                </label>
              )}
              <button onClick={() => set({ options: field.options.filter((x) => x.id !== o.id) })} className="text-marker" data-cursor="link">✕</button>
            </div>
          ))}
          <button onClick={() => set({ options: [...field.options, { id: nid('o'), text: '', correct: false }] })} className="tag hover:border-ink" data-cursor="link">＋ option</button>
        </div>
      )}

      {field.type === 'rating' && <div className="font-mono text-[10px] uppercase tracking-widest text-stone">1–5 stars</div>}

      <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink-soft" data-cursor="link">
        <input type="checkbox" checked={!!field.required} onChange={(e) => set({ required: e.target.checked })} /> Required
      </label>
    </div>
  )
}

// ---- Tree node editor ------------------------------------------------------
function TreeEditor({ form, setForm }) {
  const setNode = (id, patch) => setForm({ ...form, nodes: form.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) })
  const addNode = (kind) => setForm({ ...form, nodes: [...form.nodes, kind === 'question' ? { id: nid('node'), kind, text: '', options: [{ id: nid('b'), text: '', to: '' }] } : { id: nid('node'), kind: 'outcome', text: '' }] })
  const removeNode = (id) => setForm({ ...form, nodes: form.nodes.filter((n) => n.id !== id), startNode: form.startNode === id ? (form.nodes[0]?.id || '') : form.startNode })
  const label = (n, i) => `${n.kind === 'outcome' ? 'Outcome' : 'Q'} ${i + 1}: ${(n.text || '').slice(0, 24) || '(empty)'}`

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="label mb-0">Start node</span>
        <select value={form.startNode} onChange={(e) => setForm({ ...form, startNode: e.target.value })} className="field max-w-xs py-1.5">
          {form.nodes.map((n, i) => <option key={n.id} value={n.id}>{label(n, i)}</option>)}
        </select>
      </div>
      {form.nodes.map((n, i) => (
        <div key={n.id} className="paper-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="tag" style={{ borderColor: n.kind === 'outcome' ? '#0E8F6E66' : '#1A171233' }}>{n.kind === 'outcome' ? 'Outcome' : 'Question'} {i + 1}</span>
            <button onClick={() => removeNode(n.id)} className="text-marker" data-cursor="link">✕</button>
          </div>
          <textarea value={n.text} onChange={(e) => setNode(n.id, { text: e.target.value })} placeholder={n.kind === 'outcome' ? 'Outcome text shown to the taker' : 'Question text'} className="field" rows={2} />
          {n.kind === 'question' && (
            <div className="space-y-2 pl-2 border-l-2 border-ink/15">
              {n.options.map((o) => (
                <div key={o.id} className="flex items-center gap-2">
                  <input value={o.text} onChange={(e) => setNode(n.id, { options: n.options.map((x) => x.id === o.id ? { ...x, text: e.target.value } : x) })} placeholder="Answer" className="field py-1.5" />
                  <span className="text-stone">→</span>
                  <select value={o.to} onChange={(e) => setNode(n.id, { options: n.options.map((x) => x.id === o.id ? { ...x, to: e.target.value } : x) })} className="field py-1.5 max-w-[160px]">
                    <option value="">choose…</option>
                    {form.nodes.filter((t) => t.id !== n.id).map((t, ti) => <option key={t.id} value={t.id}>{label(t, ti)}</option>)}
                  </select>
                  <button onClick={() => setNode(n.id, { options: n.options.filter((x) => x.id !== o.id) })} className="text-marker" data-cursor="link">✕</button>
                </div>
              ))}
              <button onClick={() => setNode(n.id, { options: [...n.options, { id: nid('b'), text: '', to: '' }] })} className="tag hover:border-ink" data-cursor="link">＋ branch</button>
            </div>
          )}
        </div>
      ))}
      <div className="flex gap-2">
        <button onClick={() => addNode('question')} className="btn-ghost" data-cursor="link">＋ Question</button>
        <button onClick={() => addNode('outcome')} className="btn-ghost" data-cursor="link">＋ Outcome</button>
      </div>
    </div>
  )
}

export default function FormBuilder({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() => initial || blankForm('quiz'))
  const isQuiz = form.type === 'quiz'
  const isTree = form.type === 'tree'

  const addField = () => setForm({ ...form, fields: [...form.fields, { id: nid('q'), type: 'short', label: '', required: false }] })
  const updateField = (id, next) => setForm({ ...form, fields: form.fields.map((f) => (f.id === id ? next : f)) })
  const removeField = (id) => setForm({ ...form, fields: form.fields.filter((f) => f.id !== id) })
  const moveField = (id, dir) => {
    const idx = form.fields.findIndex((f) => f.id === id)
    const j = idx + dir
    if (j < 0 || j >= form.fields.length) return
    const arr = [...form.fields]
    ;[arr[idx], arr[j]] = [arr[j], arr[idx]]
    setForm({ ...form, fields: arr })
  }

  const canSave = form.title.trim() && (isTree ? form.nodes.length : form.fields.length)

  return (
    <div className="space-y-5">
      {/* Type switch (only when creating new) */}
      {!initial && (
        <div className="flex gap-2">
          {['form', 'quiz', 'tree'].map((t) => (
            <button key={t} onClick={() => setForm(blankForm(t))} className={`tag ${form.type === t ? 'bg-ink text-chalk border-ink' : 'hover:border-ink'}`} data-cursor="link">
              {t === 'tree' ? 'Decision tree' : t}
            </button>
          ))}
        </div>
      )}

      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="field text-xl font-display italic font-bold" />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="field" rows={2} />

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="label mb-0">Accent</span>
          {ACCENTS.map((c) => <button key={c} onClick={() => setForm({ ...form, accent: c })} className={`w-6 h-6 rounded-full border-2 ${form.accent === c ? 'border-ink' : 'border-transparent'}`} style={{ background: c }} data-cursor="link" />)}
        </div>
        {isQuiz && (
          <div className="flex items-center gap-2">
            <span className="label mb-0">Pass %</span>
            <input type="number" value={form.passPct} onChange={(e) => setForm({ ...form, passPct: Number(e.target.value) })} className="field max-w-[80px] py-1.5" />
          </div>
        )}
      </div>

      {isTree ? (
        <TreeEditor form={form} setForm={setForm} />
      ) : (
        <div className="space-y-3">
          {form.fields.map((f) => (
            <FieldEditor key={f.id} field={f} isQuiz={isQuiz} onChange={(next) => updateField(f.id, next)} onRemove={() => removeField(f.id)} onMove={(d) => moveField(f.id, d)} />
          ))}
          <button onClick={addField} className="btn-ghost" data-cursor="link">＋ Add question</button>
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t border-ink/15">
        <button onClick={() => onSave(form)} disabled={!canSave} className="btn-ink" data-cursor="link">Save</button>
        <button onClick={onCancel} className="btn-ghost" data-cursor="link">Cancel</button>
      </div>
    </div>
  )
}
