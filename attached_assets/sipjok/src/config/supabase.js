import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================================================
// DEVELOPMENT CONFIGURATION
// ============================================================================

// Security: Always null to prevent hardcoded user IDs
export const DEV_AUTO_LOGIN = null

// ============================================================================
// AUTHENTICATION HELPER - FIXED FOR PRODUCTION
// ============================================================================

/**
 * Get current authenticated user ID
 * ONLY returns real authenticated user ID
 */
export const getCurrentUserId = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.error('❌ Authentication required. Please log in.')
      throw new Error('User not authenticated. Please log in to continue.')
    }

    return user.id
  } catch (err) {
    console.error('Error getting user ID:', err)
    throw new Error('Authentication required. Please log in to continue.')
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  } catch {
    return false
  }
}

/**
 * Sign in with email and password
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

/**
 * Sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export default supabase
