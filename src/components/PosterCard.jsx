// Poster tile: real image (full-bleed, caption overlay, inner vignette, slight
// tilt, hover lift). Cards without an image render a generative motif fallback.
import { useState } from 'react'
import { motion } from 'framer-motion'

const MOTIF = {
  Craft: { bg: 'linear-gradient(135deg,#DED7C6,#C7BCA6)', ink: '#1A1712' },
  Mindset: { bg: 'linear-gradient(135deg,#1A1712,#3a342b)', ink: '#F5F1E8' },
  Communication: { bg: 'linear-gradient(135deg,#0E5b46,#0E8F6E)', ink: '#F5F1E8' },
}

export function PosterMotif({ poster }) {
  const m = MOTIF[poster.category] || MOTIF.Craft
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style={{ background: m.bg, color: m.ink }}>
      {/* simple geometric motif */}
      <div className="absolute inset-4 border" style={{ borderColor: m.ink, opacity: 0.25 }} />
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-70">{poster.category}</span>
      <span className="mt-3 font-display italic font-black text-3xl leading-tight">{poster.title}</span>
      <span className="mt-3 w-10 h-0.5" style={{ background: '#E0382B' }} />
    </div>
  )
}

export default function PosterCard({ poster, onOpen }) {
  const [imgOk, setImgOk] = useState(true)
  const tilt = (poster.id.charCodeAt(0) % 3) - 1 // -1, 0, 1
  return (
    <motion.button
      whileHover={{ y: -5, rotate: 0 }}
      onClick={() => onOpen(poster)}
      data-cursor="link"
      className="paper-card p-0 overflow-hidden relative aspect-[3/4] block"
      style={{ rotate: `${tilt}deg` }}
    >
      {poster.img && imgOk ? (
        <img src={poster.img} alt={poster.title} onError={() => setImgOk(false)} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <PosterMotif poster={poster} />
      )}
      {/* inner vignette */}
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 60px rgba(26,23,18,0.35)' }} />
      {/* caption overlay */}
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-ink/80 to-transparent">
        <span className="font-mono text-[9px] uppercase tracking-widest text-chalk/70">{poster.category}</span>
        <div className="font-display italic font-bold text-chalk text-lg leading-tight">{poster.title}</div>
      </div>
    </motion.button>
  )
}
