// Articles: launches lead story + a feed of string-tie folder cards.
import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import { Reveal } from '../components/Reveal.jsx'
import ArticleCard from '../components/ArticleCard.jsx'
import { LAUNCHES, ARTICLES, ARTICLE_CATEGORIES } from '../data/articles.js'

function Lead() {
  return (
    <Reveal>
      <section className="mx-auto max-w-7xl px-6">
        <div className="section-dark rounded-[4px] p-8 sm:p-12 relative overflow-hidden">
          <div className="eyebrow text-marker">{LAUNCHES.kicker}</div>
          <h2 className="mt-3 font-display italic font-black text-4xl sm:text-5xl tracking-tightest text-chalk max-w-2xl">{LAUNCHES.title}</h2>
          <p className="mt-4 text-chalk/70 max-w-2xl text-lg">{LAUNCHES.dek}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {LAUNCHES.items.map((it) => (
              <li key={it.name} className="border-t border-chalk/20 pt-3">
                <div className="font-display italic font-bold text-xl text-chalk">{it.name}</div>
                <p className="mt-1 text-sm text-chalk/60">{it.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Reveal>
  )
}

export default function Articles() {
  const [cat, setCat] = useState('All')
  const list = ARTICLES.filter((a) => cat === 'All' || a.category === cat)

  return (
    <div className="pb-10">
      <PageHeader kicker="The reading room" title="Articles" intro="Start with what shipped this month, then dig into the release notes — each folder opens the real support article." />
      <Lead />
      <div className="mx-auto max-w-7xl px-6 mt-10 flex flex-wrap gap-2">
        {ARTICLE_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} data-cursor="link" className={`tag ${cat === c ? 'bg-ink text-chalk border-ink' : 'hover:border-ink'}`}>{c}</button>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-6 mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a, i) => (
          <Reveal key={a.id} delay={(i % 6) * 0.04}>
            <ArticleCard article={a} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}
