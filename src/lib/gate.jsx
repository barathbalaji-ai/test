// Lightweight launch gate. No accounts, no passwords, no roles — the site is a
// static frontend. To enter, a visitor confirms a company email; the session is
// just that email, kept in localStorage. This is a soft gate for an internal
// audience, NOT a security boundary.
import { createContext, useContext, useMemo, useState } from 'react'
import { ALLOWED_DOMAIN } from '../config/sources.js'

const SESSION_KEY = 'carta.session'

const norm = (email) => (email || '').trim().toLowerCase()
export const isAllowedEmail = (email) =>
  norm(email).endsWith(`@${ALLOWED_DOMAIN}`) && /^[^@\s]+@/.test(norm(email))

const readSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null } catch { return null }
}

const GateContext = createContext(null)

export function GateProvider({ children }) {
  const [session, setSession] = useState(readSession)

  const api = useMemo(() => ({
    session,
    email: session?.email || null,
    enter(email) {
      const e = norm(email)
      if (!isAllowedEmail(e)) return { error: `Enter your @${ALLOWED_DOMAIN} email.` }
      const s = { email: e, at: Date.now() }
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch { /* ignore */ }
      setSession(s)
      return { ok: true }
    },
    exit() {
      try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
      setSession(null)
    },
  }), [session])

  return <GateContext.Provider value={api}>{children}</GateContext.Provider>
}

export function useGate() {
  const ctx = useContext(GateContext)
  if (!ctx) throw new Error('useGate must be used inside <GateProvider>')
  return ctx
}
