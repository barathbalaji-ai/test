// Course videos. Each card is a thumbnail; clicking opens the external course
// (Mindtickle / Drive) in a new tab. No in-site tracking. Content comes from the
// Videos sheet when configured, otherwise the bundled seed.
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../components/PageHeader.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { VIDEOS } from '../data/videos.js'
import { PRODUCTS, productById, matchProducts } from '../data/taxonomy.js'
import { SOURCES } from '../config/sources.js'
import { useSheet, pick } from '../lib/sheets.js'

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function isMindtickle(url) { return /mindtickle\.com/i.test(url || '') }

function VideoCard({ video }) {
  const primary = productById(video.productIds[0])
  return (
    <motion.a
      href={video.link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -3 }}
      data-cursor="link"
      className="paper-card p-0 overflow-hidden text-left flex flex-col group"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center" style={{ background: `linear-gradient(135deg, ${primary.color}22, #DED7C6)` }}>
            <span className="font-display italic font-black text-2xl text-ink/70 leading-tight">{video.title}</span>
          </div>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-ink/0 group-hover:bg-ink/35 transition-colors">
          <span className="w-14 h-14 rounded-full bg-marker text-chalk flex items-center justify-center text-xl opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-1.5">
          {video.productIds.slice(0, 3).map((p) => {
            const prod = productById(p)
            return <span key={p} className="tag" style={{ borderColor: prod.color + '66', color: prod.color }}>{prod.name}</span>
          })}
        </div>
        <h3 className="mt-3 font-display italic font-bold text-xl leading-tight">{video.title}</h3>
        <p className="mt-2 text-sm text-ink-soft line-clamp-3 flex-1">{video.blurb}</p>
        <span className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink/60 group-hover:text-marker">
          {isMindtickle(video.link) ? 'Watch on Mindtickle ↗' : 'Open course ↗'}
        </span>
      </div>
    </motion.a>
  )
}

export default function Videos() {
  const { data: videos } = useSheet(
    SOURCES.videos,
    (r) => {
      const title = pick(r, 'title', 'course name', 'course', 'name')
      const link = pick(r, 'link', 'course link', 'url')
      if (!title) return null
      const productLabel = pick(r, 'products', 'product', 'topics', 'topic')
      return {
        id: slug(title),
        title,
        blurb: pick(r, 'description', 'desc', 'blurb'),
        productLabel,
        productIds: matchProducts(productLabel),
        link,
        thumbnail: pick(r, 'thumbnail', 'image', 'thumb'),
      }
    },
    VIDEOS,
  )

  const [product, setProduct] = useState('all-filter')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => videos.filter((v) => {
    if (product !== 'all-filter' && !v.productIds.includes(product)) return false
    if (search && !`${v.title} ${v.blurb}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [videos, product, search])

  // Only show product chips that actually appear in the data.
  const present = new Set(videos.flatMap((v) => v.productIds))
  const chips = PRODUCTS.filter((p) => p.id !== 'all' && present.has(p.id))

  return (
    <div className="pb-10">
      <PageHeader
        kicker="The library"
        title="Courses"
        intro="Pick a topic and open the course — each thumbnail links straight to the lesson on Mindtickle. Watch at your own pace."
      />

      <div className="mx-auto max-w-7xl px-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone mr-1">Product</span>
          <button onClick={() => setProduct('all-filter')} data-cursor="link" className={`tag ${product === 'all-filter' ? 'bg-ink text-chalk border-ink' : 'hover:border-ink'}`}>Everything</button>
          {chips.map((p) => (
            <button key={p.id} onClick={() => setProduct(p.id)} data-cursor="link" className={`tag ${product === p.id ? 'text-chalk border-transparent' : 'hover:border-ink'}`} style={product === p.id ? { background: p.color } : { borderColor: p.color + '66', color: p.color }}>{p.name}</button>
          ))}
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses…" className="field max-w-sm" />
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v, i) => (
          <Reveal key={v.id} delay={(i % 6) * 0.04}>
            <VideoCard video={v} />
          </Reveal>
        ))}
        {filtered.length === 0 && <p className="text-ink-soft font-hand text-2xl col-span-full text-center py-12">No courses match those filters.</p>}
      </div>
    </div>
  )
}
