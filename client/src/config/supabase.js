import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we have valid Supabase configuration
const hasValidConfig = supabaseUrl && supabaseAnonKey

// Create mock client for development/testing when Supabase is not configured
const createMockClient = () => ({
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ 
      data: null, 
      error: { message: 'Supabase not configured. This is a demo environment.' }
    }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
      }),
    }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
  }),
})

// Export either real Supabase client or mock client
export const supabase = hasValidConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient()

// Flag to indicate if using mock mode
export const IS_MOCK_MODE = !hasValidConfig

// Display warning in console if using mock mode
if (IS_MOCK_MODE) {
  console.warn('⚠️  Supabase is not configured. Running in mock mode for UI testing.')
  console.warn('   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable full functionality.')
}

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
