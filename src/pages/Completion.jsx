// Completion rates — product-wise course completion, read from the Completion
// sheet. Cards group by product; clicking any card opens the full spreadsheet
// for managers (access is handled in Google Sheets). Falls back to a small
// sample so the layout is visible before the sheet is wired.
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../components/PageHeader.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { PRODUCTS, productById, matchProducts } from '../data/taxonomy.js'
import { SOURCES, COMPLETION_SHEET_URL } from '../config/sources.js'
import { useSheet, pick } from '../lib/sheets.js'

const SAMPLE = [
  { course: 'Freshdesk Product Training', product: 'Freshdesk', rate: 72 },
  { course: 'Freshdesk Omni', product: 'Freshdesk', rate: 55 },
  { course: 'Freshchat Product Training', product: 'Freshchat', rate: 64 },
  { course: 'Service Health Monitoring', product: 'Freshservice', rate: 48 },
  { course: 'AI Agent Studio EX', product: 'Freshservice', rate: 39 },
  { course: 'Meeting Etiquettes', product: 'All products', rate: 88 },
  { course: 'Guidelines for AI usage', product: 'All products', rate: 81 },
]

const clampRate = (v) => {
  const n = Number(String(v).replace(/[^0-9.]/g, ''))
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}
const rateColor = (r) => (r >= 75 ? '#0E8F6E' : r >= 50 ? '#B45309' : '#E0382B')

function Card({ row }) {
  const color = productById(matchProducts(row.product)[0]).color
  const clickable = Boolean(COMPLETION_SHEET_URL)
  const inner = (
    <div className="paper-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <span className="tag" style={{ borderColor: color + '66', color }}>{row.product}</span>
        {clickable && <span className="font-mono text-[9px] uppercase tracking-widest text-stone group-hover:text-marker">Open sheet ↗</span>}
      </div>
      <h3 className="mt-3 font-display italic font-bold text-xl leading-tight flex-1">{row.course}</h3>
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone">Completion</span>
          <span className="font-display italic font-black text-3xl tracking-tightest" style={{ color: rateColor(row.rate) }}>{row.rate}%</span>
        </div>
        <div className="h-2.5 bg-paper-deep mt-1 rounded-[2px] overflow-hidden">
          <motion.div className="h-full rounded-[2px]" style={{ background: rateColor(row.rate) }} initial={{ width: 0 }} whileInView={{ width: `${row.rate}%` }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }} />
        </div>
      </div>
    </div>
  )
  if (!clickable) return inner
  return <a href={COMPLETION_SHEET_URL} target="_blank" rel="noopener noreferrer" data-cursor="link" className="group block">{inner}</a>
}

export default function Completion() {
  const { data: rows, source } = useSheet(
    SOURCES.completion,
    (r) => {
      const course = pick(r, 'course', 'course name', 'title', 'name')
      if (!course) return null
      return { course, product: pick(r, 'product', 'products') || 'All products', rate: clampRate(pick(r, 'rate', 'completion', 'completion rate', '%')) }
    },
    SAMPLE,
  )

  const groups = useMemo(() => {
    const order = PRODUCTS.map((p) => p.name)
    const map = new Map()
    for (const r of rows) { if (!map.has(r.product)) map.set(r.product, []); map.get(r.product).push(r) }
    return [...map.entries()].sort((a, b) => {
      const ia = order.indexOf(a[0]); const ib = order.indexOf(b[0])
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    })
  }, [rows])

  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r.rate, 0) / rows.length) : 0

  return (
    <div className="pb-16">
      <PageHeader kicker="How we're doing" title="Completion" intro="Product-wise course completion across the team. Click any card to open the full sheet for the details.">
        {COMPLETION_SHEET_URL && (
          <a href={COMPLETION_SHEET_URL} target="_blank" rel="noopener noreferrer" className="btn-ink mt-6" data-cursor="link">↗ Open the completion sheet</a>
        )}
      </PageHeader>

      {/* KPI */}
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
        <Reveal>
          <div className="border-t-2 border-ink pt-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-stone">Overall</div>
            <div className="font-display italic font-black text-5xl tracking-tightest leading-none mt-1" style={{ color: rateColor(avg) }}>{avg}%</div>
            <div className="mt-1 text-sm text-ink-soft">Average completion</div>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="border-t-2 border-ink pt-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-stone">Tracked</div>
            <div className="font-display italic font-black text-5xl tracking-tightest leading-none mt-1">{rows.length}</div>
            <div className="mt-1 text-sm text-ink-soft">Courses measured</div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="border-t-2 border-ink pt-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-stone">Products</div>
            <div className="font-display italic font-black text-5xl tracking-tightest leading-none mt-1">{groups.length}</div>
            <div className="mt-1 text-sm text-ink-soft">Product lines</div>
          </div>
        </Reveal>
      </div>

      {source === 'fallback' && (
        <div className="mx-auto max-w-7xl px-6 mt-8">
          <p className="font-hand text-xl text-ink-soft">Showing sample figures — connect the completion sheet (and set its link) to go live.</p>
        </div>
      )}

      {groups.map(([prod, list]) => (
        <div key={prod} className="mx-auto max-w-7xl px-6 mt-12">
          <div className="flex items-baseline gap-3 border-b border-ink/15 pb-2">
            <h3 className="font-display italic font-black text-2xl tracking-tightest">{prod}</h3>
            <span className="font-mono text-[10px] uppercase tracking-widest text-stone">{list.length} course{list.length === 1 ? '' : 's'}</span>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r, i) => <Reveal key={r.course + i} delay={(i % 6) * 0.04}><Card row={r} /></Reveal>)}
          </div>
        </div>
      ))}
    </div>
  )
}
