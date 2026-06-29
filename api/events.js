// POST /api/events          → upsert a calendar session (body = event object)
// DELETE /api/events?id=...  → delete a session
import { sql, ensureSchema, body, send } from './_db.js'

export default async function handler(req, res) {
  try {
    await ensureSchema()
    if (req.method === 'POST') {
      const ev = body(req)
      if (!ev?.id) return send(res, 400, { error: 'Missing event id' })
      await sql`INSERT INTO events (id, doc) VALUES (${ev.id}, ${JSON.stringify(ev)})
                ON CONFLICT (id) DO UPDATE SET doc = EXCLUDED.doc`
      return send(res, 200, { ok: true, id: ev.id })
    }
    if (req.method === 'DELETE') {
      const id = req.query.id
      if (!id) return send(res, 400, { error: 'Missing id' })
      await sql`DELETE FROM events WHERE id = ${id}`
      return send(res, 200, { ok: true })
    }
    return send(res, 405, { error: 'Method not allowed' })
  } catch (err) {
    send(res, 500, { error: String(err?.message || err) })
  }
}
