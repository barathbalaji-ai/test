import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Background from './components/Background.jsx'
import LaunchGate from './components/LaunchGate.jsx'
import Universe from './components/Universe.jsx'

// There are no pages — only the world. Routes exist solely so locations can
// be shared; opening one flies the camera there (doc §2).
export default function App() {
  return (
    <BrowserRouter>
      <Background />
      <LaunchGate>
        <Routes>
          <Route path="/node/:id" element={<Universe />} />
          <Route path="*" element={<Universe />} />
        </Routes>
      </LaunchGate>
    </BrowserRouter>
  )
}
