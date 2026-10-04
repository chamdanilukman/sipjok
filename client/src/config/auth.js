import { api } from '../lib/api'

/**
 * Internal authentication helpers (JWT issued by the Express backend).
 * Replaces the old Supabase Auth client - same function names, so call
 * sites in Login/ProtectedRoute/Header stay familiar.
 *
 * The `users.username` column is the login identity and holds the email.
 */

/**
 * Sign in with email + password.
 * Stores the JWT in localStorage and returns { user } like before.
 */
export const signIn = async (email, password) => {
  const data = await api.post('/auth/login', { email, password })
  if (!data?.token) throw new Error('Respons login tidak valid')
  api.setToken(data.token)
  return { user: data.user }
}

/**
 * Sign out - just drops the local token.
 */
export const signOut = async () => {
  api.clearToken()
}

/**
 * Check whether we hold a session token.
 */
export const isAuthenticated = async () => {
  return api.isAuthenticated()
}

/**
 * Get the current user id from the stored JWT (payload `sub` claim).
 */
export const getCurrentUserId = async () => {
  const token = api.getToken()
  if (!token) throw new Error('User not authenticated. Please log in to continue.')
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload?.sub) throw new Error('Invalid token payload')
    return payload.sub
  } catch {
    api.clearToken()
    throw new Error('User not authenticated. Please log in to continue.')
  }
}

/**
 * Get the current user's email (JWT `username` claim).
 */
export const getCurrentUserEmail = async () => {
  const token = api.getToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload?.username || null
  } catch {
    return null
  }
}

export default { signIn, signOut, isAuthenticated, getCurrentUserId, getCurrentUserEmail }
