// Sticky, role-aware nav with a scroll-progress bar, animated active pill,
// per-item object glyphs, a user chip + log out, and a mobile drawer.
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useAuth } from '../lib/auth.jsx'
import Logo, { QuillMark } from './Logo.jsx'

const LEARNER_LINKS = [
  { to: '/', label: 'Home', glyph: '◆' },
  { to: '/courses', label: 'Courses', glyph: '▶' },
  { to: '/posters', label: 'Posters', glyph: '❖' },
  { to: '/articles', label: 'Articles', glyph: '✎' },
  { to: '/calendar', label: 'Calendar', glyph: '✦' },
]
const TUTOR_LINKS = [
  { to: '/studio', label: 'Studio', glyph: '✚' },
  { to: '/analytics', label: 'Analytics', glyph: '▥' },
]

export default function Nav() {
  const { session, isTutor, logout } = useAuth()
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  useEffect(() => setOpen(false), [loc.pathname])

  const links = [...LEARNER_LINKS, ...(isTutor ? TUTOR_LINKS : [])]

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-paper/85 backdrop-blur-md border-b border-ink/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" data-cursor="link">
            <span className="text-ink">
              <QuillMark className="w-7 h-7" />
            </span>
            <Logo size="text-2xl" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = loc.pathname === l.to
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  data-cursor="link"
                  className="relative px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors"
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-ink rounded-[3px]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-1.5 ${active ? 'text-chalk' : ''}`}>
                    <span className="text-[10px] opacity-70">{l.glyph}</span>
                    {l.label}
                  </span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            {session && (
              <div className="hidden sm:flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                  {isTutor ? 'Tutor' : 'Learner'} · {session.name?.split(' ')[0]}
                </span>
                <button onClick={logout} data-cursor="link" className="font-mono text-[10px] uppercase tracking-widest text-marker hover:underline">
                  Log out
                </button>
              </div>
            )}
            <button
              className="md:hidden text-ink"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
              data-cursor="link"
            >
              <div className="space-y-1.5">
                <span className="block w-6 h-0.5 bg-ink" />
                <span className="block w-6 h-0.5 bg-ink" />
                <span className="block w-4 h-0.5 bg-ink" />
              </div>
            </button>
          </div>
        </div>

        {/* Scroll-progress bar */}
        <motion.div className="h-0.5 bg-marker origin-left" style={{ scaleX: progress }} />
      </nav>

      {/* Mobile drawer */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-paper border-b border-ink/15 px-4 py-3"
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`block px-2 py-3 font-mono text-xs uppercase tracking-widest border-b border-ink/10 ${
                loc.pathname === l.to ? 'text-marker' : 'text-ink'
              }`}
            >
              <span className="opacity-60 mr-2">{l.glyph}</span>
              {l.label}
            </Link>
          ))}
          {session && (
            <button onClick={logout} className="mt-3 font-mono text-xs uppercase tracking-widest text-marker">
              Log out · {session.name?.split(' ')[0]}
            </button>
          )}
        </motion.div>
      )}
    </header>
  )
}
