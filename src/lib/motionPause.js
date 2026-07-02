// Shared pause signal for decorative, always-on rAF loops (cursor, hero
// particles). When something else fully covers the screen — like the
// Supportverse popup — there's no reason to keep animating hidden content
// and contending with it for the main thread.
const ATTR = 'data-motion-paused'

export const isMotionPaused = () =>
  typeof document !== 'undefined' && document.documentElement.getAttribute(ATTR) === '1'

export const pauseMotion = () => document.documentElement.setAttribute(ATTR, '1')
export const resumeMotion = () => document.documentElement.removeAttribute(ATTR)
