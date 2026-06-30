// String-tie folder card. A manila folder with a thread that wraps around it
// and a bow; on hover the bow unties, the strap slips off, a loose thread
// dangles. When the row carries a real link it opens the article in a new tab;
// rows that only have a description render as a sealed (non-clickable) folder.
import { motion } from 'framer-motion'

export default function ArticleCard({ article }) {
  const hasLink = Boolean(article.url)
  const hasText = Boolean(article.excerpt)

  const Body = (
    <div className="relative bg-[#d8c9a6] rounded-[4px] rounded-tl-[14px] border border-[#b9a87f] shadow-hard-sm overflow-hidden h-44 p-5">
      {/* folder tab */}
      <div className="absolute -top-px left-0 w-24 h-5 bg-[#cdbd97] rounded-tr-[12px] border-r border-t border-[#b9a87f]" />
      <div className="relative z-10 pt-3">
        <span className="font-mono text-[9px] uppercase tracking-widest text-oxblood">{article.product}</span>
        <h3 className={`mt-1 font-display italic font-bold text-lg text-ink leading-tight ${hasText ? 'line-clamp-2' : 'line-clamp-3'}`}>{article.name}</h3>
        {hasText && <p className="mt-1.5 text-sm text-ink/70 line-clamp-2">{article.excerpt}</p>}
      </div>
      <span className="absolute bottom-3 right-4 font-mono text-[9px] uppercase tracking-widest text-ink/50 group-hover:text-marker">
        {hasLink ? 'Read ↗' : 'No article yet'}
      </span>

      {/* string tie — vertical strap; slips off on hover only when there's a link */}
      <motion.div
        className="absolute top-0 bottom-0 left-1/2 w-[3px] bg-oxblood/80 -translate-x-1/2"
        variants={{ rest: { x: '-50%', opacity: 1 }, open: { x: '120%', opacity: 0.2 } }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
      {/* bow that unties */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        variants={{ rest: { scale: 1, rotate: 0, opacity: 1 }, open: { scale: 0.4, rotate: -40, opacity: 0 } }}
        transition={{ duration: 0.4 }}
      >
        <svg width="34" height="22" viewBox="0 0 34 22" fill="none">
          <path d="M17 11 L3 3 C0 8 0 14 3 19 Z" fill="#8E2A20" />
          <path d="M17 11 L31 3 C34 8 34 14 31 19 Z" fill="#8E2A20" />
          <circle cx="17" cy="11" r="3" fill="#6e1f17" />
        </svg>
      </motion.div>
      {/* loose dangling thread on hover */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[2px] bg-oxblood/70 origin-top"
        variants={{ rest: { height: 0, opacity: 0 }, open: { height: 26, opacity: 1, rotate: 12 } }}
        transition={{ duration: 0.45, delay: 0.1 }}
      />
    </div>
  )

  // No link → a sealed folder: same craft, no navigation, tie stays tied.
  if (!hasLink) {
    return (
      <div data-cursor="" className="relative block group cursor-default">
        {Body}
      </div>
    )
  }

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="link"
      initial="rest"
      whileHover="open"
      animate="rest"
      className="relative block group"
    >
      {Body}
    </motion.a>
  )
}
