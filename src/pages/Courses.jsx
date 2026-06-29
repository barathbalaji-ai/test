// Course library + checkpoint flow.
// Clicking a course opens its Drive link in a NEW TAB *and* an acknowledgement
// modal here. The "Yes, mark complete" button is disabled until the learner
// submits the short checkpoint quiz. Completion is tracked per learner email.
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageHeader from '../components/PageHeader.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { COURSES, TRACKS, PRODUCTS, productById } from '../data/courses.js'
import { store, useStore } from '../lib/store.js'
import { useAuth } from '../lib/auth.jsx'

function CheckpointModal({ course, email, completed, onClose }) {
  const [phase, setPhase] = useState('intro') // intro | quiz | done
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const score = useMemo(() => {
    if (!submitted) return null
    const correct = course.quiz.reduce((n, q, i) => n + (answers[i] === q.correct ? 1 : 0), 0)
    return Math.round((correct / course.quiz.length) * 100)
  }, [submitted, answers, course])

  const openDrive = () => {
    window.open(course.link, '_blank', 'noopener,noreferrer')
  }

  const submitQuiz = () => setSubmitted(true)
  const allAnswered = course.quiz.every((_, i) => answers[i] !== undefined)

  const markComplete = () => {
    store.markComplete(email, course.id, score ?? 0)
    setPhase('done')
  }

  return (
    <motion.div className="fixed inset-0 z-[200] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 24, scale: 0.97 }}
        className="relative w-full max-w-lg bg-chalk border border-ink/20 rounded-[4px] shadow-hard p-7 max-h-[88vh] overflow-y-auto no-scrollbar"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-ink-soft hover:text-marker" data-cursor="link">✕</button>
        <div className="eyebrow">{course.track}</div>
        <h2 className="mt-1 font-display italic font-bold text-3xl tracking-tightest">{course.title}</h2>

        {phase === 'intro' && (
          <div className="mt-4 space-y-4">
            <p className="text-ink-soft text-sm leading-relaxed">{course.blurb}</p>
            <div className="rounded-[3px] border border-ink/15 bg-paper/60 p-4">
              <p className="text-sm">
                The lesson opens in a new tab. When you've finished watching, come back and
                <span className="font-semibold"> complete the checkpoint quiz</span> to mark this course done.
              </p>
            </div>
            <button onClick={openDrive} className="btn-ghost w-full justify-center" data-cursor="link">
              ↗ Open the lesson (Google Drive)
            </button>
            <button onClick={() => setPhase('quiz')} className="btn-ink w-full justify-center" data-cursor="link">
              I've finished watching → checkpoint quiz
            </button>
            {completed && <p className="text-center text-sm text-[#0E8F6E] font-medium">✓ You already completed this course.</p>}
          </div>
        )}

        {phase === 'quiz' && (
          <div className="mt-4 space-y-5">
            {course.quiz.map((q, i) => (
              <div key={i}>
                <p className="font-medium text-sm mb-2">{i + 1}. {q.q}</p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => {
                    const chosen = answers[i] === oi
                    const reveal = submitted
                    const isCorrect = oi === q.correct
                    return (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                        data-cursor="link"
                        className={`w-full text-left text-sm px-3 py-2 rounded-[3px] border transition ${
                          reveal && isCorrect
                            ? 'border-[#0E8F6E] bg-[#0E8F6E]/10'
                            : reveal && chosen && !isCorrect
                            ? 'border-marker bg-marker/10'
                            : chosen
                            ? 'border-ink bg-ink/5'
                            : 'border-ink/20 hover:border-ink/50'
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {!submitted ? (
              <button onClick={submitQuiz} disabled={!allAnswered} className="btn-ink w-full justify-center" data-cursor="link">
                Submit checkpoint
              </button>
            ) : (
              <div className="space-y-3">
                <div className="text-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-stone">Your score</span>
                  <div className="font-display italic font-black text-5xl tracking-tightest" style={{ color: score >= 70 ? '#0E8F6E' : '#E0382B' }}>{score}%</div>
                </div>
                <button onClick={markComplete} className="btn-ink w-full justify-center" data-cursor="link">
                  ✓ Yes, mark complete
                </button>
              </div>
            )}

            {/* The "mark complete" affordance is only reachable after submitting. */}
          </div>
        )}

        {phase === 'done' && (
          <div className="mt-6 text-center space-y-3">
            <div className="text-5xl">✓</div>
            <p className="font-display italic font-bold text-2xl">Logged. Nicely done.</p>
            <p className="text-ink-soft text-sm">Your completion ({score ?? 0}%) is recorded for your learning stats.</p>
            <button onClick={onClose} className="btn-ghost" data-cursor="link">Close</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function CourseCard({ course, done, onOpen }) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      onClick={onOpen}
      data-cursor="link"
      className="paper-card p-0 overflow-hidden text-left flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${productById(course.productIds[0]).color}22, #DED7C6)` }}
        >
          <span className="font-display italic font-black text-3xl text-ink/70 text-center px-6 leading-tight">{course.title}</span>
        </div>
        <span className="absolute top-2 left-2 tag bg-chalk/80">{course.level}</span>
        <span className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition bg-ink/40">
          <span className="w-14 h-14 rounded-full bg-marker text-chalk flex items-center justify-center text-xl">▶</span>
        </span>
        {done && <span className="absolute top-2 right-2 tag bg-[#0E8F6E] text-chalk border-transparent">✓ Done</span>}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-1.5">
          <span className="tag">{course.track}</span>
          {course.productIds.slice(0, 3).map((p) => {
            const prod = productById(p)
            return <span key={p} className="tag" style={{ borderColor: prod.color + '66', color: prod.color }}>{prod.name}</span>
          })}
        </div>
        <h3 className="mt-3 font-display italic font-bold text-xl">{course.title}</h3>
        <p className="mt-2 text-sm text-ink-soft line-clamp-2 flex-1">{course.blurb}</p>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-stone">{course.duration} · {course.lessons} lessons</div>
      </div>
    </motion.button>
  )
}

export default function Courses() {
  const { session } = useAuth()
  const email = session?.email
  useStore((s) => s.completions) // re-render on completion changes
  const completions = email ? store.completionsFor(email) : {}

  const [track, setTrack] = useState('All')
  const [product, setProduct] = useState('all-filter')
  const [search, setSearch] = useState('')
  const [active, setActive] = useState(null)

  const filtered = COURSES.filter((c) => {
    if (track !== 'All' && c.track !== track) return false
    if (product !== 'all-filter' && !c.productIds.includes(product)) return false
    if (search && !`${c.title} ${c.blurb}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="pb-10">
      <PageHeader
        kicker="The library"
        title="Courses"
        intro="Pick a track, open the lesson, and lock it in with a short checkpoint quiz. Your completions feed your learning stats."
      />

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone mr-1">Track</span>
          {['All', ...TRACKS].map((t) => (
            <button key={t} onClick={() => setTrack(t)} data-cursor="link" className={`tag ${track === t ? 'bg-ink text-chalk border-ink' : 'hover:border-ink'}`}>{t}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone mr-1">Product</span>
          <button onClick={() => setProduct('all-filter')} data-cursor="link" className={`tag ${product === 'all-filter' ? 'bg-ink text-chalk border-ink' : 'hover:border-ink'}`}>Everything</button>
          {PRODUCTS.map((p) => (
            <button key={p.id} onClick={() => setProduct(p.id)} data-cursor="link" className={`tag ${product === p.id ? 'text-chalk border-transparent' : 'hover:border-ink'}`} style={product === p.id ? { background: p.color } : { borderColor: p.color + '66', color: p.color }}>{p.name}</button>
          ))}
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses…" className="field max-w-sm" />
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-6 mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.04}>
            <CourseCard course={c} done={!!completions[c.id]} onOpen={() => setActive(c)} />
          </Reveal>
        ))}
        {filtered.length === 0 && <p className="text-ink-soft font-hand text-2xl col-span-full text-center py-12">No courses match those filters.</p>}
      </div>

      <AnimatePresence>
        {active && <CheckpointModal course={active} email={email} completed={!!completions[active.id]} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}
