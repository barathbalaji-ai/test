// Training calendar: month grid (June 2026 default) + agenda + product/type
// filters. Tutors get a "New session" modal. Events persist in the store.
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageHeader from '../components/PageHeader.jsx'
import { store, useStore } from '../lib/store.js'
import { useAuth } from '../lib/auth.jsx'
import { SEED_EVENTS, SESSION_TYPES, sessionTypeColor } from '../data/content.js'
import { PRODUCTS, productById } from '../data/courses.js'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

// Days an event covers (inclusive of endDate).
function eventDates(ev) {
  const out = [ev.date]
  if (ev.endDate && ev.endDate !== ev.date) {
    let d = new Date(ev.date + 'T00:00:00')
    const end = new Date(ev.endDate + 'T00:00:00')
    while (d < end) {
      d = new Date(d.getTime() + 86400000)
      out.push(d.toISOString().slice(0, 10))
    }
  }
  return out
}

function NewSessionModal({ onClose }) {
  const [f, setF] = useState({
    name: '', date: '2026-06-20', time: '10:30–18:30', duration: '1 day',
    location: 'Chennai', room: '', productIds: ['all'], type: 'New product', trainer: '', seats: 20,
  })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const submit = (e) => {
    e.preventDefault()
    if (!f.name.trim()) return
    store.addEvent({ ...f, short: f.name.split(' ')[0], seats: Number(f.seats) || 0 })
    onClose()
  }
  return (
    <motion.div className="fixed inset-0 z-[200] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <motion.form
        onSubmit={submit}
        initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.97 }}
        className="relative w-full max-w-lg bg-chalk border border-ink/20 rounded-[4px] shadow-hard p-7 max-h-[88vh] overflow-y-auto no-scrollbar"
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-ink-soft hover:text-marker" data-cursor="link">✕</button>
        <h2 className="font-display italic font-bold text-2xl tracking-tightest">New session</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="label">Title</label><input value={f.name} onChange={set('name')} className="field" placeholder="Session name" /></div>
          <div><label className="label">Date</label><input type="date" value={f.date} onChange={set('date')} className="field" /></div>
          <div><label className="label">Time</label><input value={f.time} onChange={set('time')} className="field" /></div>
          <div><label className="label">Room</label><input value={f.room} onChange={set('room')} className="field" placeholder="e.g. Virat Kohli" /></div>
          <div><label className="label">Location</label><input value={f.location} onChange={set('location')} className="field" /></div>
          <div><label className="label">Type</label>
            <select value={f.type} onChange={set('type')} className="field">{SESSION_TYPES.map((t) => <option key={t.id}>{t.id}</option>)}</select>
          </div>
          <div><label className="label">Seats</label><input type="number" value={f.seats} onChange={set('seats')} className="field" /></div>
          <div className="col-span-2"><label className="label">Trainer</label><input value={f.trainer} onChange={set('trainer')} className="field" /></div>
        </div>
        <button type="submit" className="btn-ink w-full justify-center mt-5" data-cursor="link">Add session</button>
      </motion.form>
    </motion.div>
  )
}

