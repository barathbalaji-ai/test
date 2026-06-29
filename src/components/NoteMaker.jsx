// Floating ✎ notebook (bottom-right). Capture page selection, clip images,
// quick notes; download everything as Markdown. Persists in `carta.notes`.
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const KEY = 'carta.notes'
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export default function NoteMaker() {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState(load)
  const [clipMode, setClipMode] = useState(false)
  const [draft, setDraft] = useState('')
  const idRef = useRef(0)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(notes))
  }, [notes])

  const add = (note) => setNotes((n) => [{ id: `n${Date.now()}-${idRef.current++}`, ...note }, ...n])
  const remove = (id) => setNotes((n) => n.filter((x) => x.id !== id))

  // Clip-mode: clicking an image captures it.
  useEffect(() => {
    document.documentElement.classList.toggle('clip-mode', clipMode)
    if (!clipMode) return
    const onClick = (e) => {
      const img = e.target.closest?.('img')
      if (img && img.src) {
        e.preventDefault()
        e.stopPropagation()
        add({ type: 'image', src: img.src, alt: img.alt || 'clip' })
        setClipMode(false)
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [clipMode])

  const captureSelection = () => {
    const text = window.getSelection()?.toString().trim()
    if (text) add({ type: 'quote', text })
  }

  const addQuick = () => {
    if (draft.trim()) {
      add({ type: 'text', text: draft.trim() })
      setDraft('')
    }
  }

  const download = () => {
    const lines = ['# Carta — Notes', '']
    for (const n of [...notes].reverse()) {
      if (n.type === 'image') lines.push(`![${n.alt || ''}](${n.src})`, '')
      else if (n.type === 'quote') lines.push(`> ${n.text.replace(/\n/g, '\n> ')}`, '')
      else lines.push(n.text, '')
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'carta-notes.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        data-cursor="link"
        className="fixed bottom-5 right-5 z-[120] w-14 h-14 rounded-full bg-ink text-chalk flex items-center justify-center text-xl shadow-hard-sm hover:shadow-hard transition-all"
        aria-label="Notebook"
      >
        ✎
        {notes.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-marker text-chalk text-[10px] font-mono w-5 h-5 rounded-full flex items-center justify-center">
            {notes.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-5 z-[120] w-[340px] max-w-[calc(100vw-2.5rem)] bg-chalk border border-ink/20 rounded-[4px] shadow-hard"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink/15">
              <span className="font-display italic font-bold text-lg">Notebook</span>
              <button onClick={() => setOpen(false)} className="text-ink-soft hover:text-marker" data-cursor="link">✕</button>
            </div>

            <div className="p-3 flex flex-wrap gap-2 border-b border-ink/10">
              <button onClick={captureSelection} className="tag hover:border-marker hover:text-marker" data-cursor="link">＋ Selection</button>
              <button
                onClick={() => setClipMode((c) => !c)}
                className={`tag hover:border-marker ${clipMode ? 'border-marker text-marker' : ''}`}
                data-cursor="link"
              >
                {clipMode ? '◉ Click an image' : '＋ Clip image'}
              </button>
              <button onClick={download} disabled={!notes.length} className="tag hover:border-marker hover:text-marker disabled:opacity-40" data-cursor="link">↓ .md</button>
            </div>

            <div className="p-3 flex gap-2 border-b border-ink/10">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addQuick()}
                placeholder="Quick note…"
                className="field text-sm py-1.5"
              />
              <button onClick={addQuick} className="btn-ink px-3 py-1.5 text-[10px]" data-cursor="link">Add</button>
            </div>

            <div className="max-h-72 overflow-y-auto no-scrollbar p-3 space-y-2">
              {notes.length === 0 && (
                <p className="text-sm text-stone font-hand text-base">
                  Psst — highlight text and hit ＋ Selection, or clip an image.
                </p>
              )}
              {notes.map((n) => (
                <div key={n.id} className="group relative bg-paper/70 border border-ink/10 rounded-[3px] p-2 pr-7 text-sm">
                  {n.type === 'image' ? (
                    <img src={n.src} alt={n.alt} className="rounded-[2px] max-h-24" />
                  ) : n.type === 'quote' ? (
                    <span className="italic text-ink-soft">“{n.text}”</span>
                  ) : (
                    <span>{n.text}</span>
                  )}
                  <button
                    onClick={() => remove(n.id)}
                    className="absolute top-1 right-1 text-stone opacity-0 group-hover:opacity-100 hover:text-marker"
                    data-cursor="link"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
