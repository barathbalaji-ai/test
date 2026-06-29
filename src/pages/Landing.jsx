// Full-screen split Learner/Tutor login. Hover one half → it spotlights, the
// other dims. Click → themed login modal. Hand-drawn icons have a mild line-boil.
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth, ALLOWED_DOMAIN, TUTOR_IDS } from '../lib/auth.jsx'
import Logo, { QuillMark } from '../components/Logo.jsx'
import { PRODUCTS } from '../data/courses.js'

// Line-boil filter: turbulence seed steps at ~10fps via CSS steps animation on
// a wrapping element's animation that nudges a CSS var is awkward; instead we
// animate the SVG feTurbulence seed with SMIL stepped values.
function Boil({ id }) {
  return (
    <filter id={id}>
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="1" result="n">
        <animate attributeName="seed" values="1;2;3;4;5;6;7;8" dur="0.8s" calcMode="discrete" repeatCount="indefinite" />
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  )
}

function BulbNotes() {
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none" style={{ filter: 'url(#boil-l)' }}>
      <path d="M60 18 C40 18 30 34 36 52 C40 64 48 66 48 78 L72 78 C72 66 80 64 84 52 C90 34 80 18 60 18 Z" stroke="#1A1712" strokeWidth="3" strokeLinejoin="round" />
      <path d="M50 86 L70 86 M52 94 L68 94" stroke="#1A1712" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 6 L60 12 M88 22 L92 18 M32 22 L28 18 M96 50 L102 50 M18 50 L24 50" stroke="#E0382B" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 44 q10 -10 20 0" stroke="#E0382B" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function BoardClip() {
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none" style={{ filter: 'url(#boil-r)' }}>
      <rect x="14" y="20" width="72" height="52" rx="3" stroke="#F5F1E8" strokeWidth="3" />
      <path d="M24 34 H66 M24 44 H58 M24 54 H62" stroke="#F5F1E8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 72 L40 84 M60 72 L60 84 M30 84 H70" stroke="#F5F1E8" strokeWidth="3" strokeLinecap="round" />
      {/* clipboard */}
      <rect x="78" y="40" width="30" height="40" rx="3" stroke="#F5F1E8" strokeWidth="3" />
      <rect x="88" y="36" width="10" height="7" rx="2" fill="#E0382B" />
      <path d="M84 54 H102 M84 62 H98" stroke="#E0382B" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function PasswordField({ value, onChange, placeholder = 'Password' }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="field pr-16"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest text-ink-soft hover:text-marker"
        data-cursor="link"
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

function Modal({ role, onClose }) {
  const { signupLearner, loginLearner, loginTutor } = useAuth()
  const tutor = role === 'tutor'
  const [mode, setMode] = useState(tutor ? 'login' : 'login') // learner toggles signup/login
  const [form, setForm] = useState({ name: '', product: PRODUCTS[1].id, email: '', password: '' })
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setError('')
    let res
    if (tutor) res = loginTutor({ email: form.email, password: form.password })
    else if (mode === 'signup') res = signupLearner(form)
    else res = loginLearner({ email: form.email, password: form.password })
    if (res?.error) setError(res.error)
    // on success the AuthProvider sets the session and the app swaps to the Site
  }

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 24, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className={`relative w-full max-w-md rounded-[4px] border shadow-hard p-7 ${
          tutor ? 'bg-ink text-chalk border-chalk/20' : 'bg-chalk text-ink border-ink/20'
        }`}
      >
        <button onClick={onClose} className={`absolute top-4 right-4 ${tutor ? 'text-chalk/70' : 'text-ink-soft'} hover:text-marker`} data-cursor="link">✕</button>
        <div className={`eyebrow ${tutor ? 'text-marker' : ''}`}>{tutor ? 'Teach. Track. Tune.' : 'Relearn. Repeat. Resolve.'}</div>
        <h2 className="mt-2 font-display italic font-bold text-3xl">
          {tutor ? 'Tutor sign in' : mode === 'signup' ? 'Create your account' : 'Learner sign in'}
        </h2>

        <form onSubmit={submit} className="mt-5 space-y-3">
          {!tutor && mode === 'signup' && (
            <>
              <div>
                <label className="label">Name</label>
                <input value={form.name} onChange={set('name')} placeholder="Your name" className="field" />
              </div>
              <div>
                <label className="label">Product</label>
                <select value={form.product} onChange={set('product')} className="field">
                  {PRODUCTS.filter((p) => p.id !== 'all').map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="label">Email</label>
            <input value={form.email} onChange={set('email')} placeholder={`you@${ALLOWED_DOMAIN}`} className="field" autoComplete="email" />
          </div>
          <div>
            <label className="label">Password</label>
            <PasswordField value={form.password} onChange={set('password')} />
          </div>

          {error && <p className="text-marker text-sm font-medium">{error}</p>}

          <button type="submit" className={`w-full justify-center ${tutor ? 'btn-ghost border-chalk/40 text-chalk' : 'btn-ink'}`} data-cursor="link">
            {tutor ? 'Enter Studio' : mode === 'signup' ? 'Sign up' : 'Log in'}
          </button>
        </form>

        {tutor ? (
          <p className="mt-4 text-xs text-chalk/60 leading-relaxed">
            Approved tutor: <span className="text-marker">{TUTOR_IDS[0]}</span>. Set your password on first sign in.
          </p>
        ) : (
          <button
            onClick={() => { setMode((m) => (m === 'signup' ? 'login' : 'signup')); setError('') }}
            className="mt-4 text-sm text-ink-soft hover:text-marker"
            data-cursor="link"
          >
            {mode === 'signup' ? 'Already have an account? Log in' : 'New here? Create an account'}
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function Landing() {
  const [hover, setHover] = useState(null) // 'learner' | 'tutor'
  const [modal, setModal] = useState(null)

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <svg className="absolute w-0 h-0">
        <Boil id="boil-l" />
        <Boil id="boil-r" />
      </svg>

      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Learner — white */}
        <motion.button
          onClick={() => setModal('learner')}
          onMouseEnter={() => setHover('learner')}
          onMouseLeave={() => setHover(null)}
          data-cursor="link"
          className="relative flex-1 bg-chalk text-ink flex flex-col items-center justify-center gap-6 px-8 py-20 transition-[filter] duration-300"
          style={{ filter: hover === 'tutor' ? 'brightness(0.55)' : 'none' }}
        >
          <BulbNotes />
          <div className="text-center">
            <div className="eyebrow">For learners</div>
            <h2 className="mt-2 font-display italic font-bold text-4xl sm:text-5xl tracking-tightest">Relearn.<br />Repeat.<br />Resolve.</h2>
            <p className="mt-4 text-ink-soft max-w-xs mx-auto">Courses, quizzes, posters and live training — your support handbook.</p>
            <span className="mt-6 inline-block btn-ink">Enter as learner →</span>
          </div>
        </motion.button>

        {/* Tutor — black */}
        <motion.button
          onClick={() => setModal('tutor')}
          onMouseEnter={() => setHover('tutor')}
          onMouseLeave={() => setHover(null)}
          data-cursor="link"
          className="relative flex-1 bg-ink text-chalk flex flex-col items-center justify-center gap-6 px-8 py-20 transition-[filter] duration-300"
          style={{ filter: hover === 'learner' ? 'brightness(0.55)' : 'none' }}
        >
          <BoardClip />
          <div className="text-center">
            <div className="eyebrow text-marker">For tutors</div>
            <h2 className="mt-2 font-display italic font-bold text-4xl sm:text-5xl tracking-tightest">Teach.<br />Track.<br />Tune.</h2>
            <p className="mt-4 text-chalk/70 max-w-xs mx-auto">Build quizzes and decision trees, schedule sessions, watch the stats.</p>
            <span className="mt-6 inline-block btn-ghost border-chalk/40 text-chalk">Enter as tutor →</span>
          </div>
        </motion.button>
      </div>

      {/* Centre seam wordmark */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-2 z-10">
        <span className="w-14 h-14 rounded-full bg-paper border border-ink/20 flex items-center justify-center text-ink shadow-hard-sm">
          <QuillMark className="w-9 h-9" />
        </span>
        <span className="bg-paper px-3 py-1 rounded-[3px] border border-ink/15">
          <Logo size="text-2xl" />
        </span>
      </div>

      <AnimatePresence>
        {modal && <Modal role={modal} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  )
}