function EventDetail({ ev, onDelete, canDelete }) {
  return (
    <div className="border-l-2 pl-4 py-1" style={{ borderColor: sessionTypeColor(ev.type) }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display italic font-bold text-lg leading-tight">{ev.name}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-stone mt-0.5">{ev.type}</div>
        </div>
        <span className="tag" style={{ borderColor: sessionTypeColor(ev.type) + '66', color: sessionTypeColor(ev.type) }}>{ev.duration}</span>
      </div>
      <dl className="mt-2 text-sm text-ink-soft space-y-0.5">
        <div>{ev.date}{ev.endDate ? ` – ${ev.endDate}` : ''} · {ev.time}</div>
        <div>{ev.location}{ev.room ? ` · Room ${ev.room}` : ''}</div>
        {ev.trainer && <div>Trainer: {ev.trainer}</div>}
        {ev.seats ? <div>{ev.seats} seats</div> : null}
      </dl>
      {canDelete && <button onClick={() => onDelete(ev.id)} className="mt-2 font-mono text-[10px] uppercase tracking-widest text-marker hover:underline" data-cursor="link">Delete</button>}
    </div>
  )
}

export default function Calendar() {
  const { isTutor } = useAuth()
  useStore((s) => s.events)
  useEffect(() => store.ensureEventsSeeded(SEED_EVENTS), [])
  const events = store.get().events || SEED_EVENTS

  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(5) // June
  const [selected, setSelected] = useState(null)
  const [product, setProduct] = useState('all-filter')
  const [type, setType] = useState('All')
  const [showNew, setShowNew] = useState(false)

  const visible = events.filter((e) => {
    if (product !== 'all-filter' && !e.productIds?.includes(product) && !e.productIds?.includes('all')) return false
    if (type !== 'All' && e.type !== type) return false
    return true
  })

  // Map of dateString -> events.
  const byDate = useMemo(() => {
    const m = {}
    for (const ev of visible) for (const d of eventDates(ev)) (m[d] ||= []).push(ev)
    return m
  }, [visible])

  const first = new Date(year, month, 1)
  const startDow = (first.getDay() + 6) % 7 // make Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const upcoming = [...visible].sort((a, b) => a.date.localeCompare(b.date))
  const selectedEvents = selected ? byDate[selected] || [] : []

  const prev = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1) }

  return (
    <div className="pb-10">
      <PageHeader kicker="Live training" title="Calendar" intro="In-person sessions, workshops and clinics. Filter by product or session type; tutors can add new sessions.">
        {isTutor && (
          <button onClick={() => setShowNew(true)} className="btn-ink mt-6" data-cursor="link">＋ New session</button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone mr-1">Product</span>
          <button onClick={() => setProduct('all-filter')} className={`tag ${product === 'all-filter' ? 'bg-ink text-chalk border-ink' : 'hover:border-ink'}`} data-cursor="link">All</button>
          {PRODUCTS.map((p) => <button key={p.id} onClick={() => setProduct(p.id)} className={`tag ${product === p.id ? 'text-chalk border-transparent' : 'hover:border-ink'}`} style={product === p.id ? { background: p.color } : { borderColor: p.color + '66', color: p.color }} data-cursor="link">{p.name}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone mr-1">Type</span>
          <button onClick={() => setType('All')} className={`tag ${type === 'All' ? 'bg-ink text-chalk border-ink' : 'hover:border-ink'}`} data-cursor="link">All</button>
          {SESSION_TYPES.map((t) => <button key={t.id} onClick={() => setType(t.id)} className={`tag ${type === t.id ? 'text-chalk border-transparent' : 'hover:border-ink'}`} style={type === t.id ? { background: t.color } : { borderColor: t.color + '66', color: t.color }} data-cursor="link">{t.label}</button>)}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-8 grid lg:grid-cols-[1.6fr_1fr] gap-8">
        {/* Month grid */}
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
                <button
                  key={i}
                  onClick={() => setSelected(ds)}
                  data-cursor="link"
                  className={`min-h-[68px] rounded-[3px] border p-1 text-left transition ${selected === ds ? 'border-ink ring-1 ring-ink' : 'border-ink/15'} ${has ? 'bg-marker/10 hover:bg-marker/15' : 'bg-chalk/40 hover:bg-chalk'}`}
                >
                  <div className="font-mono text-[10px] text-ink-soft">{day}</div>
                  {evs.slice(0, 1).map((ev) => (
                    <div key={ev.id} className="font-hand text-[15px] leading-tight text-ink truncate">{ev.short || ev.name}</div>
                  ))}
                  <div className="flex gap-0.5 mt-0.5">
                    {evs.slice(0, 3).map((ev, k) => <span key={k} className="w-1.5 h-1.5 rounded-full" style={{ background: sessionTypeColor(ev.type) }} />)}
                  </div>
                  {evs.length > 1 && <div className="font-mono text-[8px] text-stone">+{evs.length - 1}</div>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Day detail + agenda */}
        <div className="space-y-6">
          {selected && (
            <div className="paper-card p-5">
              <div className="eyebrow">{selected}</div>
              <h3 className="font-display italic font-bold text-xl mt-1 mb-3">On this day</h3>
              {selectedEvents.length ? (
                <div className="space-y-4">{selectedEvents.map((ev) => <EventDetail key={ev.id} ev={ev} canDelete={isTutor} onDelete={store.deleteEvent} />)}</div>
              ) : <p className="text-ink-soft text-sm font-hand text-lg">Nothing scheduled.</p>}
            </div>
          )}
          <div className="paper-card p-5">
            <h3 className="font-display italic font-bold text-xl mb-3">Upcoming</h3>
            <div className="space-y-4">
              {upcoming.map((ev) => <EventDetail key={ev.id} ev={ev} canDelete={isTutor} onDelete={store.deleteEvent} />)}
              {!upcoming.length && <p className="text-ink-soft text-sm">No sessions match those filters.</p>}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>{showNew && <NewSessionModal onClose={() => setShowNew(false)} />}</AnimatePresence>
    </div>
  )
}
