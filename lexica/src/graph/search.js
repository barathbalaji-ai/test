// Search is a navigation system, not a page finder (doc §10).
// Tolerant scoring over title/aliases/tags/description; results fly the camera.
const norm = (s) => (s || '').toLowerCase()

function fieldScore(haystack, q) {
  const h = norm(haystack)
  if (!h) return 0
  if (h === q) return 1
  if (h.startsWith(q)) return 0.85
  if (h.includes(q)) return 0.6
  // subsequence match tolerates abbreviations ("fd" → "freshdesk")
  let i = 0
  for (const ch of h) if (ch === q[i]) i++
  if (i === q.length && q.length >= 2) return 0.35
  return 0
}

export function searchNodes(graph, query, limit = 8) {
  const q = norm(query).trim()
  if (!q) return []
  const terms = q.split(/\s+/)
  const scored = []
  for (const n of graph.nodes) {
    let score = 0
    for (const t of terms) {
      let best = fieldScore(n.title, t) * 1.0
      for (const a of n.aliases) best = Math.max(best, fieldScore(a, t) * 0.95)
      for (const tag of n.tags) best = Math.max(best, fieldScore(tag, t) * 0.7)
      best = Math.max(best, fieldScore(n.description, t) * 0.4)
      best = Math.max(best, fieldScore(n.category, t) * 0.5)
      score += best
    }
    score = (score / terms.length) * (0.6 + 0.4 * n.importance)
    if (score > 0.15) scored.push({ node: n, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((s) => s.node)
}

export function connectionSummary(graph, id) {
  const counts = {}
  for (const nb of graph.neighbors.get(id) || []) {
    const cat = graph.byId.get(nb.id)?.category
    if (cat) counts[cat] = (counts[cat] || 0) + 1
  }
  return counts
}
