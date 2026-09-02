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
import {
  getSiteConfig,
  getSiteDescription,
  normalizeSeoDescription,
} from '@/lib/site-config'
import { getCategoriasActivas } from '@/lib/catalog-data'
import { createSupabasePublic } from '@/lib/supabase-public'
import { PRODUCTO_SHELF_SELECT } from '@/lib/productQueries'
import { mapShelfProductos } from '@/lib/mapShelfProductos'
import { rethrowIfNextControlFlowError } from '@/lib/next-errors'
import type { Banner, Producto, Promocion } from '@/types'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()

  return buildMetadata({
    config,
    title: 'Catálogo detal',
    description:
      normalizeSeoDescription(config.seo_descripcion) ||
      getSiteDescription(config),
    path: '/',
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

export default async function HomePage() {
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
        .not('precio_antes', 'is', null)
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
      ((ofertasData as Producto[] | null) || []).filter(
        p => p.precio_antes != null && p.precio_antes > p.precio,
      ),
    )
    const destacadosIds = new Set(destacados.map(p => p.id))
    novedades = uniqueById(mapShelfProductos(novedadesData as Producto[] | null))
      .filter(p => !destacadosIds.has(p.id))
      .slice(0, 10)
  } catch (error) {
    rethrowIfNextControlFlowError(error)
    console.error('[HomePage] Error cargando datos:', error)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <HeroBanner banners={banners} config={config} />
      <ProductosDestacados productos={destacados} />
      <PromoStrip promociones={promociones} />
      <CategoriasGrid categorias={categorias} />
      <ProductosNovedades productos={novedades} />
      <ProductosOfertas productos={ofertas} />
      <TestimoniosSection />
      <NosotrosSection
        texto={config['texto_nosotros'] || ''}
        whatsapp={config['whatsapp_numero'] || '573185867702'}
        nombreNegocio={config['nombre_negocio'] || 'Tienda VM Fashion'}
      />
      <ProcesoPedido />
    </div>
  )
}
