// Articles: a dynamic "this month" lead built from the latest release data,
// then a big, inviting archive callout that opens a single-month timeline
// scroller (with a focus-hunt blip) to step back through earlier months.
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageHeader from '../components/PageHeader.jsx'
import { Reveal } from '../components/Reveal.jsx'
import ArticleCard from '../components/ArticleCard.jsx'
import Timeline from '../components/Timeline.jsx'
import { ARTICLES, MONTHS, PRODUCTS } from '../data/articles.js'
import { useWinding } from '../lib/winding.js'

const LATEST = MONTHS.length - 1
const byDateDesc = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)

// The lead story is generated from whatever shipped in the most recent month.
function Lead({ latest }) {
  const items = ARTICLES.filter((a) => a.month === MONTHS[latest].key).sort(byDateDesc)
  const products = [...new Set(items.map((i) => i.product))]
  const feature = items.slice(0, 3)
  return (
    <Reveal>
      <section className="mx-auto max-w-7xl px-6">
        <div className="section-dark rounded-[4px] p-8 sm:p-12 relative overflow-hidden">
          <div className="eyebrow text-marker">{MONTHS[latest].label} · what shipped this month</div>
          <h2 className="mt-3 font-display italic font-black text-4xl sm:text-5xl tracking-tightest text-chalk max-w-2xl">The latest release notes</h2>
          <p className="mt-4 text-chalk/70 max-w-2xl text-lg">
            {items.length} update{items.length === 1 ? '' : 's'} across {products.join(', ')} — each card opens the real support article.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {feature.map((it) => (
              <li key={it.id} className="border-t border-chalk/20 pt-3">
                <div className="font-mono text-[9px] uppercase tracking-widest text-chalk/40">{it.product}</div>
                <div className="mt-1 font-display italic font-bold text-xl text-chalk leading-tight">{it.name}</div>
                {it.excerpt && <p className="mt-1 text-sm text-chalk/60 line-clamp-2">{it.excerpt}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Reveal>
  )
}

function Grid({ list }) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((a, i) => (
        <Reveal key={a.id} delay={(i % 6) * 0.04}>
          <ArticleCard article={a} />
        </Reveal>
      ))}
    </div>
  )
}

export default function Articles() {
  const [expanded, setExpanded] = useState(false)
  const [index, setIndex] = useState(LATEST)
  const [product, setProduct] = useState('All')
  const [muted, setMuted] = useState(false)
  const { tick, setMuted: setSoundMuted } = useWinding()

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    setSoundMuted(next)
  }

  const openArchive = () => {
    setExpanded(true)
    setIndex(Math.max(0, LATEST - 1)) // jump straight to older content
    if (!muted) tick()
  }
  const closeArchive = () => {
    setExpanded(false)
    setIndex(LATEST)
  }

  const shownKey = expanded ? MONTHS[index].key : MONTHS[LATEST].key
  const shownLabel = expanded ? MONTHS[index].label : MONTHS[LATEST].label
  const list = useMemo(
    () => ARTICLES.filter((a) => a.month === shownKey && (product === 'All' || a.product === product)).sort(byDateDesc),
    [shownKey, product]
  )

  const olderCount = ARTICLES.filter((a) => a.month !== MONTHS[LATEST].key).length
  const span = `${MONTHS[0].label} – ${MONTHS[LATEST].label}`

  return (
    <div className="pb-12">
      <PageHeader kicker="The reading room" title="Articles" intro="Start with what shipped this month, then wind back through the archive — each folder opens the real support article." />
      <Lead latest={LATEST} />

      {/* Product filter */}
      <div className="mx-auto max-w-7xl px-6 mt-10 flex flex-wrap items-center gap-2">
        {['All', ...PRODUCTS].map((p) => (
          <button key={p} onClick={() => setProduct(p)} data-cursor="link" className={`tag ${product === p ? 'bg-ink text-chalk border-ink' : 'hover:border-ink'}`}>{p}</button>
        ))}
      </div>

      {/* Archive timeline (only when opened) sits directly above the grid it drives */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mx-auto max-w-7xl px-6 mt-8">
              <div className="bg-paper border-2 border-ink rounded-[4px] shadow-hard p-6 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                  <span className="eyebrow text-oxblood">The archive · {span}</span>
                  <div className="flex items-center gap-4">
                    <button onClick={toggleMute} data-cursor="link" className="font-mono text-[10px] uppercase tracking-widest text-stone hover:text-ink" aria-pressed={muted}>
                      {muted ? '🔇 sound off' : '🔊 sound on'}
                    </button>
                    <button onClick={closeArchive} data-cursor="link" className="font-mono text-[10px] uppercase tracking-widest text-stone hover:text-ink">
                      ✕ back to this month
                    </button>
                  </div>
                </div>
                <Timeline months={MONTHS} index={index} onChange={setIndex} onStep={() => !muted && tick()} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected (or latest) month heading + grid */}
      <div className="mx-auto max-w-7xl px-6 mt-8">
        <div className="flex items-baseline gap-3 border-b border-ink/15 pb-2">
          <h3 className="font-display italic font-black text-3xl tracking-tightest">{shownLabel}</h3>
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone">{list.length} update{list.length === 1 ? '' : 's'}</span>
        </div>
        {list.length === 0
          ? <p className="mt-6 font-hand text-2xl text-ink-soft">Nothing for this product in {shownLabel} — try another month or product.</p>
          : <Grid list={list} />}
      </div>

      {/* Big, inviting callout to open the archive (only when closed) */}
      <AnimatePresence initial={false}>
        {!expanded && (
          <motion.div
            key="callout"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-7xl px-6 mt-14"
          >
            <motion.button
              onClick={openArchive}
              data-cursor="link"
              whileHover={{ x: 4 }}
              className="group w-full text-left bg-paper border-2 border-ink rounded-[4px] shadow-hard p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center gap-5"
            >
              <span className="text-5xl sm:text-6xl leading-none" aria-hidden>🎞️</span>
              <span className="flex-1">
                <span className="block eyebrow text-oxblood">The archive · {span}</span>
                <span className="block mt-1 font-display italic font-black text-3xl sm:text-4xl tracking-tightest text-ink">Wind back through earlier releases</span>
                <span className="block mt-1 text-ink-soft">{olderCount} more articles waiting in {MONTHS.length - 1} earlier months.</span>
              </span>
              <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-ink group-hover:text-marker flex items-center gap-2">
                Open the timeline
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>▸</motion.span>
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
