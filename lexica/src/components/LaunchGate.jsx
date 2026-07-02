import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ALLOWED_DOMAIN } from '../config/sources.js'
import { loadState, saveState } from '../lib/persist.js'

// Client-side domain gate, carried over from the previous site. It filters
// honest traffic; it is not a security boundary.
export default function LaunchGate({ children }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [open, setOpen] = useState(() => !loadState().gateEmail)

  const submit = (e) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!value.endsWith(`@${ALLOWED_DOMAIN}`)) {
      setError(`Use your @${ALLOWED_DOMAIN} address to enter.`)
      return
    }
    saveState({ gateEmail: value })
    setOpen(false)
  }

  return (
    <>
      {!open && children}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-void"
            exit={{ opacity: 0, transition: { duration: 1.2, ease: 'easeInOut' } }}
          >
            <div className="text-center px-6 max-w-md w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
              >
                <div className="mx-auto mb-8 h-3 w-3 rounded-full bg-white lexica-pulse" />
                <h1 className="font-display text-4xl tracking-[0.45em] text-white/90 mb-3">LEXICA</h1>
                <p className="font-body text-sm text-faint mb-10">
                  A living knowledge universe. Everything begins here.
                </p>
              </motion.div>
              <form onSubmit={submit} className="space-y-3">
                <input
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder={`you@${ALLOWED_DOMAIN}`}
                  aria-label="Work email"
                  className="w-full bg-panel border border-line rounded-lg px-4 py-3 text-sm text-white/90 font-body outline-none focus:border-white/30 transition-colors text-center"
                />
                {error && <p className="text-xs text-red-400 font-body">{error}</p>}
                <button
                  type="submit"
                  className="w-full rounded-lg border border-line bg-white/5 hover:bg-white/10 px-4 py-3 text-sm font-display tracking-widest text-white/80 transition-colors"
                >
                  ENTER THE UNIVERSE
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
