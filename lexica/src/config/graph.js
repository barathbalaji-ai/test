// Physics + reveal tuning. Everything numeric about the universe lives here.
export const GRAPH = {
  chargeStrength: -160,
  linkDistance: (weight) => 60 - 25 * (weight || 0.5),
  collideRadius: (nodeVal) => Math.sqrt(nodeVal) * 5 + 8,
  alphaDecay: 0.035,
  velocityDecay: 0.4,
  warmupTicks: 60,

  // Camera flights (never teleport — doc §7/§8)
  flightMs: 1200,
  focusZoom: 2.4,

  // Label reveal: label shows when zoom * importance clears this bar.
  labelThreshold: 0.85,

  // Progressive reveal — the opening constellation (~15–20 nodes, doc §1).
  initialNodes: [
    'lexica',
    'products-hub', 'learning-hub', 'ai-hub', 'library-hub', 'people-hub',
    'freshdesk', 'freshservice', 'freshchat', 'freddy-ai',
    'artificial-intelligence', 'customer-support', 'etiquette',
    'course-freshdesk-product-training', 'prog-support-codex',
  ],
}

// Fixed gravitational centres — anchors keep spatial memory stable (doc §14).
export const PINNED = {
  lexica: { x: 0, y: 0 },
  'products-hub': { x: -260, y: -160 },
  'learning-hub': { x: 260, y: -160 },
  'ai-hub': { x: 0, y: 300 },
  'library-hub': { x: -280, y: 200 },
  'people-hub': { x: 300, y: 180 },
}
