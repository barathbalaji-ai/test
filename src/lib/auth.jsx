// Client-side sample auth (blueprint §5). Production should move to Google
// Sign-In restricted to the company domain (see CARTA_BLUEPRINT §12).
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const SESSION_KEY = 'carta.session'
const USERS_KEY = 'carta.users'

export const ALLOWED_DOMAIN = 'freshworks.com'

// Tutors (a.k.a. admins) are an allow-list maintained here.
export const TUTOR_IDS = ['barath.balaji@freshworks.com']

const isAllowedDomain = (email) =>
  typeof email === 'string' && email.trim().toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)

const norm = (email) => (email || '').trim().toLowerCase()

const readUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {}
  } catch {
    return {}
  }
}
const writeUsers = (u) => localStorage.setItem(USERS_KEY, JSON.stringify(u))

const readSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null
  } catch {
    return null
  }
}

export function listUsers() {
  return Object.values(readUsers())
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else localStorage.removeItem(SESSION_KEY)
  }, [session])

  const api = useMemo(() => {
    const persistUser = (user) => {
      const users = readUsers()
      users[user.email] = user
      writeUsers(users)
    }

    return {
      session,
      isTutor: session?.role === 'tutor',
      isLearner: session?.role === 'learner',

      // Learner sign-up: Name, Product, email (domain-restricted), password.
      signupLearner({ name, product, email, password }) {
        const e = norm(email)
        if (!isAllowedDomain(e)) return { error: `Use your @${ALLOWED_DOMAIN} email.` }
        if (TUTOR_IDS.includes(e)) return { error: 'This email is a tutor account — use the tutor side.' }
        if (!name?.trim()) return { error: 'Please add your name.' }
        if (!password || password.length < 4) return { error: 'Pick a password (4+ characters).' }
        const users = readUsers()
        if (users[e]) return { error: 'An account already exists — please log in.' }
        const user = { name: name.trim(), product, email: e, password, role: 'learner', createdAt: Date.now() }
        persistUser(user)
        const s = { role: 'learner', email: e, name: user.name, product }
        setSession(s)
        return { ok: true, session: s }
      },

      // Learner login by email + password.
      loginLearner({ email, password }) {
        const e = norm(email)
        if (!isAllowedDomain(e)) return { error: `Use your @${ALLOWED_DOMAIN} email.` }
        const users = readUsers()
        const user = users[e]
        if (!user || user.role !== 'learner') return { error: 'No learner account found — sign up first.' }
        if (user.password !== password) return { error: 'Incorrect password.' }
        const s = { role: 'learner', email: e, name: user.name, product: user.product }
        setSession(s)
        return { ok: true, session: s }
      },

      // Tutor login: only allow-listed emails; password set on first login.
      loginTutor({ email, password }) {
        const e = norm(email)
        if (!TUTOR_IDS.includes(e)) return { error: 'This email is not on the tutor allow-list.' }
        if (!password || password.length < 4) return { error: 'Set a password (4+ characters).' }
        const users = readUsers()
        let user = users[e]
        if (!user) {
          // First login sets the password.
          user = { name: 'Tutor', email: e, password, role: 'tutor', createdAt: Date.now() }
          persistUser(user)
        } else if (user.password !== password) {
          return { error: 'Incorrect password.' }
        }
        const s = { role: 'tutor', email: e, name: user.name || 'Tutor' }
        setSession(s)
        return { ok: true, session: s }
      },

      logout() {
        setSession(null)
      },

      listUsers,
    }
  }, [session])

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
