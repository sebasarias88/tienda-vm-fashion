import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createSupabasePublic } from '@/lib/supabase-public'
import type { Categoria } from '@/types'
import { productoVisibleColumn, type CatalogType } from '@/lib/catalog'

/** Árbol de categorías activas — dedupe por request vía React.cache. */
const fetchCategoriasActivas = unstable_cache(
  async (): Promise<Categoria[]> => {
  const supabase = createSupabasePublic()
  const { data, error } = await supabase
    .from('categorias')
    .select('*, subcategorias:categorias!padre_id(*)')
    .is('padre_id', null)
    .eq('activa', true)
    .order('orden')
    .order('orden', { referencedTable: 'subcategorias' })
  if (error) throw error

  return ((data as Categoria[] | null) ?? []).map(raiz => ({
    ...raiz,
    subcategorias: [...(raiz.subcategorias || [])]
      .filter(s => s.activa !== false)
      .sort((a, b) => a.orden - b.orden),
  }))
  },
  ['categorias-activas'],
  { revalidate: 60, tags: ['categorias'] },
)

/** Active category tree — cached 60s across requests, deduped per request. */
export const getCategoriasActivas = cache(() => fetchCategoriasActivas())

/** Marcas distintas de productos visibles en el catálogo — dedupe por request vía React.cache. */
const fetchMarcasDisponibles = unstable_cache(
  async (catalogType: CatalogType): Promise<string[]> => {
  const supabase = createSupabasePublic()
  const { data, error } = await supabase
    .from('productos')
    .select('marca')
    .eq(productoVisibleColumn(catalogType), true)
    .not('marca', 'is', null)
  if (error) throw error

  const set = new Set<string>()
  ;(data || []).forEach((r: { marca: string | null }) => {
    if (r.marca) set.add(r.marca)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
  },
  ['marcas-disponibles'],
  { revalidate: 60, tags: ['productos'] },
)

/** Brands visible in a catalog — cached 60s across requests, deduped per request. */
export const getMarcasDisponibles = cache(
  async (catalogType: CatalogType = 'detal'): Promise<string[]> => {
    try {
      return await fetchMarcasDisponibles(catalogType)
    } catch {
      return []
    }
  },
)

/** Flattens the active category tree (roots + subcategories). */
export function flattenCategorias(categorias: Categoria[]): Categoria[] {
  return categorias.flatMap(raiz => [raiz, ...(raiz.subcategorias || [])])
}

export function findCategoriaBySlug(categorias: Categoria[], slug: string): Categoria | undefined {
  return flattenCategorias(categorias).find(c => c.slug === slug)
}
