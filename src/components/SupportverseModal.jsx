// Full-screen portal into Lexica — the "Supportverse" graph experience.
// Lexica is a separate app (see /lexica), built independently and served
// from /universe/ inside this same deployment. It's embedded via iframe so
// the two apps' dependencies (React 18 vs 19, router versions) never collide;
// this component just frames the doorway.
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pauseMotion, resumeMotion } from '../lib/motionPause.js'

export default function SupportverseModal({ open, onClose }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoaded(false)
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // The popup fully covers Carta's own cursor/particle animations — pause
    // them so they stop competing with the iframe for the main thread.
    pauseMotion()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      resumeMotion()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          role="dialog"
          aria-modal="true"
          aria-label="Supportverse — knowledge universe"
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.04, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.02, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.8, 0.35, 1] }}
          >
            <iframe
              src="/universe/"
              title="Supportverse"
              className="h-full w-full border-0"
              allow="fullscreen"
              onLoad={() => setLoaded(true)}
            />
          </motion.div>
          <AnimatePresence>
            {!loaded && (
              <motion.div
                className="pointer-events-none fixed inset-0 z-[101] flex flex-col items-center justify-center gap-4"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="h-2 w-2 rounded-full bg-white/80 animate-pulse" />
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
                  Entering the Supportverse…
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onClose}
            aria-label="Close the Supportverse and return to Carta"
            className="fixed top-4 right-4 z-[101] h-9 w-9 rounded-full border border-white/20 bg-black/50 backdrop-blur text-white/70 hover:text-white hover:border-white/40 transition-colors font-mono text-sm"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
