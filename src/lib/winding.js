// A synthesized "film-reel winding" ambience for the Articles timeline.
// No audio files — everything is generated with the Web Audio API so it works
// offline and adds zero asset weight. Call `wind(intensity)` repeatedly while
// the timeline is being scrubbed; it ramps a mechanical whirr + ratchet up with
// the scrub speed and decays to silence shortly after movement stops.
//
// Browsers only allow audio after a user gesture, so the AudioContext is created
// lazily on the first `wind()` call (which always originates from a drag/scroll).
import { useCallback, useEffect, useRef } from 'react'

export function useWinding() {
  const ref = useRef({ ctx: null, muted: false, decay: 0 })

  const ensure = useCallback(() => {
    const s = ref.current
    if (s.ctx) return s
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
    if (!AC) return null
    const ctx = new AC()

    const master = ctx.createGain()
    master.gain.value = 0.0001
    master.connect(ctx.destination)

    // Voicing chain: a low sawtooth "motor" gated by a square LFO (the ratchet
    // clicks), softened through a lowpass.
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1100
    lp.Q.value = 6
    lp.connect(master)

    const ratchet = ctx.createGain()
    ratchet.gain.value = 0.6
    ratchet.connect(lp)

    const motor = ctx.createOscillator()
    motor.type = 'sawtooth'
    motor.frequency.value = 70
    motor.connect(ratchet)

    const lfo = ctx.createOscillator()
    lfo.type = 'square'
    lfo.frequency.value = 16
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.5
    lfo.connect(lfoGain)
    lfoGain.connect(ratchet.gain)

    // A breath of filtered noise = the tape/air hiss of the reel.
    const len = Math.floor(ctx.sampleRate * 0.5)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.5
    const noise = ctx.createBufferSource()
    noise.buffer = buf
    noise.loop = true
    const nf = ctx.createBiquadFilter()
    nf.type = 'bandpass'
    nf.frequency.value = 1400
    nf.Q.value = 0.7
    const ng = ctx.createGain()
    ng.gain.value = 0.18
    noise.connect(nf)
    nf.connect(ng)
    ng.connect(master)

    motor.start()
    lfo.start()
    noise.start()

    Object.assign(s, { ctx, master, motor, lfo, nf })
    return s
  }, [])

  const wind = useCallback((intensity = 0.5) => {
    const s = ensure()
    if (!s || s.muted) return
    const { ctx, master, motor, lfo, nf } = s
    if (ctx.state === 'suspended') ctx.resume()
    const v = Math.max(0, Math.min(1, intensity))
    const t = ctx.currentTime
    master.gain.setTargetAtTime(0.04 + 0.07 * v, t, 0.02)
    motor.frequency.setTargetAtTime(58 + v * 210, t, 0.03)
    lfo.frequency.setTargetAtTime(9 + v * 34, t, 0.03) // faster ratchet = faster wind
    nf.frequency.setTargetAtTime(800 + v * 1700, t, 0.05)
    clearTimeout(s.decay)
    s.decay = setTimeout(() => {
      master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.09)
    }, 100)
  }, [ensure])

  const setMuted = useCallback((m) => {
    const s = ref.current
    s.muted = m
    if (m && s.master && s.ctx) {
      clearTimeout(s.decay)
      s.master.gain.setTargetAtTime(0.0001, s.ctx.currentTime, 0.05)
    }
  }, [])

  useEffect(() => {
    const s = ref.current
    return () => {
      clearTimeout(s.decay)
      if (s.ctx) s.ctx.close().catch(() => {})
    }
  }, [])

  return { wind, setMuted }
}
