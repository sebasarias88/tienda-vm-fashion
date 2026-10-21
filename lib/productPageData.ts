import { cache } from 'react'
import { createSupabasePublic } from '@/lib/supabase-public'
import { productoVisibleColumn, type CatalogType } from '@/lib/catalog'
import { PRODUCTO_DETAIL_SELECT, PRODUCTO_SHELF_SELECT } from '@/lib/productQueries'
import { withProductoCategorias } from '@/lib/producto-categorias'
import { mapShelfProductos } from '@/lib/mapShelfProductos'
import { normalizarVariacionesProducto } from '@/lib/variaciones'
import type { Producto, ProductoSeccion, VariacionTipo } from '@/types'

export type ProductPageData = {
  producto: Producto
  relacionados: Producto[]
  variaciones: VariacionTipo[]
  secciones: ProductoSeccion[]
}

/**
 * Everything the product detail page needs, using the cookie-less public client
 * so the page can be statically cached (ISR) instead of hitting the DB on every view.
 * React.cache dedupes the call between generateMetadata and the page in one render.
 */
export const getProductPageData = cache(
  async (slug: string, catalogType: CatalogType): Promise<ProductPageData | null> => {
    const supabase = createSupabasePublic()
    const visibleColumn = productoVisibleColumn(catalogType)

    const { data: productoRaw, error } = await supabase
      .from('productos')
      .select(PRODUCTO_DETAIL_SELECT)
      .eq('slug', slug)
      .eq(visibleColumn, true)
      .maybeSingle()

    if (error || !productoRaw) return null

    const [producto] = withProductoCategorias([productoRaw as Producto])

    const relacionadosQuery = producto.categoria_id
      ? supabase
          .from('productos')
          .select(PRODUCTO_SHELF_SELECT)
          .eq('categoria_id', producto.categoria_id)
          .eq(visibleColumn, true)
          .neq('id', producto.id)
          .limit(4)
      : Promise.resolve({ data: [] as unknown[] })

    const [{ data: relacionados }, { data: variacionesRaw }, { data: secciones }] =
      await Promise.all([
        relacionadosQuery,
        supabase
          .from('variacion_tipos')
          .select('*, opciones:variacion_opciones(*)')
          .eq('producto_id', producto.id)
          .order('orden', { ascending: true }),
        supabase
          .from('producto_secciones')
          .select('*')
          .eq('producto_id', producto.id)
          .order('orden', { ascending: true }),
      ])

    return {
      producto,
      relacionados: mapShelfProductos((relacionados || []) as unknown as Producto[]),
      variaciones: normalizarVariacionesProducto((variacionesRaw || []) as VariacionTipo[]),
      secciones: (secciones || []) as ProductoSeccion[],
    }
  },
)
