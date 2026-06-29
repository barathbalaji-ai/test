// Reusable marker-style hand-drawn SVG annotations. Each animates its stroke
// "drawing in" when scrolled into view. Default to red (#E0382B) / ink.
import { motion } from 'framer-motion'

const RED = '#E0382B'

const drawIn = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.7, ease: 'easeInOut' }, opacity: { duration: 0.1 } },
  },
}

function Svg({ children, className, viewBox = '0 0 200 60', ...rest }) {
  return (
    <motion.svg
      className={className}
      viewBox={viewBox}
      fill="none"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      preserveAspectRatio="none"
      {...rest}
    >
      {children}
    </motion.svg>
  )
}

const stroke = (color = RED, w = 3) => ({
  stroke: color,
  strokeWidth: w,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})

export function Circle({ color = RED, className = '' }) {
  return (
    <Svg className={className} viewBox="0 0 220 90">
      <motion.path
        d="M30 50 C25 18 95 8 150 14 C205 20 210 60 175 76 C130 96 45 92 24 64 C16 52 22 38 40 32"
        variants={drawIn}
        {...stroke(color, 3)}
      />
    </Svg>
  )
}

export function Underline({ color = RED, className = '' }) {
  // Double sketchy pass.
  return (
    <Svg className={className} viewBox="0 0 220 24">
      <motion.path d="M6 12 C60 6 150 6 214 11" variants={drawIn} {...stroke(color, 3)} />
      <motion.path
        d="M10 18 C70 14 160 16 210 14"
        variants={drawIn}
        transition={{ delay: 0.15 }}
        {...stroke(color, 2)}
        opacity="0.7"
      />
    </Svg>
  )
}

export function Strike({ color = RED, className = '' }) {
  return (
    <Svg className={className} viewBox="0 0 220 24">
      <motion.path d="M6 14 C70 8 150 18 214 9" variants={drawIn} {...stroke(color, 3)} />
    </Svg>
  )
}

export function Arrow({ color = RED, className = '' }) {
  return (
    <Svg className={className} viewBox="0 0 120 80">
      <motion.path d="M8 14 C44 26 78 44 104 64" variants={drawIn} {...stroke(color, 3)} />
      <motion.path d="M104 64 L84 60" variants={drawIn} transition={{ delay: 0.4 }} {...stroke(color, 3)} />
      <motion.path d="M104 64 L98 44" variants={drawIn} transition={{ delay: 0.5 }} {...stroke(color, 3)} />
    </Svg>
  )
}

export function Squiggle({ color = RED, className = '' }) {
  return (
    <Svg className={className} viewBox="0 0 220 30">
      <motion.path
        d="M6 16 C24 4 36 28 54 16 C72 4 84 28 102 16 C120 4 132 28 150 16 C168 4 180 28 198 16 C206 11 210 13 214 15"
        variants={drawIn}
        {...stroke(color, 2.5)}
      />
    </Svg>
  )
}

export function Spark({ color = RED, className = '' }) {
  return (
    <Svg className={className} viewBox="0 0 60 60">
      <motion.path d="M30 6 L30 22" variants={drawIn} {...stroke(color, 3)} />
      <motion.path d="M30 38 L30 54" variants={drawIn} transition={{ delay: 0.1 }} {...stroke(color, 3)} />
      <motion.path d="M6 30 L22 30" variants={drawIn} transition={{ delay: 0.2 }} {...stroke(color, 3)} />
      <motion.path d="M38 30 L54 30" variants={drawIn} transition={{ delay: 0.3 }} {...stroke(color, 3)} />
    </Svg>
  )
}

export function Bracket({ color = RED, className = '' }) {
  return (
    <Svg className={className} viewBox="0 0 40 120">
      <motion.path d="M30 8 C12 12 12 40 14 60 C12 80 12 108 30 112" variants={drawIn} {...stroke(color, 3)} />
    </Svg>
  )
}

export default { Circle, Underline, Strike, Arrow, Squiggle, Spark, Bracket }
