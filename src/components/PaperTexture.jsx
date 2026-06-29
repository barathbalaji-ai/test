// Fixed, non-interactive "handbook" atmosphere layer:
// paper fibres, organic wrinkles, tape strips, newspaper clippings, vignette.
// Clippings use real PNGs at /clippings/clip-1..3.png if present, else a drawn
// newsprint fallback.
import { useEffect, useState } from 'react'

function Clipping({ src, fallbackRotate = -4, style }) {
  const [ok, setOk] = useState(true)
  return (
    <div className="absolute pointer-events-none select-none" style={style}>
      {ok ? (
        <img
          src={src}
          alt=""
          onError={() => setOk(false)}
          style={{ transform: `rotate(${fallbackRotate}deg)`, opacity: 0.78, width: 150 }}
        />
      ) : (
        <div
          className="bg-[#efe9da]"
          style={{
            transform: `rotate(${fallbackRotate}deg)`,
            opacity: 0.72,
            width: 150,
            padding: '10px 12px',
            filter: 'sepia(0.35) contrast(0.95)',
            boxShadow: '2px 3px 0 rgba(0,0,0,0.08)',
            clipPath:
              'polygon(0 3%, 8% 0, 22% 4%, 40% 1%, 60% 5%, 78% 1%, 94% 4%, 100% 0, 99% 30%, 100% 70%, 98% 100%, 70% 97%, 40% 100%, 12% 97%, 0 100%, 1% 60%, 0 30%)',
          }}
        >
          <div className="font-display font-black text-[13px] leading-none text-ink/80">DISPATCH</div>
          <div className="my-1 h-6 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,.18)0,rgba(0,0,0,.18)1px,transparent_1px,transparent_3px)]" />
          <div className="space-y-[3px]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[3px] bg-ink/25" style={{ width: `${90 - i * 8}%` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PaperTexture() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(m.matches)
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
      {/* SVG filters */}
      <svg className="absolute w-0 h-0">
        <filter id="paper-fibres">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <filter id="paper-wrinkles">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves="2" seed="7" result="n" />
          <feDiffuseLighting in="n" lightingColor="#fff" surfaceScale="2.2" result="l">
            <feDistantLight azimuth="235" elevation="58" />
          </feDiffuseLighting>
          <feColorMatrix in="l" type="saturate" values="0" />
        </filter>
      </svg>

      {/* Paper fibres */}
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{ filter: 'url(#paper-fibres)', opacity: 0.1 }}
      />
      {/* Organic wrinkles */}
      <div
        className="absolute inset-0 mix-blend-soft-light"
        style={{ filter: 'url(#paper-wrinkles)', opacity: 0.55 }}
      />

      {/* Tape strips in the margins */}
      <div className="absolute top-24 -left-6 w-28 h-7 bg-taupe/40 rotate-[-18deg] backdrop-blur-[1px] shadow-sm" />
      <div className="absolute bottom-28 -right-8 w-32 h-7 bg-taupe/40 rotate-[14deg] shadow-sm" />
      <div className="absolute top-1/2 -right-5 w-24 h-6 bg-chalk/50 rotate-[8deg]" />

      {/* Newspaper clippings (hidden on small screens to keep margins clean) */}
      <div className="hidden lg:block">
        <Clipping src="/clippings/clip-1.png" fallbackRotate={-5} style={{ top: 120, right: 14 }} />
        <Clipping src="/clippings/clip-2.png" fallbackRotate={6} style={{ bottom: 90, left: 10 }} />
        <Clipping src="/clippings/clip-3.png" fallbackRotate={-3} style={{ top: '46%', left: 6 }} />
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ boxShadow: 'inset 0 0 280px rgba(26,23,18,0.32)' }}
      />
    </div>
  )
}
