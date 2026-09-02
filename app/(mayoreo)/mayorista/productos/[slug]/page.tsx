import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import ProductoDetalle from '@/components/catalog/ProductoDetalle'
import ProductosRelacionados from '@/components/catalog/ProductosRelacionados'
import ProductPageSeo from '@/components/seo/ProductPageSeo'
import { normalizarVariacionesProducto } from '@/lib/variaciones'
import { PRODUCTO_DETAIL_SELECT, PRODUCTO_SHELF_SELECT } from '@/lib/productQueries'
import { withProductoCategorias } from '@/lib/producto-categorias'
import { mapShelfProductos } from '@/lib/mapShelfProductos'
import { buildProductMetadata } from '@/lib/seo'
import { getSiteConfig } from '@/lib/site-config'
import { Producto, ProductoSeccion, VariacionTipo } from '@/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  const config = await getSiteConfig()

  const { data } = await supabase
    .from('productos')
    .select('nombre, descripcion, imagenes, slug')
    .eq('slug', slug)
    .single()

  if (!data) {
    return { title: 'Producto no encontrado', robots: { index: false, follow: false } }
  }

  return buildProductMetadata(config, data, 'mayoreo')
}

export default async function MayoreoProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  const config = await getSiteConfig()

  const { data: productoRaw, error } = await supabase
    .from('productos')
    .select(PRODUCTO_DETAIL_SELECT)
    .eq('slug', slug)
    .single()

  if (error || !productoRaw) notFound()

  const [producto] = withProductoCategorias([productoRaw as Producto])

  const { data: relacionados } = await supabase
    .from('productos')
    .select(PRODUCTO_SHELF_SELECT)
    .eq('categoria_id', producto.categoria_id)
    .neq('id', producto.id)
    .limit(4)

  const { data: variacionesRaw } = await supabase
    .from('variacion_tipos')
    .select('*, opciones:variacion_opciones(*)')
    .eq('producto_id', producto.id)
    .order('orden', { ascending: true })

  const variaciones = normalizarVariacionesProducto(
    (variacionesRaw || []) as VariacionTipo[],
  )

  const { data: secciones } = await supabase
    .from('producto_secciones')
    .select('*')
    .eq('producto_id', producto.id)
    .order('orden', { ascending: true })

  return (
    <>
      <ProductPageSeo
        config={config}
        producto={producto}
        catalogType="mayoreo"
        variaciones={variaciones}
      />
      <ProductoDetalle
        producto={producto}
        catalogType="mayoreo"
        variaciones={variaciones}
        secciones={(secciones || []) as ProductoSeccion[]}
      />
      {relacionados && relacionados.length > 0 && (
        <ProductosRelacionados
          productos={mapShelfProductos(relacionados as unknown as Producto[])}
          catalogType="mayoreo"
        />
      )}
    </>
  )
}
