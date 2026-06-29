// POST /api/forms          → upsert a form (body = full form object)
// DELETE /api/forms?id=...  → delete a form and its responses
import { sql, ensureSchema, body, send } from './_db.js'

export default async function handler(req, res) {
  try {
    await ensureSchema()
    if (req.method === 'POST') {
      const form = body(req)
      if (!form?.id) return send(res, 400, { error: 'Missing form id' })
      await sql`INSERT INTO forms (id, doc, updated_at) VALUES (${form.id}, ${JSON.stringify(form)}, now())
                ON CONFLICT (id) DO UPDATE SET doc = EXCLUDED.doc, updated_at = now()`
      return send(res, 200, { ok: true, id: form.id })
    }
    if (req.method === 'DELETE') {
      const id = req.query.id
      if (!id) return send(res, 400, { error: 'Missing id' })
      await sql`DELETE FROM responses WHERE form_id = ${id}`
      await sql`DELETE FROM forms WHERE id = ${id}`
      return send(res, 200, { ok: true })
    }
    return send(res, 405, { error: 'Method not allowed' })
  } catch (err) {
    send(res, 500, { error: String(err?.message || err) })
  }
}
