// The world should feel persistent, not regenerated every session (doc §8).
const KEY = 'lexica:state:v1'

export function loadState() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

export function saveState(patch) {
  try {
    const cur = loadState()
    localStorage.setItem(KEY, JSON.stringify({ ...cur, ...patch }))
  } catch {
    /* storage unavailable — the universe still works, it just forgets */
  }
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
