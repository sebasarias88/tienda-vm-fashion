import { cache } from 'react'
import { createSupabasePublic } from '@/lib/supabase-public'
import type { Categoria } from '@/types'
import { productoVisibleColumn, type CatalogType } from '@/lib/catalog'

/** Árbol de categorías activas — dedupe por request vía React.cache. */
export const getCategoriasActivas = cache(async (): Promise<Categoria[]> => {
  const supabase = createSupabasePublic()
  const { data } = await supabase
    .from('categorias')
    .select('*, subcategorias:categorias!padre_id(*)')
    .is('padre_id', null)
    .eq('activa', true)
    .order('orden')
    .order('orden', { referencedTable: 'subcategorias' })

  return ((data as Categoria[] | null) ?? []).map(raiz => ({
    ...raiz,
    subcategorias: [...(raiz.subcategorias || [])]
      .filter(s => s.activa !== false)
      .sort((a, b) => a.orden - b.orden),
  }))
})

/** Marcas distintas de productos visibles en el catálogo — dedupe por request vía React.cache. */
export const getMarcasDisponibles = cache(async (catalogType: CatalogType = 'detal'): Promise<string[]> => {
  const supabase = createSupabasePublic()
  const { data } = await supabase
    .from('productos')
    .select('marca')
    .eq(productoVisibleColumn(catalogType), true)
    .not('marca', 'is', null)

  const set = new Set<string>()
  ;(data || []).forEach((r: { marca: string | null }) => {
    if (r.marca) set.add(r.marca)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
})
