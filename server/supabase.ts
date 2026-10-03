import { createClient } from '@supabase/supabase-js';

// Check if Supabase credentials are set
if (!process.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL environment variable is not set');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
}

// Create Supabase admin client for server-side operations
// This client has elevated privileges and can verify JWT tokens
export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Log successful initialization (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Supabase admin client initialized');
}
