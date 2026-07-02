import { useEffect, useRef } from 'react'
import { categoryOf } from '../config/theme.js'

// Orientation only — never a second navigation interface (doc §13).
const W = 168
const H = 112

export default function Minimap({ fgRef, data, dims }) {
  const ref = useRef()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const draw = () => {
      const nodes = data.nodes.filter((n) => n.x !== undefined)
      ctx.clearRect(0, 0, W, H)
      if (!nodes.length) return
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      for (const n of nodes) {
        if (n.x < minX) minX = n.x; if (n.x > maxX) maxX = n.x
        if (n.y < minY) minY = n.y; if (n.y > maxY) maxY = n.y
      }
      const pad = 40
      minX -= pad; maxX += pad; minY -= pad; maxY += pad
      const sx = W / (maxX - minX)
      const sy = H / (maxY - minY)
      const s = Math.min(sx, sy)
      const ox = (W - (maxX - minX) * s) / 2
      const oy = (H - (maxY - minY) * s) / 2
      const px = (x) => ox + (x - minX) * s
      const py = (y) => oy + (y - minY) * s

      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(px(n.x), py(n.y), Math.max(1, n.importance * 2.2), 0, Math.PI * 2)
        ctx.fillStyle = categoryOf(n).color + 'bb'
        ctx.fill()
      }
      // viewport rectangle
      const fg = fgRef.current
      if (fg) {
        const tl = fg.screen2GraphCoords(0, 0)
        const br = fg.screen2GraphCoords(dims.w, dims.h)
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'
        ctx.lineWidth = 1
        ctx.strokeRect(px(tl.x), py(tl.y), (br.x - tl.x) * s, (br.y - tl.y) * s)
      }
    }
    draw()
    const t = setInterval(draw, 400)
    return () => clearInterval(t)
  }, [data, dims, fgRef])

  return (
    <div className="fixed bottom-5 right-5 z-30 rounded-lg border border-line bg-panel/70 backdrop-blur overflow-hidden" aria-hidden="true">
      <canvas ref={ref} width={W} height={H} />
    </div>
  )
}
