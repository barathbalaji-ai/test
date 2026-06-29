// GET /api/state — the whole shared store in the shape the client expects:
// { forms, responses, events, completions, users }
import { sql, ensureSchema, send } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' })
  try {
    await ensureSchema()
    const [forms, responses, events, completions, users] = await Promise.all([
      sql`SELECT doc FROM forms ORDER BY updated_at DESC`,
      sql`SELECT id, form_id, by_email, answers, score, outcome, at FROM responses ORDER BY at DESC`,
      sql`SELECT doc FROM events`,
      sql`SELECT email, course_id, score, at FROM completions`,
      sql`SELECT email, name, product, role, created_at FROM users`,
    ])

    // responses: { [formId]: [ {id, at, by, answers, score?, outcome?} ] }
    const responsesByForm = {}
    for (const r of responses.rows) {
      ;(responsesByForm[r.form_id] ||= []).push({
        id: r.id,
        at: new Date(r.at).getTime(),
        by: r.by_email || undefined,
        answers: r.answers || undefined,
        ...(r.score != null ? { score: r.score } : {}),
        ...(r.outcome ? { outcome: r.outcome } : {}),
      })
    }

    // completions: { [email]: { [courseId]: { at, score } } }
    const completionsByEmail = {}
    for (const c of completions.rows) {
      ;(completionsByEmail[c.email] ||= {})[c.course_id] = {
        at: new Date(c.at).getTime(),
        score: c.score,
      }
    }

    send(res, 200, {
      forms: forms.rows.map((row) => row.doc),
      responses: responsesByForm,
      events: events.rows.map((row) => row.doc),
      completions: completionsByEmail,
      users: users.rows.map((u) => ({
        email: u.email,
        name: u.name,
        product: u.product,
        role: u.role,
        createdAt: new Date(u.created_at).getTime(),
      })),
    })
  } catch (err) {
    send(res, 500, { error: String(err?.message || err) })
  }
}
