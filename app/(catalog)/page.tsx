import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabase-server'
import HeroSection from '@/components/catalog/HeroSection'
import CategoriasSection from '@/components/catalog/CategoriasSection'
import ProductosDestacados from '@/components/catalog/ProductosDestacados'
import NosotrosSection from '@/components/catalog/NosotrosSection'
import ProcesoPedido from '@/components/catalog/ProcesoPedido'
import { buildMetadata } from '@/lib/seo'
import { getSiteConfig, getSiteDescription, getSiteName } from '@/lib/site-config'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()
  const siteName = getSiteName(config)
  const heroTitle = config.hero_titulo?.trim()

  return buildMetadata({
    config,
    title: heroTitle || siteName,
    description:
      config.hero_subtitulo?.trim() ||
      getSiteDescription(config),
    path: '/',
  })
}

export default async function HomePage() {
  const supabase = await createSupabaseServer()

  const [{ data: configData }, { data: categorias }, { data: destacados }] =
    await Promise.all([
      supabase.from('configuracion').select('clave, valor'),
      supabase.from('categorias').select('*').eq('activa', true).order('orden').limit(8),
      supabase.from('productos').select('*, categoria:categorias(id,nombre,slug)')
        .eq('disponible', true).eq('destacado', true).order('orden').limit(8),
    ])

  const config: Record<string, string> = {}
  configData?.forEach(row => { config[row.clave] = row.valor })

  return (
    <>
      <HeroSection
        titulo={config['hero_titulo'] || 'Tu ritual de belleza ideal'}
        subtitulo={config['hero_subtitulo'] || 'Productos profesionales para cada tipo de cabello y piel.'}
        categorias={categorias || []}
      />
      <CategoriasSection categorias={categorias || []} />
      <ProductosDestacados productos={destacados || []} />
      <NosotrosSection
        texto={config['texto_nosotros'] || ''}
        whatsapp={config['whatsapp_numero'] || '573185867702'}
        nombreNegocio={config['nombre_negocio'] || 'Tienda VM Fashion'}
      />
      <ProcesoPedido />
    </>
  )
}