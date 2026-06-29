// Shared interior page header: mono kicker + big italic title (word-by-word
// reveal) + intro.
import { RevealWords, Reveal } from './Reveal.jsx'

export default function PageHeader({ kicker, title, intro, children }) {
  return (
    <header className="mx-auto max-w-7xl px-6 pt-14 pb-8">
      {kicker && <div className="eyebrow mb-3">{kicker}</div>}
      <h1 className="font-display italic font-bold tracking-tightest leading-[0.92] text-5xl sm:text-6xl lg:text-7xl">
        <RevealWords text={title} />
      </h1>
      {intro && (
        <Reveal delay={0.15}>
          <p className="mt-5 max-w-2xl text-ink-soft text-lg leading-relaxed">{intro}</p>
        </Reveal>
      )}
      {children}
    </header>
  )
}
