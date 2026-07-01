// Product taxonomy shared across the app. Each product carries a palette colour
// used for tags/dots. `matchProducts` turns free-text sheet values like
// "Freshdesk, Freshchat" (or typos like "Fresdesk"/"Freschat") into product ids.

export const PRODUCTS = [
  { id: 'all', name: 'All products', color: '#1A1712' },
  { id: 'freshdesk', name: 'Freshdesk', color: '#0E8F6E' },
  { id: 'freshservice', name: 'Freshservice', color: '#1F6FEB' },
  { id: 'freshchat', name: 'Freshchat', color: '#7A3FF2' },
  { id: 'freshcaller', name: 'Freshcaller', color: '#C2410C' },
  { id: 'freshsales', name: 'Freshsales', color: '#B91C5C' },
  { id: 'freshbots', name: 'Freshbots', color: '#0E7490' },
  { id: 'freddy', name: 'Freddy AI', color: '#B45309' },
  { id: 'enablement', name: 'Enablement', color: '#8E2A20' },
]

export const productById = (id) => PRODUCTS.find((p) => p.id === id) || PRODUCTS[0]

// Keyword match is typo-tolerant: it keys off the distinctive part of each name.
const KEYWORDS = [
  ['service', 'freshservice'],
  ['desk', 'freshdesk'],
  ['chat', 'freshchat'],
  ['caller', 'freshcaller'],
  ['sales', 'freshsales'],
  ['bot', 'freshbots'],
  ['freddy', 'freddy'],
]

export function matchProducts(text) {
  const raw = (text || '').toLowerCase()
  if (!raw.trim()) return ['all']
  if (/\ball\b|everyone|everybody/.test(raw)) return ['all']
  const ids = new Set()
  for (const token of raw.split(/[,/;]| and /)) {
    for (const [kw, id] of KEYWORDS) if (token.includes(kw)) ids.add(id)
  }
  return ids.size ? [...ids] : ['all']
}
