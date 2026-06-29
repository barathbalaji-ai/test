// POST /api/completions → record (or update) a learner's course completion.
// body = { email, courseId, score }
import { sql, ensureSchema, body, send } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })
  try {
    await ensureSchema()
    const { email, courseId, score } = body(req)
    if (!email || !courseId) return send(res, 400, { error: 'Missing email or courseId' })
    await sql`INSERT INTO completions (email, course_id, score, at)
              VALUES (${email}, ${courseId}, ${score ?? 0}, now())
              ON CONFLICT (email, course_id) DO UPDATE SET score = EXCLUDED.score, at = now()`
    send(res, 200, { ok: true })
  } catch (err) {
    send(res, 500, { error: String(err?.message || err) })
  }
}
