import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from '@/lib/env'

/**
 * Cliente anónimo sin cookies — apto para lecturas públicas cacheables
 * (`revalidate` / ISR) sin forzar dynamic por sesión.
 */
export function createSupabasePublic(): SupabaseClient {
  const { url, anonKey } = getSupabaseEnv()
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/** Hostname del proyecto Supabase (para next/image remotePatterns). */
export function getSupabaseHostname(): string | null {
  try {
    const { url } = getSupabaseEnv()
    return new URL(url).hostname
  } catch {
    return null
  }
}
