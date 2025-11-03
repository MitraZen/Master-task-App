// Environment validation
export function validateEnvironment() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(', ')}`)
    return false
  }
  
  return true
}

// Check if we're in production
export const isProduction = process.env.NODE_ENV === 'production'

// Database connection status
export function getDatabaseStatus() {
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return {
    isConnected: hasSupabaseUrl && hasSupabaseKey,
    hasUrl: hasSupabaseUrl,
    hasKey: hasSupabaseKey
  }
}
