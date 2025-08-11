import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key:', supabaseAnonKey?.substring(0, 20) + '...')
}

// Provide fallback values to prevent build/runtime errors
// Real values must be set in Vercel environment variables
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key')
  
  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('Supabase configured:', isConfigured)
    if (!isConfigured) {
      console.log('Current URL:', supabaseUrl)
      console.log('Current Key exists:', !!supabaseAnonKey)
    }
  }
  
  return isConfigured
}