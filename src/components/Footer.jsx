import { Link } from 'react-router-dom'
import Logo, { QuillMark } from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="section-dark mt-24">
      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-chalk">
            <QuillMark className="w-8 h-8" />
            <Logo className="text-chalk" />
          </div>
          <p className="mt-4 text-sm text-chalk/70 max-w-xs font-hand text-lg leading-snug">
            The craft of great support, written by hand.
          </p>
        </div>
        <div>
          <div className="eyebrow text-stone">Rooms</div>
          <ul className="mt-3 space-y-2 text-sm text-chalk/80">
            <li><Link to="/courses" className="hover:text-marker" data-cursor="link">Courses</Link></li>
            <li><Link to="/posters" className="hover:text-marker" data-cursor="link">Posters</Link></li>
            <li><Link to="/articles" className="hover:text-marker" data-cursor="link">Articles</Link></li>
            <li><Link to="/calendar" className="hover:text-marker" data-cursor="link">Calendar</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow text-stone">About</div>
          <p className="mt-3 text-sm text-chalk/70 leading-relaxed">
            Carta is the learning home for Customer Support — a handbook you can mark up.
            Client-side demo; data persists in your browser.
          </p>
        </div>
      </div>
      <div className="border-t border-chalk/10">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-chalk/50">
            © {new Date().getFullYear()} Carta · Customer Support Learning Portal
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-chalk/50">
            Relearn · Repeat · Resolve
          </span>
        </div>
      </div>
    </footer>
  )
}
