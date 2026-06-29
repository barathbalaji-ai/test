// POST /api/responses → record a response.
// body = { formId, response: { id, at, by, answers?, score?, outcome? } }
import { sql, ensureSchema, body, send } from './_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })
  try {
    await ensureSchema()
    const { formId, response } = body(req)
    if (!formId || !response?.id) return send(res, 400, { error: 'Missing formId or response.id' })
    const at = response.at ? new Date(response.at) : new Date()
    await sql`INSERT INTO responses (id, form_id, by_email, answers, score, outcome, at)
              VALUES (
                ${response.id},
                ${formId},
                ${response.by || null},
                ${response.answers ? JSON.stringify(response.answers) : null},
                ${response.score ?? null},
                ${response.outcome || null},
                ${at.toISOString()}
              )
              ON CONFLICT (id) DO NOTHING`
    send(res, 200, { ok: true, id: response.id })
  } catch (err) {
    send(res, 500, { error: String(err?.message || err) })
  }
}
