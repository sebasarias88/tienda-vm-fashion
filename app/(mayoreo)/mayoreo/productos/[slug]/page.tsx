import { createSupabaseServer } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import ProductoDetalle from '@/components/catalog/ProductoDetalle'
import ProductosRelacionados from '@/components/catalog/ProductosRelacionados'
import { normalizarVariacionesProducto } from '@/lib/variaciones'
import { VariacionTipo } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('productos')
    .select('nombre, descripcion')
    .eq('slug', slug)
    .single()

  if (!data) return { title: 'Producto no encontrado' }

  return {
    title: `${data.nombre} — Mayoreo — Tienda VM Fashion`,
    description: data.descripcion || `${data.nombre} disponible en catálogo al por mayor`,
  }
}

export default async function MayoreoProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServer()

  const { data: producto, error } = await supabase
    .from('productos')
    .select('*, categoria:categorias(id,nombre,slug)')
    .eq('slug', slug)
    .single()

  if (error || !producto) notFound()

  const { data: relacionados } = await supabase
    .from('productos')
    .select('*, categoria:categorias(id,nombre,slug)')
    .eq('categoria_id', producto.categoria_id)
    .eq('disponible', true)
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

  return (
    <>
      <ProductoDetalle
        producto={producto}
        catalogType="mayoreo"
        variaciones={variaciones}
      />
      {relacionados && relacionados.length > 0 && (
        <ProductosRelacionados productos={relacionados} catalogType="mayoreo" />
      )}
    </>
  )
}
