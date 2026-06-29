// App shell: atmosphere + cursor, then either the Landing (no session) or the
// Site (nav + routes + footer + NoteMaker). HashRouter works on any static host.
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './lib/auth.jsx'
import PaperTexture from './components/PaperTexture.jsx'
import Cursor from './components/Cursor.jsx'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import NoteMaker from './components/NoteMaker.jsx'
import RequireTutor from './components/RequireTutor.jsx'
import Landing from './pages/Landing.jsx'
import Home from './pages/Home.jsx'
import Courses from './pages/Courses.jsx'
import Posters from './pages/Posters.jsx'
import Articles from './pages/Articles.jsx'
import Calendar from './pages/Calendar.jsx'
import Studio from './pages/Studio.jsx'
import Analytics from './pages/Analytics.jsx'
import FormRunner from './pages/FormRunner.jsx'

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
            <Route path="/courses" element={<Page><Courses /></Page>} />
            <Route path="/posters" element={<Page><Posters /></Page>} />
            <Route path="/articles" element={<Page><Articles /></Page>} />
            <Route path="/calendar" element={<Page><Calendar /></Page>} />
            <Route path="/studio" element={<RequireTutor><Page><Studio /></Page></RequireTutor>} />
            <Route path="/analytics" element={<RequireTutor><Page><Analytics /></Page></RequireTutor>} />
            <Route path="/form/:id" element={<Page><FormRunner /></Page>} />
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
  const { session } = useAuth()
  return session ? <Site /> : <Landing />
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <PaperTexture />
        <Cursor />
        <Gate />
      </HashRouter>
    </AuthProvider>
  )
}
