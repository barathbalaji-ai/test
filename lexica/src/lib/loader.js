// The Knowledge Engine's front door: every source becomes the same normalized
// object, and the renderer never learns where anything came from (doc §2/§9).
import rawNodes from '../data/nodes.json'
import rawRels from '../data/relationships.json'

export function normalizeNode(n) {
  return {
    id: String(n.id),
    title: n.title || n.id,
    category: n.category || 'concept',
    description: n.description || '',
    importance: typeof n.importance === 'number' ? n.importance : 0.4,
    tags: n.tags || [],
    aliases: n.aliases || [],
    assets: n.assets || {},
    metadata: n.metadata || {},
  }
}

export function loadGraph() {
  const nodes = rawNodes.map(normalizeNode)
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const links = rawRels
    .filter((r) => byId.has(r.source) && byId.has(r.target))
    .map((r) => ({ source: r.source, target: r.target, type: r.type || 'related', weight: r.weight ?? 0.5 }))

  // Adjacency for expansion, recommendations and context strips.
  const neighbors = new Map(nodes.map((n) => [n.id, []]))
  for (const l of links) {
    neighbors.get(l.source).push({ id: l.target, type: l.type, weight: l.weight })
    neighbors.get(l.target).push({ id: l.source, type: l.type, weight: l.weight })
  }
  for (const list of neighbors.values()) list.sort((a, b) => b.weight - a.weight)

  return { nodes, links, byId, neighbors }
}

// Shortest path from LEXICA to a node — the panel's context strip (doc §12).
export function contextPath(graph, targetId, rootId = 'lexica') {
  if (targetId === rootId) return [rootId]
  const prev = new Map([[rootId, null]])
  const queue = [rootId]
  while (queue.length) {
    const cur = queue.shift()
    for (const nb of graph.neighbors.get(cur) || []) {
      if (prev.has(nb.id)) continue
      prev.set(nb.id, cur)
      if (nb.id === targetId) {
        const path = [targetId]
        let p = cur
        while (p !== null) { path.unshift(p); p = prev.get(p) }
        return path
      }
      queue.push(nb.id)
    }
  }
  return [targetId]
}
