import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const requestedRoute = `${location.pathname}${location.search}${location.hash}`
  return isAuthenticated ? <Outlet /> : <Navigate to={`/login?from=${encodeURIComponent(requestedRoute)}`} replace />
}
