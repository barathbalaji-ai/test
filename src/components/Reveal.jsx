// Smooth scroll-reveal helpers (NOT stepped — scrolling stays smooth).
import { motion } from 'framer-motion'

export function Reveal({ children, delay = 0, y = 18, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

// Word-by-word reveal. Each word sits in its own overflow-hidden mask with a
// little bottom padding so italic descenders are not clipped.
export function RevealWords({ text, className = '', wordClassName = '', delay = 0, stagger = 0.06 }) {
  const words = String(text).split(' ')
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.12em]" aria-hidden>
          <motion.span
            className={`inline-block ${wordClassName}`}
            initial={{ y: '110%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: delay + i * stagger }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export default Reveal
