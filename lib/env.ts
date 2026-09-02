const SUPABASE_ENV_HINT =
  'Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel → Project → Settings → Environment Variables ' +
  '(Production and Preview), then redeploy. Values: Supabase → Project Settings → API.'

function readEnv(name: string, legacyName?: string): string | undefined {
  const value = process.env[name]?.trim()
  if (value) return value
  if (legacyName) return process.env[legacyName]?.trim()
  return undefined
}

export function getSupabaseUrl(): string {
  const url = readEnv('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL')
  if (!url) {
    throw new Error(`Missing SUPABASE_URL. ${SUPABASE_ENV_HINT}`)
  }
  return url
}

export function getSupabaseAnonKey(): string {
  const anonKey = readEnv('SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!anonKey) {
    throw new Error(`Missing SUPABASE_ANON_KEY. ${SUPABASE_ENV_HINT}`)
  }
  return anonKey
}

export function getSupabaseEnv(): { url: string; anonKey: string } {
  return {
    url: getSupabaseUrl(),
    anonKey: getSupabaseAnonKey(),
  }
}

export function getSiteUrl(): string {
  const fromEnv = readEnv('SITE_URL', 'NEXT_PUBLIC_SITE_URL')?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
