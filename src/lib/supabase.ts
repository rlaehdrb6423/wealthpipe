import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env variable: ${name}`)
  return value
}

let _anonClient: SupabaseClient | null = null

export function getAnonClient(): SupabaseClient {
  if (!_anonClient) {
    _anonClient = createClient(
      getEnv('NEXT_PUBLIC_SUPABASE_URL'),
      getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    )
  }
  return _anonClient
}

let _serviceClient: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
  if (!_serviceClient) {
    _serviceClient = createClient(
      getEnv('NEXT_PUBLIC_SUPABASE_URL'),
      getEnv('SUPABASE_SERVICE_ROLE_KEY')
    )
  }
  return _serviceClient
}
