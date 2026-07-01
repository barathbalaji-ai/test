// Posters — a lazy-susan carousel you spin through, plus a lightbox. Content
// comes from the Posters sheet when configured, otherwise the bundled seed
// (which points at artwork in public/posters/).
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageHeader from '../components/PageHeader.jsx'
import PosterCarousel from '../components/PosterCarousel.jsx'
import { PosterMotif } from '../components/PosterCard.jsx'
import { POSTERS } from '../data/content.js'
import { SOURCES } from '../config/sources.js'
import { useSheet, pick } from '../lib/sheets.js'

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function Lightbox({ poster, onClose }) {
  const isGuide = Boolean(poster.guide)
  return (
    <motion.div className="fixed inset-0 z-[200] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className={`relative bg-chalk rounded-[4px] overflow-hidden shadow-hard border border-ink/20 ${isGuide ? 'w-full max-w-5xl h-[90vh] flex flex-col' : 'grid md:grid-cols-[1.3fr_1fr] w-full max-w-4xl max-h-[90vh]'}`}
      >
        {isGuide ? (
          <>
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-ink/15">
              <div>
                <div className="eyebrow">{poster.category}</div>
                <h2 className="font-display italic font-bold text-xl tracking-tightest leading-tight">{poster.title}</h2>
              </div>
              <div className="flex items-center gap-4">
                <a href={poster.guide} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] uppercase tracking-widest text-ink-soft hover:text-marker" data-cursor="link">Open ↗</a>
                <a href={poster.guide} download className="font-mono text-[10px] uppercase tracking-widest text-ink-soft hover:text-marker" data-cursor="link">Download</a>
                <button onClick={onClose} className="text-ink-soft hover:text-marker" data-cursor="link">✕</button>
              </div>
            </div>
            <iframe src={poster.guide} title={poster.title} className="flex-1 w-full bg-ink/5" />
          </>
        ) : (
          <>
            <div className="relative min-h-[40vh] md:min-h-[70vh] bg-ink">
              {poster.img
                ? <img src={poster.img} alt={poster.title} className="absolute inset-0 w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                : <PosterMotif poster={poster} />}
            </div>
            <div className="p-7 flex flex-col">
              <button onClick={onClose} className="self-end text-ink-soft hover:text-marker" data-cursor="link">✕</button>
              <div className="eyebrow mt-2">{poster.category}</div>
              <h2 className="mt-1 font-display italic font-bold text-3xl tracking-tightest">{poster.title}</h2>
              <p className="mt-3 text-ink-soft">{poster.caption}</p>
              <div className="mt-auto flex gap-3 pt-6">
                {poster.img && <a href={poster.img} download className="btn-ink" data-cursor="link">↓ Download</a>}
                <button onClick={() => window.print()} className="btn-ghost" data-cursor="link">Print</button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function Posters() {
  const { data: posters } = useSheet(
    SOURCES.posters,
    (r) => {
      const title = pick(r, 'title', 'name')
      if (!title) return null
      return {
        id: slug(title),
        title,
        category: pick(r, 'category', 'topic', 'products') || 'Craft',
        caption: pick(r, 'description', 'caption', 'desc'),
        img: pick(r, 'image', 'img', 'thumbnail', 'artwork'),
        guide: pick(r, 'guide', 'pdf'),
      }
    },
    POSTERS,
  )

  const cats = useMemo(() => ['All', ...new Set(posters.map((p) => p.category).filter(Boolean))], [posters])
  const [cat, setCat] = useState('All')
  const [active, setActive] = useState(null)
  const list = posters.filter((p) => cat === 'All' || p.category === cat)

  return (
    <div className="pb-16">
      <PageHeader kicker="The wall" title="Posters" intro="Spin the turntable to browse print-ready reminders for the team room. Click the front poster to enlarge — or open a full guide." />

      <div className="mx-auto max-w-7xl px-6 flex flex-wrap gap-2 justify-center">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} data-cursor="link" className={`tag ${cat === c ? 'bg-ink text-chalk border-ink' : 'hover:border-ink'}`}>{c}</button>
        ))}
      </div>

      <div className="mx-auto max-w-5xl px-6 mt-10">
        <PosterCarousel key={cat} posters={list} onOpen={setActive} />
      </div>

      <AnimatePresence>{active && <Lightbox poster={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </div>
  )
}
