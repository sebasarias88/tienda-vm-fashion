import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createSupabasePublic } from '@/lib/supabase-public'

export type SiteConfigMap = Record<string, string>

/**
 * Shared across requests for 60s (Next data cache) so dynamic pages don't query
 * `configuracion` on every visit. Errors are thrown (never cached) and handled below.
 */
const fetchSiteConfig = unstable_cache(
  async (): Promise<SiteConfigMap> => {
    const supabase = createSupabasePublic()
    const { data, error } = await supabase.from('configuracion').select('clave, valor')
    if (error) throw error
    const config: SiteConfigMap = {}
    data?.forEach(row => {
      config[row.clave] = row.valor
    })
    return config
  },
  ['site-config'],
  { revalidate: 60, tags: ['site-config'] },
)

export const getSiteConfig = cache(async (): Promise<SiteConfigMap> => {
  try {
    return await fetchSiteConfig()
  } catch {
    return {}
  }
})

export function getSiteName(config: SiteConfigMap): string {
  return config.nombre_negocio?.trim() || 'Tienda VM Fashion'
}

export function getSiteDescription(config: SiteConfigMap): string {
  const seo = normalizeSeoDescription(config.seo_descripcion)
  const hero = normalizeSeoDescription(config.hero_subtitulo)
  const clean = (text?: string) => (text && !/ritual/i.test(text) ? text : '')
  return (
    clean(seo) ||
    clean(hero) ||
    'Belleza y cuidado capilar en Armenia, Quindío. Catálogo detal con envíos a todo Colombia, asesoría por WhatsApp y pago fácil con Addi o Sistecrédito.'
  )
}

/** Corrige frases pegadas sin espacio (típico de marquees indexados mal). */
export function normalizeSeoDescription(raw?: string | null): string {
  const text = raw?.trim()
  if (!text) return ''

  return (
    text
      // "ColombiaAsesoría" → "Colombia. Asesoría"
      .replace(/([a-záéíóúñü0-9])([A-ZÁÉÍÓÚÑÜ])/g, '$1. $2')
      // Colapsa espacios raros
      .replace(/\s+/g, ' ')
      .replace(/\.\s*\./g, '.')
      .trim()
  )
}

export function getSiteKeywords(config: SiteConfigMap): string[] {
  const raw = config.seo_keywords?.trim()
  if (raw) {
    return raw.split(',').map(s => s.trim()).filter(Boolean)
  }
  return [
    'belleza',
    'cuidado capilar',
    'cosmética',
    'catálogo detal',
    'VM Fashion',
    'Armenia',
    'Quindío',
    'Colombia',
  ]
}

