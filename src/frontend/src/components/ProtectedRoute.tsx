/**
 * GREEN-104: Protected route component
 * Redirects unauthenticated users to login page
 */
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import LoadingSpinner from './ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
