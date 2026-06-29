// Public runner for any built form / quiz / tree. Quizzes auto-grade + show a
// result; trees walk node-to-node to an outcome; responses save with the
// taker's email for analytics.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import { store, useStore } from '../lib/store.js'
import { useAuth } from '../lib/auth.jsx'

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} data-cursor="link" className={`text-2xl ${n <= value ? 'text-marker' : 'text-stone/50'}`}>★</button>
      ))}
    </div>
  )
}

function FieldInput({ field, value, onChange }) {
  switch (field.type) {
    case 'paragraph':
      return <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} className="field" rows={3} />
    case 'rating':
      return <Stars value={value || 0} onChange={onChange} />
    case 'multiple-choice':
      return (
        <div className="space-y-1.5">
          {field.options.map((o) => (
            <button key={o.id} onClick={() => onChange(o.text)} data-cursor="link" className={`w-full text-left text-sm px-3 py-2 rounded-[3px] border ${value === o.text ? 'border-ink bg-ink/5' : 'border-ink/20 hover:border-ink/50'}`}>{o.text}</button>
          ))}
        </div>
      )
    case 'checkboxes':
      return (
        <div className="space-y-1.5">
          {field.options.map((o) => {
            const arr = value || []
            const on = arr.includes(o.text)
            return (
              <button key={o.id} onClick={() => onChange(on ? arr.filter((x) => x !== o.text) : [...arr, o.text])} data-cursor="link" className={`w-full text-left text-sm px-3 py-2 rounded-[3px] border ${on ? 'border-ink bg-ink/5' : 'border-ink/20 hover:border-ink/50'}`}>
                <span className="mr-2">{on ? '☑' : '☐'}</span>{o.text}
              </button>
            )
          })}
        </div>
      )
    default:
      return <input value={value || ''} onChange={(e) => onChange(e.target.value)} className="field" />
  }
}

function gradeQuiz(form, answers) {
  const graded = form.fields.filter((f) => f.options?.some((o) => o.correct))
  if (!graded.length) return null
  let correct = 0
  for (const f of graded) {
    const want = f.options.filter((o) => o.correct).map((o) => o.text).sort()
    const got = (Array.isArray(answers[f.id]) ? answers[f.id] : [answers[f.id]]).filter(Boolean).sort()
    if (want.length === got.length && want.every((w, i) => w === got[i])) correct++
  }
  return Math.round((correct / graded.length) * 100)
}

export default function FormRunner() {
  const { id } = useParams()
  const { session } = useAuth()
  const forms = useStore((s) => s.forms)
  const form = forms.find((f) => f.id === id)

  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  // Tree state
  const [nodeId, setNodeId] = useState(form?.startNode)
  const node = useMemo(() => form?.nodes?.find((n) => n.id === nodeId), [form, nodeId])

  // Record a tree outcome once it's reached (one entry per outcome per visit).
  const recorded = useRef(new Set())
  useEffect(() => {
    if (form?.type === 'tree' && node?.kind === 'outcome' && !recorded.current.has(node.id)) {
      recorded.current.add(node.id)
      store.addResponse(form.id, { by: session?.email, outcome: node.text })
    }
  }, [form, node, session])

  if (!form) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display italic font-bold text-4xl">Not found</h1>
        <p className="mt-3 text-ink-soft">That form doesn't exist (it may have been deleted).</p>
        <Link to="/studio" className="btn-ghost mt-6 inline-block" data-cursor="link">Back to Studio</Link>
      </div>
    )
  }

  const set = (fid, v) => setAnswers((a) => ({ ...a, [fid]: v }))

  // ---- Form / Quiz submit ----
  const submit = () => {
    const missing = (form.fields || []).some((f) => f.required && (answers[f.id] === undefined || answers[f.id] === '' || (Array.isArray(answers[f.id]) && !answers[f.id].length)))
    if (missing) { alert('Please answer the required questions.'); return }
    const score = form.type === 'quiz' ? gradeQuiz(form, answers) : null
    store.addResponse(form.id, { by: session?.email, answers, ...(score != null ? { score } : {}) })
    setResult({ score })
  }

  return (
    <div className="pb-16">
      <PageHeader kicker={form.type === 'tree' ? 'Decision tree' : form.type === 'quiz' ? 'Checkpoint quiz' : 'Form'} title={form.title} intro={form.description} />

      <div className="mx-auto max-w-2xl px-6">
        <div className="paper-card p-6" style={{ borderTopColor: form.accent, borderTopWidth: 4 }}>
          {/* TREE */}
          {form.type === 'tree' ? (
            node?.kind === 'outcome' ? (
              <div className="text-center space-y-4">
                <div className="text-4xl">🏁</div>
                <p className="font-display italic font-bold text-2xl">{node.text}</p>
                <button onClick={() => { recorded.current.clear(); setNodeId(form.startNode) }} className="btn-ghost" data-cursor="link">Start over</button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-display italic font-bold text-2xl tracking-tightest">{node?.text}</p>
                <div className="space-y-2">
                  {node?.options.map((o) => (
                    <button key={o.id} onClick={() => o.to && setNodeId(o.to)} data-cursor="link" className="w-full text-left px-4 py-3 rounded-[3px] border border-ink/20 hover:border-ink hover:bg-ink/5 transition">{o.text}</button>
                  ))}
                </div>
              </div>
            )
          ) : result ? (
            /* FORM / QUIZ result */
            <div className="text-center space-y-4 py-4">
              {form.type === 'quiz' ? (
                <>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-stone">Your score</div>
                  <div className="font-display italic font-black text-6xl tracking-tightest" style={{ color: result.score >= (form.passPct || 70) ? '#0E8F6E' : '#E0382B' }}>{result.score}%</div>
                  <p className="text-ink-soft">{result.score >= (form.passPct || 70) ? 'Passed — nice work.' : `Below the ${form.passPct || 70}% pass mark. Give it another go.`}</p>
                </>
              ) : (
                <>
                  <div className="text-4xl">✓</div>
                  <p className="font-display italic font-bold text-2xl">Thanks — your response is in.</p>
                </>
              )}
              <Link to="/studio" className="btn-ghost inline-block" data-cursor="link">Done</Link>
            </div>
          ) : (
            /* FORM / QUIZ questions */
            <div className="space-y-6">
              {form.fields.map((f, i) => (
                <div key={f.id}>
                  <label className="block font-medium mb-2">
                    {i + 1}. {f.label} {f.required && <span className="text-marker">*</span>}
                  </label>
                  <FieldInput field={f} value={answers[f.id]} onChange={(v) => set(f.id, v)} />
                </div>
              ))}
              <button onClick={submit} className="btn-ink w-full justify-center" data-cursor="link">Submit</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
