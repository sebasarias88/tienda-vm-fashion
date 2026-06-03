import { createSupabaseServer } from '@/lib/supabase-server'
import ProductosClient from '@/components/catalog/ProductosClient'

export default async function MayoreoProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>
}) {
  const { q, categoria } = await searchParams
  const supabase = await createSupabaseServer()

  const [{ data: categorias }, { data: productos }] = await Promise.all([
    supabase
      .from('categorias')
      .select('*, subcategorias:categorias!padre_id(*)')
      .is('padre_id', null)
      .eq('activa', true)
      .order('orden'),
    supabase
      .from('productos')
      .select('*, categoria:categorias(id,nombre,slug,padre_id)')
      .order('orden', { ascending: true }),
  ])

  return (
    <ProductosClient
      productos={productos || []}
      categorias={categorias || []}
      initialQ={q || ''}
      initialCategoria={categoria || ''}
      catalogType="mayoreo"
    />
  )
}
