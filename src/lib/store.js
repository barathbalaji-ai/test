// Tiny localStorage-backed pub/sub store + React hook.
// All app data lives under the single key `carta.v1`.
import { useEffect, useState } from 'react'

const KEY = 'carta.v1'

// ---- Seed forms (created on first run) ------------------------------------
const seedForms = () => [
  {
    id: 'seed-tone',
    type: 'quiz',
    title: 'Tone & Empathy Checkpoint',
    description: 'A short check on reading the room and replying with warmth.',
    accent: '#E0382B',
    passPct: 70,
    fields: [
      {
        id: 'q1',
        type: 'multiple-choice',
        label: 'A frustrated customer writes in caps. Your first move?',
        required: true,
        options: [
          { id: 'o1', text: 'Match their energy', correct: false },
          { id: 'o2', text: 'Acknowledge the frustration, then help', correct: true },
          { id: 'o3', text: 'Send a policy link', correct: false },
        ],
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        label: 'Which opener feels most empathetic?',
        required: true,
        options: [
          { id: 'o1', text: '"Per our policy…"', correct: false },
          { id: 'o2', text: '"I can see why that is frustrating — let me sort this."', correct: true },
          { id: 'o3', text: '"Calm down."', correct: false },
        ],
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        label: 'Empathy without action is…',
        required: true,
        options: [
          { id: 'o1', text: 'Enough on its own', correct: false },
          { id: 'o2', text: 'Only half the job', correct: true },
          { id: 'o3', text: 'A waste of time', correct: false },
        ],
      },
    ],
  },
  {
    id: 'seed-escalation',
    type: 'tree',
    title: 'Escalation Decision Tree',
    description: 'Walk a ticket to the right escalation path.',
    accent: '#8E2A20',
    startNode: 'n1',
    nodes: [
      {
        id: 'n1',
        kind: 'question',
        text: 'Is the customer reporting a full outage?',
        options: [
          { id: 'b1', text: 'Yes — nothing works', to: 'n2' },
          { id: 'b2', text: 'No — partial / single feature', to: 'n3' },
        ],
      },
      {
        id: 'n2',
        kind: 'question',
        text: 'Does it affect multiple customers?',
        options: [
          { id: 'b1', text: 'Yes', to: 'out-sev1' },
          { id: 'b2', text: 'Not sure / just them', to: 'out-sev2' },
        ],
      },
      {
        id: 'n3',
        kind: 'question',
        text: 'Is there a known workaround?',
        options: [
          { id: 'b1', text: 'Yes', to: 'out-workaround' },
          { id: 'b2', text: 'No', to: 'out-sev2' },
        ],
      },
      { id: 'out-sev1', kind: 'outcome', text: 'Sev-1: page the on-call engineer and open an incident now.' },
      { id: 'out-sev2', kind: 'outcome', text: 'Sev-2: escalate to T2 with full repro steps within the hour.' },
      { id: 'out-workaround', kind: 'outcome', text: 'Share the workaround, log the bug, and monitor for recurrence.' },
    ],
  },
  {
    id: 'seed-reflection',
    type: 'form',
    title: 'Post-Training Reflection',
    description: 'Two minutes of reflection after a live session.',
    accent: '#0E8F6E',
    fields: [
      { id: 'q1', type: 'rating', label: 'How useful was the session?', required: true, max: 5 },
      { id: 'q2', type: 'paragraph', label: 'One thing you will do differently this week.', required: true },
      { id: 'q3', type: 'short', label: 'A topic you want covered next.', required: false },
    ],
  },
]

const seedState = () => ({
  forms: seedForms(),
  responses: {},
  events: null, // null => not yet seeded; filled from SEED_EVENTS on first read
  completions: {},
})

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seedState()
    const parsed = JSON.parse(raw)
    return { ...seedState(), ...parsed }
  } catch {
    return seedState()
  }
}

let state = read()
const subs = new Set()

function write(next) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full / unavailable — ignore */
  }
  subs.forEach((fn) => fn())
}

function uid(prefix = 'id') {
  // Avoids Math.random for determinism issues elsewhere; counter + time-ish seed
  uid._n = (uid._n || 0) + 1
  return `${prefix}-${uid._n}-${(performance.now() | 0).toString(36)}`
}

export const store = {
  get: () => state,

  subscribe(fn) {
    subs.add(fn)
    return () => subs.delete(fn)
  },

  saveForm(form) {
    const exists = state.forms.some((f) => f.id === form.id)
    const withId = form.id ? form : { ...form, id: uid('form') }
    const forms = exists
      ? state.forms.map((f) => (f.id === withId.id ? withId : f))
      : [withId, ...state.forms]
    write({ ...state, forms })
    return withId.id
  },

  deleteForm(id) {
    const forms = state.forms.filter((f) => f.id !== id)
    const responses = { ...state.responses }
    delete responses[id]
    write({ ...state, forms, responses })
  },

  addResponse(formId, response) {
    const list = state.responses[formId] || []
    const entry = { id: uid('resp'), at: Date.now(), ...response }
    write({ ...state, responses: { ...state.responses, [formId]: [entry, ...list] } })
    return entry.id
  },

  addEvent(event) {
    const events = state.events || []
    const entry = { id: uid('evt'), ...event }
    write({ ...state, events: [...events, entry] })
    return entry.id
  },

  deleteEvent(id) {
    const events = (state.events || []).filter((e) => e.id !== id)
    write({ ...state, events })
  },

  ensureEventsSeeded(seed) {
    if (state.events === null) write({ ...state, events: seed })
  },

  markComplete(email, courseId, score) {
    const all = { ...(state.completions || {}) }
    const mine = { ...(all[email] || {}) }
    mine[courseId] = { at: Date.now(), score }
    all[email] = mine
    write({ ...state, completions: all })
  },

  completionsFor(email) {
    return (state.completions || {})[email] || {}
  },

  reset() {
    write(seedState())
  },
}

// React hook: useStore(selector) re-renders when the selected slice changes.
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
