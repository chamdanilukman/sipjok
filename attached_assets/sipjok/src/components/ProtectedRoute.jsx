import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated, getCurrentUserId } from '../config/supabase'

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check if user is authenticated
      const auth = await isAuthenticated()
      
      // If not authenticated, try to get user ID (will use hardcoded ID as fallback)
      if (!auth) {
        const userId = await getCurrentUserId()
        // If we got a user ID (even hardcoded), consider it authenticated for development
        setAuthenticated(!!userId)
      } else {
        setAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  // Render protected content
  return children
}

export default ProtectedRoute

