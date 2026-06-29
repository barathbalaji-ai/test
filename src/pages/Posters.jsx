// Poster wall + lightbox.
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageHeader from '../components/PageHeader.jsx'
import { Reveal } from '../components/Reveal.jsx'
import PosterCard, { PosterMotif } from '../components/PosterCard.jsx'
import { POSTERS, POSTER_CATEGORIES } from '../data/content.js'

function Lightbox({ poster, onClose }) {
  return (
    <motion.div className="fixed inset-0 z-[200] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative grid md:grid-cols-[1.3fr_1fr] gap-0 w-full max-w-4xl bg-chalk rounded-[4px] overflow-hidden shadow-hard border border-ink/20 max-h-[90vh]"
      >
        <div className="relative min-h-[40vh] md:min-h-[70vh] bg-ink">
          {poster.img ? (
            <img src={poster.img} alt={poster.title} className="absolute inset-0 w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          ) : null}
          {!poster.img && <PosterMotif poster={poster} />}
        </div>
        <div className="p-7 flex flex-col">
          <button onClick={onClose} className="self-end text-ink-soft hover:text-marker" data-cursor="link">✕</button>
          <div className="eyebrow mt-2">{poster.category}</div>
          <h2 className="mt-1 font-display italic font-bold text-3xl tracking-tightest">{poster.title}</h2>
          <p className="mt-3 text-ink-soft">{poster.caption}</p>
          <div className="mt-auto flex gap-3 pt-6">
            <a href={poster.img || '#'} download className="btn-ink" data-cursor="link">↓ Download</a>
            <button onClick={() => window.print()} className="btn-ghost" data-cursor="link">Print</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Posters() {
  const [cat, setCat] = useState('All')
  const [active, setActive] = useState(null)
  const list = POSTERS.filter((p) => cat === 'All' || p.category === cat)

  return (
    <div className="pb-10">
      <PageHeader kicker="The wall" title="Posters" intro="Print-ready reminders for the team room. Click any poster to enlarge, download or print." />
      <div className="mx-auto max-w-7xl px-6 flex flex-wrap gap-2">
        {POSTER_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} data-cursor="link" className={`tag ${cat === c ? 'bg-ink text-chalk border-ink' : 'hover:border-ink'}`}>{c}</button>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-6 mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05}>
            <PosterCard poster={p} onOpen={setActive} />
          </Reveal>
        ))}
      </div>
      <AnimatePresence>{active && <Lightbox poster={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </div>
  )
}
