// Posters — a shelf of three books. Pick one and it opens into a page-turning
// reader (Book): the Support Codex (poster spreads), plus the I Belong and Q1
// Programs documents. The Support Codex posters can be sheet-driven; the two
// document books read their rendered pages.
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageHeader from '../components/PageHeader.jsx'
import Book from '../components/Book.jsx'
import { PosterMotif } from '../components/PosterCard.jsx'
import { BOOKS } from '../data/books.js'
import { POSTERS } from '../data/content.js'
import { SOURCES } from '../config/sources.js'
import { useSheet, pick } from '../lib/sheets.js'

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function Lightbox({ poster, onClose }) {
  return (
    <motion.div className="fixed inset-0 z-[200] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative grid md:grid-cols-[1.3fr_1fr] w-full max-w-4xl bg-chalk rounded-[4px] overflow-hidden shadow-hard border border-ink/20 max-h-[90vh]">
        <div className="relative min-h-[40vh] md:min-h-[70vh] bg-ink">
          {poster.img ? <img src={poster.img} alt={poster.title} className="absolute inset-0 w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} /> : <PosterMotif poster={poster} />}
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
      </motion.div>
    </motion.div>
  )
}

function ShelfBook({ book, onOpen, i }) {
  const tilt = [-1.5, 0, 1.5][i % 3]
  return (
    <motion.button
      onClick={() => onOpen(book)}
      data-cursor="link"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08 }}
      whileHover={{ y: -10, rotate: 0 }}
      style={{ rotate: `${tilt}deg` }}
      className="group relative w-full max-w-[240px]"
    >
      <div className="relative aspect-[5/7] rounded-[4px] overflow-hidden border border-ink/25 shadow-[0_26px_50px_-20px_rgba(26,23,18,0.55)]" style={{ background: book.spine || '#15100b' }}>
        <img src={book.cover} alt={book.title} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        {/* spine */}
        <div className="absolute inset-y-0 left-0 w-3" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.55), transparent)' }} />
        {/* fore-edge pages */}
        <div className="absolute inset-y-1 right-0 w-1.5 bg-[repeating-linear-gradient(to_bottom,#efe7d4,#efe7d4_2px,#d9cfb6_2px,#d9cfb6_3px)]" />
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-ink/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="font-mono text-[9px] uppercase tracking-widest text-chalk/80">Open →</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="font-display italic font-bold text-xl tracking-tightest leading-none">{book.title}</div>
        <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-stone">{book.subtitle}</div>
      </div>
    </motion.button>
  )
}

export default function Posters() {
  // Support Codex posters can be sheet-driven; the doc books use rendered pages.
  const { data: sheetPosters } = useSheet(
    SOURCES.posters,
    (r) => {
      const title = pick(r, 'title', 'name')
      if (!title) return null
      return { id: slug(title), title, category: pick(r, 'category', 'topic', 'products') || 'Craft', caption: pick(r, 'description', 'caption', 'desc'), img: pick(r, 'image', 'img', 'thumbnail', 'artwork') }
    },
    POSTERS,
  )

  const books = useMemo(() => BOOKS.map((b) => (b.id === 'support-codex' ? { ...b, posters: sheetPosters } : b)), [sheetPosters])

  const [selected, setSelected] = useState(null)
  const [active, setActive] = useState(null)

  return (
    <div className="pb-16">
      <PageHeader kicker="The library shelf" title="Posters" intro="Pick a book from the shelf. The Support Codex holds the team-room posters; the others are guides you can page through end to end." />

      <div className="mx-auto max-w-5xl px-6">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key="reader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Book book={selected} onClose={() => setSelected(null)} onOpen={setActive} />
            </motion.div>
          ) : (
            <motion.div key="shelf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-12 pt-4">
                {books.map((b, i) => <ShelfBook key={b.id} book={b} i={i} onOpen={setSelected} />)}
              </div>
              {/* shelf ledge */}
              <div className="mx-auto mt-2 max-w-3xl h-3 rounded-[2px] bg-gradient-to-b from-taupe/60 to-taupe/20 shadow-[0_10px_20px_-8px_rgba(26,23,18,0.4)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>{active && <Lightbox poster={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </div>
  )
}
