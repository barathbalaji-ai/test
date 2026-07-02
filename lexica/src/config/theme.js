// Colour communicates category — not decoration (build doc §6).
// The doc's §6 table covers 9 families; §9's taxonomy lists more. The two are
// reconciled here so future categories need configuration only, never code.
export const CATEGORIES = {
  core:    { label: 'Core',          color: '#f5f7fa', size: 11 },
  product: { label: 'Products',      color: '#4d9fff', size: 9 },
  course:  { label: 'Courses',       color: '#2fd08c', size: 7 },
  release: { label: 'Release Notes', color: '#ffb347', size: 5 },
  poster:  { label: 'Posters',       color: '#a78bfa', size: 6 },
  program: { label: 'Programs',      color: '#e879b9', size: 7 },
  concept: { label: 'Concepts',      color: '#2dd4bf', size: 6 },
  person:  { label: 'People',        color: '#22d3ee', size: 5 },
  event:   { label: 'Events',        color: '#fb923c', size: 5 },
  ai:      { label: 'AI',            color: '#f87171', size: 8 },
}

export const categoryOf = (node) => {
  // AI-tagged knowledge glows red regardless of its home category (doc §6).
  if (node.id === 'ai-hub' || node.id === 'artificial-intelligence' || node.id === 'freddy-ai') return CATEGORIES.ai
  return CATEGORIES[node.category] || CATEGORIES.concept
}

// Edge semantics → visual language (doc §6 "Relationship Types").
export const REL_STYLES = {
  structural:       { dash: null,        alpha: 0.35, label: 'Structural' },
  related:          { dash: null,        alpha: 0.22, label: 'Related' },
  reference:        { dash: [2, 4],      alpha: 0.16, label: 'Reference' },
  explains:         { dash: [6, 3],      alpha: 0.28, label: 'Explains' },
  prerequisite:     { dash: [8, 2],      alpha: 0.3,  label: 'Prerequisite' },
  recommended_next: { dash: [8, 2],      alpha: 0.3,  label: 'Recommended next' },
  parent_of:        { dash: null,        alpha: 0.3,  label: 'Part of' },
  created_by:       { dash: [1, 3],      alpha: 0.22, label: 'Led by' },
  depends_on:       { dash: [3, 3],      alpha: 0.3,  label: 'Depends on' },
}
export const relStyle = (type) => REL_STYLES[type] || REL_STYLES.related
