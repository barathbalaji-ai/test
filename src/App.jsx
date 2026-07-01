// App shell: atmosphere + cursor, then either the Launch gate (no session) or
// the Site (nav + routes + footer + NoteMaker). HashRouter works on any static
// host. Pure frontend — content is read from published Google Sheets (see
// src/config/sources.js); there is no backend or login.
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { GateProvider, useGate } from './lib/gate.jsx'
import PaperTexture from './components/PaperTexture.jsx'
import Cursor from './components/Cursor.jsx'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import NoteMaker from './components/NoteMaker.jsx'
import Launch from './pages/Launch.jsx'
import Home from './pages/Home.jsx'
import Videos from './pages/Videos.jsx'
import Posters from './pages/Posters.jsx'
import Articles from './pages/Articles.jsx'
import Calendar from './pages/Calendar.jsx'
import Completion from './pages/Completion.jsx'

function Page({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  )
}

function Site() {
  const location = useLocation()
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <Nav />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/videos" element={<Page><Videos /></Page>} />
            <Route path="/posters" element={<Page><Posters /></Page>} />
            <Route path="/articles" element={<Page><Articles /></Page>} />
            <Route path="/calendar" element={<Page><Calendar /></Page>} />
            <Route path="/completion" element={<Page><Completion /></Page>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
      <NoteMaker />
    </div>
  )
}

function Gate() {
  const { session } = useGate()
  return session ? <Site /> : <Launch />
}

export default function App() {
  return (
    <GateProvider>
      <HashRouter>
        <PaperTexture />
        <Cursor />
        <Gate />
      </HashRouter>
    </GateProvider>
  )
}
