import type { Metadata } from 'next'
import HeroBanner from '@/components/catalog/HeroBanner'
import PromoStrip from '@/components/catalog/PromoStrip'
import CategoriasGrid from '@/components/catalog/CategoriasGrid'
import ProductosDestacados from '@/components/catalog/ProductosDestacados'
import ProductosOfertas from '@/components/catalog/ProductosOfertas'
import ProductosNovedades from '@/components/catalog/ProductosNovedades'
import TestimoniosSection from '@/components/catalog/TestimoniosSection'
import NosotrosSection from '@/components/catalog/NosotrosSection'
import ProcesoPedido from '@/components/catalog/ProcesoPedido'
import { buildMetadata } from '@/lib/seo'
import { getSiteConfig, getSiteName, normalizeSeoDescription } from '@/lib/site-config'
import { getCategoriasActivas } from '@/lib/catalog-data'
import { createSupabasePublic } from '@/lib/supabase-public'
import { PRODUCTO_SHELF_SELECT } from '@/lib/productQueries'
import { mapShelfProductos } from '@/lib/mapShelfProductos'
import { rethrowIfNextControlFlowError } from '@/lib/next-errors'
import type { Banner, Producto, Promocion } from '@/types'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()
  const siteName = getSiteName(config)

  const mayoreoDesc = (() => {
    const raw = normalizeSeoDescription(config.mayoreo_titulo)
    if (!raw || /mayoreo/i.test(raw)) return ''
    return raw
  })()

  return buildMetadata({
    config,
    title: 'Catálogo mayorista',
    description:
      mayoreoDesc ||
      normalizeSeoDescription(config.seo_descripcion) ||
      `Catálogo mayorista de belleza y cuidado capilar en ${siteName}. Precios por volumen, envíos a Colombia y pedidos por WhatsApp.`,
    path: '/mayorista',
  })
}

function uniqueById(items: Producto[]) {
  const seen = new Set<string>()
  return items.filter(p => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
}

export default async function MayoreoHomePage() {
  const config = await getSiteConfig()
  let banners: Banner[] = []
  let promociones: Promocion[] = []
  let categorias = await getCategoriasActivas().catch(() => [])
  let destacados: Producto[] = []
  let ofertas: Producto[] = []
  let novedades: Producto[] = []

  try {
    const supabase = createSupabasePublic()

    const [
      { data: bannersData },
      { data: promocionesData },
      { data: destacadosData },
      { data: ofertasData },
      { data: novedadesData },
    ] = await Promise.all([
      supabase.from('banners').select('*').eq('activo', true).order('orden'),
      supabase.from('promociones').select('*').eq('activa', true).order('orden'),
      supabase
        .from('productos')
        .select(PRODUCTO_SHELF_SELECT)
        .eq('destacado', true)
        .order('orden')
        .limit(10),
      supabase
        .from('productos')
        .select(PRODUCTO_SHELF_SELECT)
        .not('precio_antes_mayoreo', 'is', null)
        .order('orden')
        .limit(10),
      supabase
        .from('productos')
        .select(PRODUCTO_SHELF_SELECT)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    banners = (bannersData as Banner[] | null) || []
    promociones = (promocionesData as Promocion[] | null) || []
    destacados = mapShelfProductos(destacadosData as Producto[] | null)
    ofertas = mapShelfProductos(
      ((ofertasData as Producto[] | null) || []).filter(p => {
        const antes = p.precio_antes_mayoreo
        const actual = p.precio_mayoreo ?? p.precio
        return antes != null && actual != null && antes > actual
      }),
    )
    const destacadosIds = new Set(destacados.map(p => p.id))
    novedades = uniqueById(mapShelfProductos(novedadesData as Producto[] | null))
      .filter(p => !destacadosIds.has(p.id))
      .slice(0, 10)
  } catch (error) {
    rethrowIfNextControlFlowError(error)
    console.error('[MayoreoHomePage] Error cargando datos:', error)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <HeroBanner banners={banners} config={config} catalogType="mayoreo" />
      <ProductosDestacados productos={destacados} catalogType="mayoreo" />
      <PromoStrip promociones={promociones} />
      <CategoriasGrid categorias={categorias} catalogType="mayoreo" />
      <ProductosNovedades productos={novedades} catalogType="mayoreo" />
      <ProductosOfertas productos={ofertas} catalogType="mayoreo" />
      <TestimoniosSection />
      <NosotrosSection
        texto={config['texto_nosotros'] || ''}
        whatsapp={config['whatsapp_numero'] || '573185867702'}
        nombreNegocio={config['nombre_negocio'] || 'Tienda VM Fashion'}
        catalogType="mayoreo"
      />
      <ProcesoPedido />
    </div>
  )
}
