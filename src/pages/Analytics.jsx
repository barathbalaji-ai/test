// Analytics (tutor only) — Swiss/editorial dashboard.
import PageHeader from '../components/PageHeader.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { useStore } from '../lib/store.js'
import { COURSES } from '../data/courses.js'

const TYPE_LABEL = { form: 'Form', quiz: 'Quiz', tree: 'Tree' }

function Kpi({ label, value, fig }) {
  return (
    <div className="border-t-2 border-ink pt-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-stone">{fig}</div>
      <div className="font-display italic font-black text-5xl tracking-tightest leading-none mt-1">{value}</div>
      <div className="mt-1 text-sm text-ink-soft">{label}</div>
    </div>
  )
}

export default function Analytics() {
  const completions = useStore((s) => s.completions)
  const responses = useStore((s) => s.responses)
  const forms = useStore((s) => s.forms)
  const users = useStore((s) => s.users) || []
  const learners = users.filter((u) => u.role === 'learner')

  // Flatten completions: [{email, courseId, score}]
  const allCompletions = []
  for (const [email, courses] of Object.entries(completions || {})) {
    for (const [courseId, rec] of Object.entries(courses)) allCompletions.push({ email, courseId, score: rec.score })
  }

  const avgScore = allCompletions.length ? Math.round(allCompletions.reduce((a, c) => a + (c.score || 0), 0) / allCompletions.length) : 0
  const totalResponses = Object.values(responses || {}).reduce((a, arr) => a + arr.length, 0)

  // Completions by course
  const byCourse = COURSES.map((c) => ({ course: c, n: allCompletions.filter((x) => x.courseId === c.id).length }))
  const maxByCourse = Math.max(1, ...byCourse.map((x) => x.n))

  // Score distribution buckets
  const buckets = [
    { label: '0–59', lo: 0, hi: 59 },
    { label: '60–69', lo: 60, hi: 69 },
    { label: '70–79', lo: 70, hi: 79 },
    { label: '80–89', lo: 80, hi: 89 },
    { label: '90–100', lo: 90, hi: 100 },
  ].map((b) => ({ ...b, n: allCompletions.filter((c) => c.score >= b.lo && c.score <= b.hi).length }))
  const maxBucket = Math.max(1, ...buckets.map((b) => b.n))

  // Most-active learners
  const activity = {}
  for (const c of allCompletions) activity[c.email] = (activity[c.email] || 0) + 1
  for (const arr of Object.values(responses || {})) for (const r of arr) if (r.by) activity[r.by] = (activity[r.by] || 0) + 1
  const active = Object.entries(activity).sort((a, b) => b[1] - a[1]).slice(0, 6)

  // Surveys & quizzes table
  const formRows = forms.map((f) => {
    const arr = responses[f.id] || []
    const scored = arr.filter((r) => typeof r.score === 'number')
    const avg = scored.length ? Math.round(scored.reduce((a, r) => a + r.score, 0) / scored.length) : null
    const pass = scored.length ? Math.round((scored.filter((r) => r.score >= (f.passPct || 70)).length / scored.length) * 100) : null
    return { f, n: arr.length, avg, pass }
  })

  return (
    <div className="pb-16">
      <PageHeader kicker="Admin dashboard" title="Analytics" intro="Completions, checkpoint scores and survey results — at a glance. Learner stats are driven by checkpoint-quiz completions." />

      {/* KPI row */}
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Reveal><Kpi fig="Fig. 01" value={learners.length} label="Registered learners" /></Reveal>
        <Reveal delay={0.05}><Kpi fig="Fig. 02" value={allCompletions.length} label="Course completions" /></Reveal>
        <Reveal delay={0.1}><Kpi fig="Fig. 03" value={`${avgScore}%`} label="Avg checkpoint score" /></Reveal>
        <Reveal delay={0.15}><Kpi fig="Fig. 04" value={totalResponses} label="Total form responses" /></Reveal>
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-14 grid lg:grid-cols-2 gap-12">
        {/* Completions by course */}
        <Reveal>
          <section>
            <div className="font-mono text-[10px] uppercase tracking-widest text-stone border-t-2 border-ink pt-2">Fig. 05 — Completions by course</div>
            <div className="mt-4 space-y-3">
              {byCourse.map(({ course, n }) => (
                <div key={course.id}>
                  <div className="flex justify-between text-sm"><span>{course.title}</span><span className="font-mono text-xs text-ink-soft">{n}</span></div>
                  <div className="h-3 bg-paper-deep mt-1 rounded-[2px] overflow-hidden">
                    <div className="h-full bg-marker" style={{ width: `${(n / maxByCourse) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Score distribution */}
        <Reveal delay={0.1}>
          <section>
            <div className="font-mono text-[10px] uppercase tracking-widest text-stone border-t-2 border-ink pt-2">Fig. 06 — Score distribution</div>
            <div className="mt-6 flex items-end gap-3 h-44">
              {buckets.map((b) => (
                <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="font-mono text-xs text-ink-soft mb-1">{b.n}</span>
                  <div className="w-full bg-ink rounded-t-[2px]" style={{ height: `${(b.n / maxBucket) * 100}%`, minHeight: b.n ? 4 : 0 }} />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-stone mt-2">{b.label}</span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Surveys & quizzes table */}
        <Reveal>
          <section>
            <div className="font-mono text-[10px] uppercase tracking-widest text-stone border-t-2 border-ink pt-2">Fig. 07 — Surveys & quizzes</div>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[9px] uppercase tracking-widest text-stone border-b border-ink/20">
                  <th className="py-2">Title</th><th>Type</th><th className="text-right">Resp.</th><th className="text-right">Avg</th><th className="text-right">Pass</th>
                </tr>
              </thead>
              <tbody>
                {formRows.map(({ f, n, avg, pass }) => (
                  <tr key={f.id} className="border-b border-ink/10">
                    <td className="py-2 pr-2">{f.title}</td>
                    <td className="text-ink-soft">{TYPE_LABEL[f.type]}</td>
                    <td className="text-right font-mono">{n}</td>
                    <td className="text-right font-mono">{avg != null ? `${avg}%` : '—'}</td>
                    <td className="text-right font-mono">{pass != null ? `${pass}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </Reveal>

        {/* Most-active learners */}
        <Reveal delay={0.1}>
          <section>
            <div className="font-mono text-[10px] uppercase tracking-widest text-stone border-t-2 border-ink pt-2">Fig. 08 — Most-active learners</div>
            <div className="mt-4 space-y-2">
              {active.length === 0 && <p className="text-ink-soft font-hand text-xl">No activity yet — completions will show here.</p>}
              {active.map(([email, n], i) => {
                const u = users.find((x) => x.email === email)
                return (
                  <div key={email} className="flex items-center justify-between border-b border-ink/10 py-2">
                    <span className="flex items-center gap-3">
                      <span className="font-display italic font-black text-2xl text-stone w-7">{i + 1}</span>
                      <span>
                        <span className="block text-sm">{u?.name || email}</span>
                        <span className="block font-mono text-[10px] text-stone">{email}</span>
                      </span>
                    </span>
                    <span className="font-mono text-sm">{n} actions</span>
                  </div>
                )
              })}
            </div>
          </section>
        </Reveal>
      </div>

      {/* Completions detail note */}
      <div className="mx-auto max-w-7xl px-6 mt-12">
        <p className="font-hand text-xl text-ink-soft">
          Psst — every number here updates live as learners finish checkpoint quizzes and submit forms.
        </p>
      </div>
    </div>
  )
}
