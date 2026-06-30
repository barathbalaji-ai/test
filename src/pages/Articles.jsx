// Articles: a dynamic "this month" lead built from the latest release data,
// then an expandable archive driven by a film-reel timeline range-scroller
// (with winding ambience) and an optional product filter.
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
                <p className="mt-1 text-sm text-chalk/60 line-clamp-2">{it.excerpt}</p>
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
  const [range, setRange] = useState({ from: LATEST, to: LATEST })
  const [product, setProduct] = useState('All')
  const [muted, setMuted] = useState(false)
  const { wind, setMuted: setSoundMuted } = useWinding()

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    setSoundMuted(next)
  }

  // Latest-month-only view vs. ranged archive view.
  const inRange = (m) => {
    const i = MONTHS.findIndex((x) => x.key === m)
    return expanded ? i >= range.from && i <= range.to : i === LATEST
  }
  const filtered = useMemo(
    () => ARTICLES.filter((a) => inRange(a.month) && (product === 'All' || a.product === product)),
    [expanded, range, product]
  )

  // Group by month, newest month first.
  const groups = useMemo(() => {
    const map = new Map()
    for (const a of filtered) {
      if (!map.has(a.month)) map.set(a.month, [])
      map.get(a.month).push(a)
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, items]) => ({
        key,
        label: MONTHS.find((m) => m.key === key)?.label || key,
        items: items.sort(byDateDesc),
      }))
  }, [filtered])

  return (
    <div className="pb-12">
      <PageHeader kicker="The reading room" title="Articles" intro="Start with what shipped this month, then wind back through the archive — each folder opens the real support article." />
      <Lead latest={LATEST} />

      {/* Product filter */}
      <div className="mx-auto max-w-7xl px-6 mt-10 flex flex-wrap items-center gap-2">
        {['All', ...PRODUCTS].map((p) => (
          <button key={p} onClick={() => setProduct(p)} data-cursor="link" className={`tag ${product === p ? 'bg-ink text-chalk border-ink' : 'hover:border-ink'}`}>{p}</button>
        ))}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-stone">{filtered.length} article{filtered.length === 1 ? '' : 's'}</span>
      </div>

      {/* Archive expander + timeline */}
      <div className="mx-auto max-w-7xl px-6 mt-6">
        <div className="flex items-center justify-between gap-4 border-t-2 border-ink pt-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            data-cursor="link"
            className="font-mono text-[11px] uppercase tracking-widest text-ink hover:text-marker flex items-center gap-2"
          >
            <motion.span animate={{ rotate: expanded ? 90 : 0 }} className="inline-block">▸</motion.span>
            {expanded ? 'Showing the archive' : 'Open the archive — browse older months'}
          </button>
          {expanded && (
            <button
              onClick={toggleMute}
              data-cursor="link"
              className="font-mono text-[10px] uppercase tracking-widest text-stone hover:text-ink flex items-center gap-1.5"
              aria-pressed={muted}
            >
              {muted ? '🔇 reel muted' : '🔊 reel sound'}
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-6">
                <Timeline
                  months={MONTHS}
                  from={range.from}
                  to={range.to}
                  onChange={setRange}
                  onWind={(v) => !muted && wind(v)}
                  onWindStop={() => {}}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Article groups */}
      <div className="mx-auto max-w-7xl px-6 mt-8">
        {groups.length === 0 && (
          <p className="font-hand text-2xl text-ink-soft">Nothing in this range — widen the reel or pick another product.</p>
        )}
        {groups.map((g) => (
          <section key={g.key} className="mt-10 first:mt-0">
            <div className="flex items-baseline gap-3 border-b border-ink/15 pb-2">
              <h3 className="font-display italic font-black text-2xl tracking-tightest">{g.label}</h3>
              <span className="font-mono text-[10px] uppercase tracking-widest text-stone">{g.items.length} update{g.items.length === 1 ? '' : 's'}</span>
            </div>
            <Grid list={g.items} />
          </section>
        ))}
      </div>
    </div>
  )
}
