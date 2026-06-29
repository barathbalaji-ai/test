// Carta wordmark (italic Playfair) + a small red blinking ink dot.
// QuillMark = hand-drawn quill + ink-drop, reused in nav badge, footer, seam.

export function QuillMark({ className = '', drop = '#E0382B' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M12 38 C24 30 33 19 40 8 C33 22 23 32 14 38 Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path d="M14 38 L38 11" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path d="M9 41 L18 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="39" cy="40" r="3.4" fill={drop} />
    </svg>
  )
}

export default function Logo({ className = '', dot = true, size = 'text-2xl' }) {
  return (
    <span className={`inline-flex items-baseline font-display italic font-bold tracking-tightest ${size} ${className}`}>
      Carta
      {dot && (
        <span
          className="ml-0.5 inline-block w-[0.28em] h-[0.28em] rounded-full bg-marker translate-y-[-0.05em]"
          style={{ animation: 'carta-blink 1.6s steps(2, end) infinite' }}
        />
      )}
      <style>{`@keyframes carta-blink { 0%,55% { opacity: 1 } 56%,100% { opacity: 0.15 } }`}</style>
    </span>
  )
}
