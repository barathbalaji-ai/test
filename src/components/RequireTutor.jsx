// Blocks learners from tutor-only surfaces.
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function RequireTutor({ children }) {
  const { isTutor } = useAuth()
  if (!isTutor) return <Navigate to="/" replace />
  return children
}
