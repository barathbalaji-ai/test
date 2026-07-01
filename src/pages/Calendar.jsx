// Live training calendar: month grid + agenda + product/type filters. Sessions
// come from the Calendar sheet when configured, otherwise the bundled seed.
import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import { SEED_EVENTS, SESSION_TYPES, sessionTypeColor } from '../data/content.js'
import { PRODUCTS, matchProducts } from '../data/taxonomy.js'
import { SOURCES } from '../config/sources.js'
import { useSheet, pick } from '../lib/sheets.js'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

function normDate(v) {
  const s = (v || '').trim()
  if (!s) return ''
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  m = s.match(/^(\d{1,2})[/](\d{1,2})[/](\d{4})/) // M/D/YYYY (Sheets default)
  if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return ''
}

function eventDates(ev) {
  const out = [ev.date]
  if (ev.endDate && ev.endDate !== ev.date) {
    let d = new Date(ev.date + 'T00:00:00')
    const end = new Date(ev.endDate + 'T00:00:00')
    while (d < end) { d = new Date(d.getTime() + 86400000); out.push(d.toISOString().slice(0, 10)) }
  }
  return out
}

function EventDetail({ ev }) {
  return (
    <div className="border-l-2 pl-4 py-1" style={{ borderColor: sessionTypeColor(ev.type) }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display italic font-bold text-lg leading-tight">{ev.name}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-stone mt-0.5">{ev.type}</div>
        </div>
        {ev.duration && <span className="tag" style={{ borderColor: sessionTypeColor(ev.type) + '66', color: sessionTypeColor(ev.type) }}>{ev.duration}</span>}
      </div>
      {ev.desc && <p className="mt-1.5 text-sm text-ink-soft">{ev.desc}</p>}
      <dl className="mt-2 text-sm text-ink-soft space-y-0.5">
        <div>{ev.date}{ev.endDate ? ` – ${ev.endDate}` : ''}{ev.time ? ` · ${ev.time}` : ''}</div>
        <div>{ev.location}{ev.room ? ` · Room ${ev.room}` : ''}</div>
        {ev.trainer && <div>Trainer: {ev.trainer}</div>}
        {ev.seats ? <div>{ev.seats} seats</div> : null}
      </dl>
    </div>
  )
}

export default function Calendar() {
  const { data: events } = useSheet(
    SOURCES.calendar,
    (r, i) => {
      const name = pick(r, 'session', 'session name', 'name', 'title')
      const date = normDate(pick(r, 'date'))
      if (!name || !date) return null
      return {
        id: `evt-${i}-${date}`,
        name,
        short: name.split(' ')[0],
        date,
        endDate: normDate(pick(r, 'enddate', 'end date')) || undefined,
        time: pick(r, 'time'),
        trainer: pick(r, 'trainer'),
        productIds: matchProducts(pick(r, 'products', 'product')),
        room: pick(r, 'room'),
        location: pick(r, 'location') || 'Chennai',
        type: pick(r, 'type') || 'New product',
        desc: pick(r, 'description', 'desc'),
        seats: Number(pick(r, 'seats')) || 0,
      }
    },
    SEED_EVENTS,
  )

  // Default the grid to the month of the earliest session.
  const first = useMemo(() => {
    const sorted = [...events].filter((e) => e.date).sort((a, b) => a.date.localeCompare(b.date))
    return sorted[0]?.date ? new Date(sorted[0].date + 'T00:00:00') : new Date(2026, 5, 1)
  }, [events])

  const [year, setYear] = useState(first.getFullYear())
  const [month, setMonth] = useState(first.getMonth())
  const [selected, setSelected] = useState(null)
  const [product, setProduct] = useState('all-filter')
  const [type, setType] = useState('All')

  const visible = events.filter((e) => {
    if (product !== 'all-filter' && !e.productIds?.includes(product) && !e.productIds?.includes('all')) return false
    if (type !== 'All' && e.type !== type) return false
    return true
  })

  const byDate = useMemo(() => {
    const m = {}
    for (const ev of visible) for (const d of eventDates(ev)) (m[d] ||= []).push(ev)
    return m
  }, [visible])

  const startFirst = new Date(year, month, 1)
  const startDow = (startFirst.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const upcoming = [...visible].sort((a, b) => a.date.localeCompare(b.date))
  const selectedEvents = selected ? byDate[selected] || [] : []
  const prev = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1) }

  return (
    <div className="pb-10">
      <PageHeader kicker="Live training" title="Calendar" intro="In-person sessions, workshops and clinics. Filter by product or session type, and pick a day to see what's on." />

      <div className="mx-auto max-w-7xl px-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone mr-1">Product</span>
          <button onClick={() => setProduct('all-filter')} className={`tag ${product === 'all-filter' ? 'bg-ink text-chalk border-ink' : 'hover:border-ink'}`} data-cursor="link">All</button>
          {PRODUCTS.filter((p) => p.id !== 'all').map((p) => <button key={p.id} onClick={() => setProduct(p.id)} className={`tag ${product === p.id ? 'text-chalk border-transparent' : 'hover:border-ink'}`} style={product === p.id ? { background: p.color } : { borderColor: p.color + '66', color: p.color }} data-cursor="link">{p.name}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone mr-1">Type</span>
          <button onClick={() => setType('All')} className={`tag ${type === 'All' ? 'bg-ink text-chalk border-ink' : 'hover:border-ink'}`} data-cursor="link">All</button>
          {SESSION_TYPES.map((t) => <button key={t.id} onClick={() => setType(t.id)} className={`tag ${type === t.id ? 'text-chalk border-transparent' : 'hover:border-ink'}`} style={type === t.id ? { background: t.color } : { borderColor: t.color + '66', color: t.color }} data-cursor="link">{t.label}</button>)}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-8 grid lg:grid-cols-[1.6fr_1fr] gap-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <button onClick={prev} className="tag hover:border-ink" data-cursor="link">←</button>
            <h2 className="font-display italic font-bold text-2xl tracking-tightest">{MONTHS[month]} {year}</h2>
            <button onClick={next} className="tag hover:border-ink" data-cursor="link">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {DOW.map((d) => <div key={d} className="font-mono text-[9px] uppercase tracking-widest text-stone text-center py-1">{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const ds = iso(year, month, day)
              const evs = byDate[ds] || []
              const has = evs.length > 0
              return (
                <button key={i} onClick={() => setSelected(ds)} data-cursor="link" className={`min-h-[68px] rounded-[3px] border p-1 text-left transition ${selected === ds ? 'border-ink ring-1 ring-ink' : 'border-ink/15'} ${has ? 'bg-marker/10 hover:bg-marker/15' : 'bg-chalk/40 hover:bg-chalk'}`}>
                  <div className="font-mono text-[10px] text-ink-soft">{day}</div>
                  {evs.slice(0, 1).map((ev) => <div key={ev.id} className="font-hand text-[15px] leading-tight text-ink truncate">{ev.short || ev.name}</div>)}
                  <div className="flex gap-0.5 mt-0.5">{evs.slice(0, 3).map((ev, k) => <span key={k} className="w-1.5 h-1.5 rounded-full" style={{ background: sessionTypeColor(ev.type) }} />)}</div>
                  {evs.length > 1 && <div className="font-mono text-[8px] text-stone">+{evs.length - 1}</div>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          {selected && (
            <div className="paper-card p-5">
              <div className="eyebrow">{selected}</div>
              <h3 className="font-display italic font-bold text-xl mt-1 mb-3">On this day</h3>
              {selectedEvents.length ? <div className="space-y-4">{selectedEvents.map((ev) => <EventDetail key={ev.id} ev={ev} />)}</div> : <p className="text-ink-soft text-sm font-hand text-lg">Nothing scheduled.</p>}
            </div>
          )}
          <div className="paper-card p-5">
            <h3 className="font-display italic font-bold text-xl mb-3">Upcoming</h3>
            <div className="space-y-4">
              {upcoming.map((ev) => <EventDetail key={ev.id} ev={ev} />)}
              {!upcoming.length && <p className="text-ink-soft text-sm">No sessions match those filters.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
