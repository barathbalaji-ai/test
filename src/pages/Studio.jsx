// Quiz Studio (tutor only). Create forms / quizzes / decision trees; manage a
// library with Edit / Open / Responses / Delete; reset demo data.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader.jsx'
import FormBuilder from '../components/FormBuilder.jsx'
import ResponsesPanel from '../components/ResponsesPanel.jsx'
import { store, useStore } from '../lib/store.js'

const TYPE_LABEL = { form: 'Form', quiz: 'Quiz', tree: 'Decision tree' }

export default function Studio() {
  const forms = useStore((s) => s.forms)
  const responses = useStore((s) => s.responses)
  const [editing, setEditing] = useState(null) // form object or 'new'
  const [responsesFor, setResponsesFor] = useState(null)

  const save = (form) => {
    store.saveForm(form)
    setEditing(null)
  }

  if (editing) {
    return (
      <div className="pb-10">
        <PageHeader kicker="Quiz Studio" title={editing === 'new' ? 'New build' : 'Editing'} />
        <div className="mx-auto max-w-3xl px-6">
          <FormBuilder initial={editing === 'new' ? null : editing} onSave={save} onCancel={() => setEditing(null)} />
        </div>
      </div>
    )
  }

  return (
    <div className="pb-10">
      <PageHeader kicker="Quiz Studio" title="Build it yourself" intro="Create forms, graded quizzes and branching decision trees — fully styled, no design work. View responses and scores.">
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => setEditing('new')} className="btn-ink" data-cursor="link">＋ New build</button>
          <button onClick={() => { if (confirm('Reset to the seeded demo data? This clears your builds and responses.')) store.reset() }} className="btn-ghost" data-cursor="link">Reset demo data</button>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {forms.map((f) => {
          const count = (responses[f.id] || []).length
          return (
            <div key={f.id} className="paper-card p-5 flex flex-col" style={{ borderTopColor: f.accent, borderTopWidth: 3 }}>
              <div className="flex items-center justify-between">
                <span className="tag" style={{ color: f.accent, borderColor: f.accent + '66' }}>{TYPE_LABEL[f.type]}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-stone">{count} resp.</span>
              </div>
              <h3 className="mt-3 font-display italic font-bold text-xl">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-soft line-clamp-2 flex-1">{f.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setEditing(f)} className="tag hover:border-ink" data-cursor="link">Edit</button>
                <Link to={`/form/${f.id}`} className="tag hover:border-ink" data-cursor="link">Open</Link>
                <button onClick={() => setResponsesFor(f)} className="tag hover:border-ink" data-cursor="link">Responses</button>
                <button onClick={() => { if (confirm(`Delete "${f.title}"?`)) store.deleteForm(f.id) }} className="tag text-marker hover:border-marker" data-cursor="link">Delete</button>
              </div>
            </div>
          )
        })}
      </div>

      <AnimatePresence>{responsesFor && <ResponsesPanel form={responsesFor} onClose={() => setResponsesFor(null)} />}</AnimatePresence>
    </div>
  )
}
