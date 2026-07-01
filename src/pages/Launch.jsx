// Launch gate — the only thing between a visitor and the site. Confirm a
// company email to enter. Editorial, full-screen, on-brand. Soft gate only.
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGate } from '../lib/gate.jsx'
import { ALLOWED_DOMAIN } from '../config/sources.js'
import Logo, { QuillMark } from '../components/Logo.jsx'
import StippleBrain from '../components/StippleBrain.jsx'

export default function Launch() {
  const { enter } = useGate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const res = enter(email)
    if (res?.error) setError(res.error)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-paper flex flex-col">
      {/* faint brain on the right, decorative */}
      <div className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 w-[55%] max-w-3xl opacity-[0.12] hidden lg:block">
        <StippleBrain />
      </div>

      <header className="relative z-10 mx-auto w-full max-w-7xl px-6 py-6 flex items-center gap-2">
        <span className="text-ink"><QuillMark className="w-7 h-7" /></span>
        <Logo size="text-2xl" />
      </header>

      <div className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-6 flex items-center">
        <div className="max-w-xl">
          <div className="eyebrow">Customer Support · Learning Portal</div>
          <h1 className="mt-5 font-display font-black tracking-tightest leading-[0.92] text-6xl sm:text-7xl">
            Relearn.<br />Repeat.<br /><span className="italic">Resolve.</span>
          </h1>
          <p className="mt-6 text-lg text-ink-soft leading-relaxed">
            Courses, posters, live training and this month's launches — the learning
            home for the Support team. Enter with your Freshworks email to step inside.
          </p>

          <form onSubmit={submit} className="mt-8 max-w-md">
            <label className="label">Freshworks email</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder={`you@${ALLOWED_DOMAIN}`}
                className="field"
                autoComplete="email"
                autoFocus
              />
              <button type="submit" className="btn-ink shrink-0 justify-center" data-cursor="link">
                Enter →
              </button>
            </div>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-marker text-sm font-medium">
                {error}
              </motion.p>
            )}
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-stone">
              Restricted to @{ALLOWED_DOMAIN}. No password needed.
            </p>
          </form>
        </div>
      </div>

      <footer className="relative z-10 mx-auto w-full max-w-7xl px-6 py-6 font-mono text-[10px] uppercase tracking-widest text-stone">
        Carta — the craft of great support, written by hand.
      </footer>
    </div>
  )
}
