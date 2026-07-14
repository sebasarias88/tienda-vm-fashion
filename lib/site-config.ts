import { cache } from 'react'
import { createSupabaseServer } from '@/lib/supabase-server'

export type SiteConfigMap = Record<string, string>

export const getSiteConfig = cache(async (): Promise<SiteConfigMap> => {
  try {
    const supabase = await createSupabaseServer()
    const { data } = await supabase.from('configuracion').select('clave, valor')
    const config: SiteConfigMap = {}
    data?.forEach(row => {
      config[row.clave] = row.valor
    })
    return config
  } catch {
    return {}
  }
})

export function getSiteName(config: SiteConfigMap): string {
  return config.nombre_negocio?.trim() || 'Tienda VM Fashion'
}

export function getSiteDescription(config: SiteConfigMap): string {
  return (
    config.seo_descripcion?.trim() ||
    config.hero_subtitulo?.trim() ||
    'Productos de belleza y cuidado capilar en Carrera 15 #19-25 Local 8, Armenia, Quindío. Envíos a toda Colombia.'
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
    'VM Fashion',
    'Armenia',
    'Quindío',
    'Colombia',
  ]
}

