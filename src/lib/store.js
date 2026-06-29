// Shared store. Syncs through the serverless API (/api) when a backend is
// available, and falls back to localStorage-only otherwise (local dev without
// `vercel dev`, or a static-only deploy). The public method signatures stay
// synchronous: writes update local state optimistically and POST in the
// background, so the UI never waits on the network.
import { useEffect, useState } from 'react'

const KEY = 'carta.v1'
const API = '/api'

// ---- Seed data (offline fallback only; the backend seeds itself) -----------
const seedForms = () => [
  {
    id: 'seed-tone', type: 'quiz', title: 'Tone & Empathy Checkpoint',
    description: 'A short check on reading the room and replying with warmth.', accent: '#E0382B', passPct: 70,
    fields: [
      { id: 'q1', type: 'multiple-choice', label: 'A frustrated customer writes in caps. Your first move?', required: true, options: [
        { id: 'o1', text: 'Match their energy', correct: false },
        { id: 'o2', text: 'Acknowledge the frustration, then help', correct: true },
        { id: 'o3', text: 'Send a policy link', correct: false },
      ] },
      { id: 'q2', type: 'multiple-choice', label: 'Which opener feels most empathetic?', required: true, options: [
        { id: 'o1', text: '"Per our policy…"', correct: false },
        { id: 'o2', text: '"I can see why that is frustrating — let me sort this."', correct: true },
        { id: 'o3', text: '"Calm down."', correct: false },
      ] },
      { id: 'q3', type: 'multiple-choice', label: 'Empathy without action is…', required: true, options: [
        { id: 'o1', text: 'Enough on its own', correct: false },
        { id: 'o2', text: 'Only half the job', correct: true },
        { id: 'o3', text: 'A waste of time', correct: false },
      ] },
    ],
  },
  {
    id: 'seed-escalation', type: 'tree', title: 'Escalation Decision Tree',
    description: 'Walk a ticket to the right escalation path.', accent: '#8E2A20', startNode: 'n1',
    nodes: [
      { id: 'n1', kind: 'question', text: 'Is the customer reporting a full outage?', options: [
        { id: 'b1', text: 'Yes — nothing works', to: 'n2' },
        { id: 'b2', text: 'No — partial / single feature', to: 'n3' },
      ] },
      { id: 'n2', kind: 'question', text: 'Does it affect multiple customers?', options: [
        { id: 'b1', text: 'Yes', to: 'out-sev1' },
        { id: 'b2', text: 'Not sure / just them', to: 'out-sev2' },
      ] },
      { id: 'n3', kind: 'question', text: 'Is there a known workaround?', options: [
        { id: 'b1', text: 'Yes', to: 'out-workaround' },
        { id: 'b2', text: 'No', to: 'out-sev2' },
      ] },
      { id: 'out-sev1', kind: 'outcome', text: 'Sev-1: page the on-call engineer and open an incident now.' },
      { id: 'out-sev2', kind: 'outcome', text: 'Sev-2: escalate to T2 with full repro steps within the hour.' },
      { id: 'out-workaround', kind: 'outcome', text: 'Share the workaround, log the bug, and monitor for recurrence.' },
    ],
  },
  {
    id: 'seed-reflection', type: 'form', title: 'Post-Training Reflection',
    description: 'Two minutes of reflection after a live session.', accent: '#0E8F6E',
    fields: [
      { id: 'q1', type: 'rating', label: 'How useful was the session?', required: true, max: 5 },
      { id: 'q2', type: 'paragraph', label: 'One thing you will do differently this week.', required: true },
      { id: 'q3', type: 'short', label: 'A topic you want covered next.', required: false },
    ],
  },
]

const seedState = () => ({ forms: seedForms(), responses: {}, events: null, completions: {}, users: [] })

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seedState()
    return { ...seedState(), ...JSON.parse(raw) }
  } catch {
    return seedState()
  }
}

let state = read()
let backend = false
const subs = new Set()

function write(next) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  subs.forEach((fn) => fn())
}

let n = 0
function uid(prefix = 'id') {
  n += 1
  return `${prefix}-${Date.now().toString(36)}-${n}`
}

// ---- Network helpers -------------------------------------------------------
async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'content-type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  return res.status === 204 ? null : res.json()
}
// Background POST/DELETE that never throws into the UI.
const fire = (path, opts) => api(path, opts).catch(() => { backend = false })

// Pull shared state from the backend. Falls back to local seeds if unavailable.
async function hydrate() {
  try {
    const s = await api('/state')
    backend = true
    write({
      forms: s.forms?.length ? s.forms : seedForms(),
      responses: s.responses || {},
      events: s.events || [],
      completions: s.completions || {},
      users: s.users || [],
    })
  } catch {
    backend = false
    if (!state.forms?.length) write(seedState())
  }
}
if (typeof window !== 'undefined') hydrate()

export const store = {
  get: () => state,
  isBackend: () => backend,

  subscribe(fn) {
    subs.add(fn)
    return () => subs.delete(fn)
  },

  saveForm(form) {
    const withId = form.id ? form : { ...form, id: uid('form') }
    const exists = state.forms.some((f) => f.id === withId.id)
    const forms = exists ? state.forms.map((f) => (f.id === withId.id ? withId : f)) : [withId, ...state.forms]
    write({ ...state, forms })
    fire('/forms', { method: 'POST', body: withId })
    return withId.id
  },

  deleteForm(id) {
    const responses = { ...state.responses }
    delete responses[id]
    write({ ...state, forms: state.forms.filter((f) => f.id !== id), responses })
    fire(`/forms?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  },

  addResponse(formId, response) {
    const entry = { id: uid('resp'), at: Date.now(), ...response }
    const list = state.responses[formId] || []
    write({ ...state, responses: { ...state.responses, [formId]: [entry, ...list] } })
    fire('/responses', { method: 'POST', body: { formId, response: entry } })
    return entry.id
  },

  addEvent(event) {
    const entry = { id: uid('evt'), ...event }
    write({ ...state, events: [...(state.events || []), entry] })
    fire('/events', { method: 'POST', body: entry })
    return entry.id
  },

  deleteEvent(id) {
    write({ ...state, events: (state.events || []).filter((e) => e.id !== id) })
    fire(`/events?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  },

  // Seeds the calendar locally only when there is no backend (offline mode).
  ensureEventsSeeded(seed) {
    if (state.events === null) write({ ...state, events: backend ? [] : seed })
  },

  markComplete(email, courseId, score) {
    const all = { ...(state.completions || {}) }
    all[email] = { ...(all[email] || {}), [courseId]: { at: Date.now(), score } }
    write({ ...state, completions: all })
    fire('/completions', { method: 'POST', body: { email, courseId, score } })
  },

  completionsFor(email) {
    return (state.completions || {})[email] || {}
  },

  // Roster upsert for shared analytics (no password).
  upsertUser(user) {
    const others = (state.users || []).filter((u) => u.email !== user.email)
    write({ ...state, users: [...others, { createdAt: Date.now(), ...user }] })
    fire('/users', { method: 'POST', body: user })
  },

  // "Reset demo data": re-pull from the backend if present, else local seeds.
  reset() {
    if (backend) hydrate()
    else write(seedState())
  },
}

// React hook: re-renders when the selected slice changes.
export function useStore(selector = (s) => s) {
  const [value, setValue] = useState(() => selector(store.get()))
  useEffect(() => {
    const update = () => setValue(() => selector(store.get()))
    update()
    return store.subscribe(update)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return value
}
