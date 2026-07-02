import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ForceGraph2D from 'react-force-graph-2d'
import { forceCollide } from 'd3-force-3d'
import { GRAPH, PINNED } from '../config/graph.js'
import { categoryOf, relStyle } from '../config/theme.js'
import { loadGraph } from '../lib/loader.js'
import { loadState, saveState, prefersReducedMotion } from '../lib/persist.js'
import { searchNodes } from '../graph/search.js'
import SearchOverlay from './SearchOverlay.jsx'
import FilterPanel from './FilterPanel.jsx'
import NodePanel from './NodePanel.jsx'
import Minimap from './Minimap.jsx'
import BreadcrumbTrail from './BreadcrumbTrail.jsx'
import IndexMode from './IndexMode.jsx'

const jitter = (spread = 40) => (Math.random() - 0.5) * spread

export default function Universe() {
  const graph = useMemo(loadGraph, [])
  const fgRef = useRef()
  const navigate = useNavigate()
  const { id: routeId } = useParams()
  const reduced = useMemo(prefersReducedMotion, [])

  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight })
  const [visibleIds, setVisibleIds] = useState(() => {
    const saved = loadState()
    const base = new Set(GRAPH.initialNodes.filter((id) => graph.byId.has(id)))
    for (const id of saved.visible || []) if (graph.byId.has(id)) base.add(id)
    return base
  })
  const [selectedId, setSelectedId] = useState(null)
  const [hoverNode, setHoverNode] = useState(null)
  const [hiddenCats, setHiddenCats] = useState(() => new Set(loadState().hiddenCats || []))
  const [trail, setTrail] = useState([])
  const [pinned, setPinned] = useState(() => new Set(loadState().pinned || []))
  const [searchOpen, setSearchOpen] = useState(false)
  const [indexOpen, setIndexOpen] = useState(false)
  const [query, setQuery] = useState('')

  // Node/link object identity must stay stable so positions survive re-renders.
  const allNodes = useMemo(() => {
    for (const n of graph.nodes) {
      const pin = PINNED[n.id]
      if (pin) { n.fx = pin.x; n.fy = pin.y; n.x = pin.x; n.y = pin.y }
      else if (n.x === undefined) { n.x = jitter(700); n.y = jitter(700) }
    }
    return graph.nodes
  }, [graph])

  const data = useMemo(() => {
    const nodes = allNodes.filter((n) => visibleIds.has(n.id))
    const links = graph.links.filter((l) => {
      const s = typeof l.source === 'object' ? l.source.id : l.source
      const t = typeof l.target === 'object' ? l.target.id : l.target
      return visibleIds.has(s) && visibleIds.has(t)
    })
    return { nodes, links }
  }, [allNodes, graph, visibleIds])

  // Progressive-search dimming: matching nodes brighten, the rest recede (doc §10).
  const matchedIds = useMemo(() => {
    if (!searchOpen || !query.trim()) return null
    return new Set(searchNodes(graph, query, 40).map((n) => n.id))
  }, [graph, query, searchOpen])

  const neighborIds = useMemo(() => {
    if (!selectedId) return null
    const set = new Set([selectedId])
    for (const nb of graph.neighbors.get(selectedId) || []) set.add(nb.id)
    return set
  }, [graph, selectedId])

  // ---- Physics ----
  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    fg.d3Force('charge').strength(GRAPH.chargeStrength)
    fg.d3Force('link').distance((l) => GRAPH.linkDistance(l.weight))
    fg.d3Force('collide', forceCollide((n) => GRAPH.collideRadius(nodeVal(n))))
  }, [])

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // ---- Camera memory: restore last position once, save on movement (doc §8) ----
  useEffect(() => {
    const cam = loadState().camera
    const fg = fgRef.current
    if (!fg) return
    const t = setTimeout(() => {
      if (cam) { fg.centerAt(cam.x, cam.y, 0); fg.zoom(cam.k, 0) }
      else fg.zoom(1.1, 0)
    }, 50)
    return () => clearTimeout(t)
  }, [])

  const persist = useCallback(() => {
    saveState({
      visible: [...visibleIds],
      hiddenCats: [...hiddenCats],
      pinned: [...pinned],
    })
  }, [visibleIds, hiddenCats, pinned])
  useEffect(persist, [persist])

  // ---- Expansion: knowledge unfolds from its parent, never teleports in ----
  const expand = useCallback((id) => {
    const origin = graph.byId.get(id)
    setVisibleIds((prev) => {
      const next = new Set(prev)
      for (const nb of graph.neighbors.get(id) || []) {
        if (!next.has(nb.id)) {
          const n = graph.byId.get(nb.id)
          if (n && n.fx === undefined && origin && origin.x !== undefined) {
            n.x = origin.x + jitter(70)
            n.y = origin.y + jitter(70)
          }
          next.add(nb.id)
        }
      }
      return next
    })
  }, [graph])

  const flyTo = useCallback((node, zoom = GRAPH.focusZoom) => {
    const fg = fgRef.current
    if (!fg || node.x === undefined) return
    const ms = reduced ? 200 : GRAPH.flightMs
    fg.centerAt(node.x, node.y, ms)
    fg.zoom(Math.max(zoom, fg.zoom()), ms)
    setTimeout(() => {
      const c = { x: node.x, y: node.y, k: fg.zoom() }
      saveState({ camera: c })
    }, ms + 50)
  }, [reduced])

  const select = useCallback((node, { fly = true } = {}) => {
    if (!node) return
    setVisibleIds((prev) => (prev.has(node.id) ? prev : new Set(prev).add(node.id)))
    expand(node.id)
    setSelectedId(node.id)
    setTrail((t) => (t[t.length - 1] === node.id ? t : [...t.slice(-7), node.id]))
    if (fly) setTimeout(() => flyTo(node), 60)
    navigate(`/node/${node.id}`, { replace: true })
  }, [expand, flyTo, navigate])

  const deselect = useCallback(() => {
    setSelectedId(null)
    navigate('/', { replace: true })
  }, [navigate])

  // Deep links fly the camera (doc §2 "Routes simply allow sharing locations").
  useEffect(() => {
    if (!routeId) return
    const node = graph.byId.get(routeId)
    if (node && routeId !== selectedId) {
      const t = setTimeout(() => select(node), 400)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, graph])

  // ---- Keyboard ----
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      } else if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false)
        else if (indexOpen) setIndexOpen(false)
        else deselect()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, indexOpen, deselect])

  const togglePin = useCallback((id) => {
    setPinned((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const resetView = useCallback(() => {
    const home = graph.byId.get('lexica')
    if (home) { deselect(); flyTo(home, 1.1) }
  }, [graph, deselect, flyTo])

  // ---- Painting ----
  const nodeVal = (n) => {
    const cat = categoryOf(n)
    return Math.pow(cat.size * (0.55 + n.importance), 1.2)
  }

  const nodeAlpha = (n) => {
    if (hiddenCats.has(n.category)) return 0.06
    if (matchedIds) return matchedIds.has(n.id) ? 1 : 0.08
    if (neighborIds) return neighborIds.has(n.id) ? 1 : 0.22
    return 1
  }

  const paintNode = useCallback((node, ctx, scale) => {
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return
    const cat = categoryOf(node)
    const alpha = nodeAlpha(node)
    const t = performance.now() / 1000
    // Breathing: each node exhales on its own phase (doc §1 "Living Knowledge").
    const phase = (node.id.charCodeAt(0) + node.id.length) % 7
    const breathe = reduced ? 1 : 1 + 0.05 * Math.sin(t * 0.9 + phase)
    const r = (cat.size * (0.55 + node.importance) * 0.9) * breathe
    const isSelected = node.id === selectedId
    const isHover = hoverNode && node.id === hoverNode.id
    const isPinned = pinned.has(node.id)

    ctx.save()
    ctx.globalAlpha = alpha

    // Glow — OLED, not neon nightclub (doc §6).
    const glowR = r * (2.2 + node.importance * 2.2) * (isSelected || isHover ? 1.35 : 1)
    const g = ctx.createRadialGradient(node.x, node.y, r * 0.4, node.x, node.y, glowR)
    g.addColorStop(0, cat.color + '55')
    g.addColorStop(1, cat.color + '00')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2)
    ctx.fill()

    // Core
    ctx.beginPath()
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
    ctx.fillStyle = cat.color
    ctx.fill()

    if (isSelected || isPinned) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, r + 3 / scale + 2, 0, Math.PI * 2)
      ctx.strokeStyle = isSelected ? '#ffffffcc' : cat.color + 'aa'
      ctx.lineWidth = 1.4 / scale
      if (isPinned && !isSelected) ctx.setLineDash([3 / scale, 3 / scale])
      ctx.stroke()
      ctx.setLineDash([])
    } else if (isHover) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, r + 2 / scale + 1.5, 0, Math.PI * 2)
      ctx.strokeStyle = '#ffffff88'
      ctx.lineWidth = 1 / scale
      ctx.stroke()
    }

    // Labels reveal progressively with zoom × importance (doc §8).
    // Importance-tiered reveal: majors label early, supporting nodes only at
    // deep zoom or on hover — the universe stays quiet (doc §8 zoom levels).
    const labelVisible =
      isSelected || isHover ||
      scale * Math.pow(node.importance, 1.6) > 0.55 ||
      (neighborIds && neighborIds.has(node.id) && node.importance >= 0.45 && scale > 1.2)
    if (labelVisible && alpha > 0.15) {
      const fontSize = Math.max(11 / scale, 2.2)
      ctx.font = `${node.category === 'core' ? '600 ' : ''}${fontSize}px Sora, Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = `rgba(235,240,250,${Math.min(alpha, 0.92)})`
      const label = node.category === 'core' && node.id === 'lexica' ? 'L E X I C A' : node.title
      ctx.fillText(label, node.x, node.y + r + 3 / scale + 2)
    }
    ctx.restore()
  }, [selectedId, hoverNode, pinned, neighborIds, matchedIds, hiddenCats, reduced])

  const paintPointerArea = useCallback((node, color, ctx) => {
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return
    const cat = categoryOf(node)
    const r = cat.size * (0.55 + node.importance) * 0.9 + 4
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
    ctx.fill()
  }, [])

  const linkAlphaFor = useCallback((l) => {
    const style = relStyle(l.type)
    const s = typeof l.source === 'object' ? l.source.id : l.source
    const t = typeof l.target === 'object' ? l.target.id : l.target
    let a = style.alpha * (0.5 + l.weight * 0.8)
    if (neighborIds) a = (neighborIds.has(s) && neighborIds.has(t)) ? Math.min(a * 2.4, 0.85) : a * 0.25
    if (matchedIds && !(matchedIds.has(s) && matchedIds.has(t))) a *= 0.15
    if (hiddenCats.size) {
      const sn = graph.byId.get(s); const tn = graph.byId.get(t)
      if ((sn && hiddenCats.has(sn.category)) || (tn && hiddenCats.has(tn.category))) a *= 0.1
    }
    return a
  }, [neighborIds, matchedIds, hiddenCats, graph])

  return (
    <div className="fixed inset-0 overflow-hidden" role="application" aria-label="Lexica knowledge universe">
      <ForceGraph2D
        ref={fgRef}
        width={dims.w}
        height={dims.h}
        graphData={data}
        backgroundColor="rgba(0,0,0,0)"
        nodeVal={nodeVal}
        nodeLabel={() => ''}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={paintPointerArea}
        linkColor={(l) => `rgba(200,215,255,${linkAlphaFor(l)})`}
        linkWidth={(l) => 0.4 + l.weight * 1.2}
        linkLineDash={(l) => relStyle(l.type).dash}
        linkDirectionalParticles={(l) => (reduced ? 0 : l.weight >= 0.75 ? 2 : l.weight >= 0.45 ? 1 : 0)}
        linkDirectionalParticleSpeed={(l) => 0.0015 + l.weight * 0.003}
        linkDirectionalParticleWidth={1.6}
        linkDirectionalParticleColor={() => 'rgba(210,225,255,0.7)'}
        d3AlphaDecay={GRAPH.alphaDecay}
        d3VelocityDecay={GRAPH.velocityDecay}
        warmupTicks={GRAPH.warmupTicks}
        onNodeClick={(node) => {
          if (hiddenCats.has(node.category)) return
          select(node)
        }}
        onNodeRightClick={(node) => togglePin(node.id)}
        onNodeHover={(node) => setHoverNode(node || null)}
        onBackgroundClick={deselect}
        onZoomEnd={({ k, x, y }) => saveState({ camera: { k, x, y } })}
        enableNodeDrag={!reduced}
      />

      {/* ---- Interface layer ---- */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-start justify-between px-5 pt-4 pointer-events-none">
        <button
          onClick={resetView}
          className="pointer-events-auto font-display tracking-[0.4em] text-sm text-white/80 hover:text-white transition-colors"
          title="Return to the centre"
        >
          LEXICA
        </button>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-lg border border-line bg-panel/80 backdrop-blur px-3 py-1.5 text-xs font-body text-faint hover:text-white/80 transition-colors"
          >
            Search <span className="font-mono text-[10px] opacity-60 ml-1">⌘K</span>
          </button>
          <button
            onClick={() => setIndexOpen(true)}
            className="rounded-lg border border-line bg-panel/80 backdrop-blur px-3 py-1.5 text-xs font-body text-faint hover:text-white/80 transition-colors"
            title="Accessible list of every node"
          >
            Index
          </button>
        </div>
      </header>

      <FilterPanel hiddenCats={hiddenCats} setHiddenCats={setHiddenCats} />
      <BreadcrumbTrail trail={trail} graph={graph} onJump={(n) => select(n)} />
      <Minimap fgRef={fgRef} data={data} dims={dims} />

      <SearchOverlay
        open={searchOpen}
        onClose={() => { setSearchOpen(false); setQuery('') }}
        graph={graph}
        query={query}
        setQuery={setQuery}
        onPick={(n) => { setSearchOpen(false); setQuery(''); select(n) }}
      />
      <IndexMode
        open={indexOpen}
        onClose={() => setIndexOpen(false)}
        graph={graph}
        onPick={(n) => { setIndexOpen(false); select(n) }}
      />
      <NodePanel
        graph={graph}
        node={selectedId ? graph.byId.get(selectedId) : null}
        pinned={pinned}
        onTogglePin={togglePin}
        onSelect={(n) => select(n)}
        onClose={deselect}
      />
    </div>
  )
}
