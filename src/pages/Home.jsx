// Home — editorial hero with the stipple brain, a "rooms" grid, featured
// courses, a philosophy block, and poster of the week.
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import StippleBrain from '../components/StippleBrain.jsx'
import { Circle, Underline, Squiggle } from '../components/HandDrawn.jsx'
import { Reveal, RevealWords } from '../components/Reveal.jsx'
import Highlight from '../components/Highlight.jsx'
import { VIDEOS } from '../data/videos.js'
import { productById } from '../data/taxonomy.js'
import { POSTERS } from '../data/content.js'

const ROOMS = [
  { to: '/videos', label: 'Courses', glyph: '▶', accent: '#1F6FEB', blurb: 'A filterable library of course videos on Mindtickle.' },
  { to: '/posters', label: 'Posters', glyph: '❖', accent: '#0E8F6E', blurb: 'A lazy-susan wall of print-ready posters.' },
  { to: '/articles', label: 'Articles', glyph: '✎', accent: '#8E2A20', blurb: "This month's launches + a windable release archive." },
  { to: '/calendar', label: 'Calendar', glyph: '✦', accent: '#7A3FF2', blurb: 'In-person training, filterable by product & type.' },
  { to: '/completion', label: 'Completion', glyph: '▥', accent: '#B45309', blurb: 'Product-wise course completion at a glance.' },
]

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-12 pb-16 min-h-[78vh]">
      <div className="absolute -top-6 bottom-0 -right-[6%] w-[62%] hidden lg:block pointer-events-none">
        <StippleBrain />
      </div>

      <div className="relative z-10 max-w-2xl">
        <div className="flex flex-wrap gap-2">
          <span className="tag">Customer Support · Learning Portal</span>
          <span className="tag border-marker/40 text-marker">New launches are live</span>
        </div>

        <h1 className="mt-6 font-display font-black tracking-tightest leading-[0.9] text-6xl sm:text-7xl lg:text-8xl">
          <span className="relative inline-block">Relearn.<Underline className="absolute -bottom-2 left-0 w-full h-5" /></span>
          <br />
          <span className="relative inline-block italic">Repeat.<Circle className="absolute -inset-x-6 -inset-y-3 w-[125%] h-[150%] -z-0" /></span>
          <br />
          <span className="relative inline-block">Resolve.<Squiggle className="absolute -bottom-3 left-0 w-full h-4" /></span>
        </h1>

        <Reveal delay={0.2}>
          <p className="mt-7 text-lg text-ink-soft leading-relaxed max-w-xl">
            The learning home for Customer Support. Master the craft through a library of
            course videos, a wall of posters, in-person training and this month's product
            launches — all in one atmospheric studio.
          </p>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/videos" className="btn-ink" data-cursor="link">Browse the library</Link>
          <Link to="/calendar" className="btn-ghost" data-cursor="link">See live training</Link>
        </div>
      </div>
    </section>
  )
}

function Rooms() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="font-display italic font-bold text-3xl sm:text-4xl tracking-tightest">
          <RevealWords text="Five rooms, one handbook" />
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-stone hidden sm:block">Fig. 01 — the map</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROOMS.map((r, i) => (
          <Reveal key={r.to} delay={i * 0.05}>
            <Link to={r.to} data-cursor="link">
              <motion.div whileHover={{ rotate: -1 }} className="paper-card p-6 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-2xl" style={{ color: r.accent }}>{r.glyph}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-stone">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display italic font-bold text-2xl">{r.label}</h3>
                <p className="mt-2 text-sm text-ink-soft">{r.blurb}</p>
                <span className="mt-4 inline-block font-mono text-[10px] uppercase tracking-widest text-marker">Enter →</span>
              </motion.div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Featured() {
  const three = VIDEOS.slice(0, 3)
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="font-display italic font-bold text-3xl sm:text-4xl tracking-tightest mb-6">
        <RevealWords text="Featured courses" />
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {three.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.06}>
            <Link to="/videos" className="paper-card p-5 block h-full" data-cursor="link">
              <div className="flex flex-wrap gap-1.5">
                {c.productIds.slice(0, 2).map((p) => {
                  const prod = productById(p)
                  return <span key={p} className="tag" style={{ borderColor: prod.color + '66', color: prod.color }}>{prod.name}</span>
                })}
              </div>
              <h3 className="mt-3 font-display italic font-bold text-xl">{c.title}</h3>
              <p className="mt-2 text-sm text-ink-soft line-clamp-3">{c.blurb}</p>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-marker">Watch ↗</div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Philosophy() {
  return (
    <section className="section-dark my-16">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="eyebrow text-marker">Philosophy</div>
        <p className="mt-5 font-display italic font-medium text-3xl sm:text-4xl leading-snug tracking-tightest text-chalk">
          Great support is a craft. We learn it the way you learn anything that matters —
          by <Highlight>doing it</Highlight>, reflecting, and{' '}
          <span className="text-marker">doing it again</span>.
        </p>
        <p className="mt-6 font-hand text-2xl text-chalk/70">— the Carta way</p>
      </div>
    </section>
  )
}

function PosterOfWeek() {
  const poster = POSTERS[1] || POSTERS[0]
  if (!poster) return null
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 items-center">
        <Reveal>
          <div>
            <div className="eyebrow">Poster of the week</div>
            <h2 className="mt-3 font-display italic font-bold text-4xl tracking-tightest">{poster.title}</h2>
            <p className="mt-3 text-ink-soft">{poster.caption}</p>
            <Link to="/posters" className="mt-5 inline-block btn-ghost" data-cursor="link">Spin the wall →</Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Link to="/posters" data-cursor="link" className="block">
            <div className="paper-card aspect-[4/5] overflow-hidden relative rotate-[-1.5deg]">
              {poster.img
                ? <img src={poster.img} alt={poster.title} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                : <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'radial-gradient(circle at 40% 30%, #DED7C6, #C7BCA6)' }}><span className="font-display italic font-black text-5xl text-ink/80 text-center px-8 leading-tight">{poster.title}</span></div>}
              <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 80px rgba(26,23,18,0.3)' }} />
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div>
      <Hero />
      <Rooms />
      <Featured />
      <Philosophy />
      <PosterOfWeek />
    </div>
  )
}
