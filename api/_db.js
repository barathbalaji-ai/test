// Shared DB helpers for the Carta serverless API (Vercel Postgres / Neon).
// Files prefixed with `_` are ignored by Vercel's function detection, so this is
// a plain module imported by the handlers, not an endpoint itself.
//
// Connection: @vercel/postgres reads POSTGRES_URL automatically (the env var the
// Vercel Postgres / Neon integration injects). No config needed in code.
import { sql } from '@vercel/postgres'

export { sql }

// ---- Seed data (inserted once, on first run, if tables are empty) ----------
const SEED_FORMS = [
  {
    id: 'seed-tone',
    type: 'quiz',
    title: 'Tone & Empathy Checkpoint',
    description: 'A short check on reading the room and replying with warmth.',
    accent: '#E0382B',
    passPct: 70,
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
    id: 'seed-escalation',
    type: 'tree',
    title: 'Escalation Decision Tree',
    description: 'Walk a ticket to the right escalation path.',
    accent: '#8E2A20',
    startNode: 'n1',
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

const SEED_EVENTS = [
  { id: 'evt-stakeholder-15', name: 'Stakeholder Engagement', short: 'Stakeholders', date: '2026-06-15', time: '10:30–18:30', duration: '1 day', location: 'Chennai', room: 'Virat Kohli', productIds: ['all'], type: 'Behavioural', trainer: 'Varsha Balakrishnan / Sreejith Murali / Anushree Francisca', seats: 24 },
  { id: 'evt-storytelling-16', name: 'Data Infused Storytelling', short: 'Storytelling', date: '2026-06-16', endDate: '2026-06-17', time: '14:30–20:30', duration: '2 days', location: 'Chennai', room: 'Sachin Tendulkar', productIds: ['all'], type: 'Leadership', trainer: 'External', seats: 20 },
  { id: 'evt-stakeholder-19', name: 'Stakeholder Engagement', short: 'Stakeholders', date: '2026-06-19', time: '10:30–18:30', duration: '1 day', location: 'Chennai', room: 'Virat Kohli', productIds: ['all'], type: 'Behavioural', trainer: 'Varsha Balakrishnan / Sreejith Murali / Anushree Francisca', seats: 24 },
]

// Run schema creation + seeding once per warm function instance.
let ready
export function ensureSchema() {
  if (!ready) ready = init()
  return ready
}

async function init() {
  await sql`CREATE TABLE IF NOT EXISTS forms (
    id text PRIMARY KEY,
    doc jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`
  await sql`CREATE TABLE IF NOT EXISTS responses (
    id text PRIMARY KEY,
    form_id text NOT NULL,
    by_email text,
    answers jsonb,
    score int,
    outcome text,
    at timestamptz NOT NULL DEFAULT now()
  )`
  await sql`CREATE TABLE IF NOT EXISTS events (
    id text PRIMARY KEY,
    doc jsonb NOT NULL
  )`
  await sql`CREATE TABLE IF NOT EXISTS completions (
    email text NOT NULL,
    course_id text NOT NULL,
    score int,
    at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (email, course_id)
  )`
  await sql`CREATE TABLE IF NOT EXISTS users (
    email text PRIMARY KEY,
    name text,
    product text,
    role text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`

  const { rows: f } = await sql`SELECT count(*)::int AS n FROM forms`
  if (f[0].n === 0) {
    for (const form of SEED_FORMS) {
      await sql`INSERT INTO forms (id, doc) VALUES (${form.id}, ${JSON.stringify(form)}) ON CONFLICT (id) DO NOTHING`
    }
  }
  const { rows: e } = await sql`SELECT count(*)::int AS n FROM events`
  if (e[0].n === 0) {
    for (const ev of SEED_EVENTS) {
      await sql`INSERT INTO events (id, doc) VALUES (${ev.id}, ${JSON.stringify(ev)}) ON CONFLICT (id) DO NOTHING`
    }
  }
}

// Small helper: parse a JSON body whether Vercel pre-parsed it or not.
export function body(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return req.body
}

export function send(res, status, data) {
  res.setHeader('content-type', 'application/json')
  res.status(status).send(JSON.stringify(data))
}
