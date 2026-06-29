// GET  /api/users → list the learner/tutor roster (no passwords)
// POST /api/users → upsert a roster record. body = { email, name, product?, role }
//
// NOTE: this stores only roster info for analytics. Passwords stay client-side
// in the sample auth; move to Google Sign-In (verified server-side) for real auth.
import { sql, ensureSchema, body, send } from './_db.js'

export default async function handler(req, res) {
  try {
    await ensureSchema()
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT email, name, product, role, created_at FROM users`
      return send(res, 200, rows.map((u) => ({
        email: u.email, name: u.name, product: u.product, role: u.role, createdAt: new Date(u.created_at).getTime(),
      })))
    }
    if (req.method === 'POST') {
      const u = body(req)
      if (!u?.email) return send(res, 400, { error: 'Missing email' })
      await sql`INSERT INTO users (email, name, product, role)
                VALUES (${u.email}, ${u.name || null}, ${u.product || null}, ${u.role || 'learner'})
                ON CONFLICT (email) DO UPDATE SET
                  name = COALESCE(EXCLUDED.name, users.name),
                  product = COALESCE(EXCLUDED.product, users.product),
                  role = EXCLUDED.role`
      return send(res, 200, { ok: true })
    }
    return send(res, 405, { error: 'Method not allowed' })
  } catch (err) {
    send(res, 500, { error: String(err?.message || err) })
  }
}
