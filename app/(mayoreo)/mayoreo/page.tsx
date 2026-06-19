import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabase-server'
import HeroSection from '@/components/catalog/HeroSection'
import CategoriasSection from '@/components/catalog/CategoriasSection'
import ProductosDestacados from '@/components/catalog/ProductosDestacados'
import NosotrosSection from '@/components/catalog/NosotrosSection'
import { buildMetadata } from '@/lib/seo'
import { getSiteConfig, getSiteDescription, getSiteName } from '@/lib/site-config'
import { rethrowIfNextControlFlowError } from '@/lib/next-errors'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()
  const siteName = getSiteName(config)

  return buildMetadata({
    config,
    title: `Mayoreo — ${siteName}`,
    description:
      config.hero_subtitulo?.trim() ||
      `Catálogo al por mayor de ${getSiteDescription(config)}`,
    path: '/mayoreo',
  })
}

type ConteoRow = {
  categoria?: { slug?: string | null } | null
  producto_categorias?: { categoria?: { slug?: string | null } | null }[] | null
}

async function getMayoreoData() {
  const supabase = await createSupabaseServer()
  const [{ data: configData }, { data: categorias }, { data: destacados }, { data: conteoData }] =
    await Promise.all([
      supabase.from('configuracion').select('clave, valor'),
      supabase.from('categorias').select('*').eq('activa', true).order('orden').limit(8),
      supabase.from('productos').select('*, categoria:categorias(id,nombre,slug)')
        .eq('disponible', true).eq('destacado', true).order('orden').limit(8),
      supabase
        .from('productos')
        .select('categoria:categorias(slug), producto_categorias(categoria:categorias(slug))')
        .eq('disponible_mayoreo', true),
    ])

  return {
    configData,
    categorias: categorias ?? [],
    destacados: destacados ?? [],
    conteoData,
  }
}

export default async function MayoreoHomePage() {
  const config: Record<string, string> = {}
  const conteos: Record<string, number> = {}
  let categorias: Awaited<ReturnType<typeof getMayoreoData>>['categorias'] = []
  let destacados: Awaited<ReturnType<typeof getMayoreoData>>['destacados'] = []

  try {
    const data = await getMayoreoData()
    data.configData?.forEach(row => { config[row.clave] = row.valor })
    categorias = data.categorias
    destacados = data.destacados
    ;(data.conteoData as ConteoRow[] | null)?.forEach(row => {
      const slugs = new Set<string>()
      if (row.categoria?.slug) slugs.add(row.categoria.slug)
      row.producto_categorias?.forEach(pc => {
        if (pc.categoria?.slug) slugs.add(pc.categoria.slug)
      })
      slugs.forEach(slug => {
        conteos[slug] = (conteos[slug] || 0) + 1
      })
    })
  } catch (error) {
    rethrowIfNextControlFlowError(error)
    console.error('[MayoreoHomePage] Error cargando datos:', error)
  }

  return (
    <>
      <HeroSection
        titulo={config['hero_titulo'] || 'Tu ritual de belleza ideal'}
        subtitulo={config['hero_subtitulo'] || 'Productos profesionales para cada tipo de cabello y piel.'}
        categorias={categorias || []}
        catalogType="mayoreo"
      />
      <CategoriasSection categorias={categorias || []} conteos={conteos} catalogType="mayoreo" />
      <ProductosDestacados productos={destacados || []} catalogType="mayoreo" />
      <NosotrosSection
        texto={config['texto_nosotros'] || ''}
        whatsapp={config['whatsapp_numero'] || '573185867702'}
        nombreNegocio={config['nombre_negocio'] || 'Tienda VM Fashion'}
      />
    </>
  )
}
