// A short "lens hunting for focus" blip for the Articles timeline — call
// `tick()` once each time the selected month changes. Each tick is a brief
// servo whir that hunts up in pitch and settles, with a soft focus "clack" at
// the onset (think autofocus stepping, or a fishing-reel click). It's
// synthesized with the Web Audio API — no asset files — and every call spins up
// short-lived nodes, so there is no continuous drone.
//
// Browsers only allow audio after a user gesture, so the AudioContext is created
// lazily on the first `tick()` (which always originates from a drag/click/keypress).
import { useCallback, useEffect, useRef } from 'react'

export function useWinding() {
  const ref = useRef({ ctx: null, master: null, muted: false, seed: 0 })

  const ensure = useCallback(() => {
    const s = ref.current
    if (s.ctx) return s
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
    if (!AC) return null
    const ctx = new AC()
    const master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
    Object.assign(s, { ctx, master })
    return s
  }, [])

  const tick = useCallback((strength = 1) => {
    const s = ensure()
    if (!s || s.muted) return
    const { ctx, master } = s
    if (ctx.state === 'suspended') ctx.resume()
    const t = ctx.currentTime
    s.seed = (s.seed + 1) % 1000
    const jitter = ((s.seed * 37) % 50) - 25 // deterministic wobble (no Math.random needed)
    const v = Math.max(0.35, Math.min(1, strength))

    // Servo whir: a soft triangle that hunts up then settles back — the
    // "searching for focus" glide.
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    const g = ctx.createGain()
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 2400
    lp.Q.value = 0.6
    osc.connect(g)
    g.connect(lp)
    lp.connect(master)

    const base = 250 + jitter
    osc.frequency.setValueAtTime(base, t)
    osc.frequency.exponentialRampToValueAtTime(base * 2.1, t + 0.05) // hunt up
    osc.frequency.exponentialRampToValueAtTime(base * 1.35, t + 0.15) // settle
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.09 * v, t + 0.012) // quick attack
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18) // decay
    osc.start(t)
    osc.stop(t + 0.2)

    // Focus "clack": a tiny filtered click at the onset.
    const len = Math.floor(ctx.sampleRate * 0.03)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (((i * 73 + s.seed) % 101) / 50 - 1) * (1 - i / len)
    const click = ctx.createBufferSource()
    click.buffer = buf
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1700
    bp.Q.value = 1.2
    const cg = ctx.createGain()
    cg.gain.value = 0.06 * v
    click.connect(bp)
    bp.connect(cg)
    cg.connect(master)
    click.start(t)
    click.stop(t + 0.04)
  }, [ensure])

  const setMuted = useCallback((m) => {
    ref.current.muted = m
  }, [])

  useEffect(() => {
    const s = ref.current
    return () => {
      if (s.ctx) s.ctx.close().catch(() => {})
    }
  }, [])

  return { tick, setMuted }
}
