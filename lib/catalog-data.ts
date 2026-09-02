import { cache } from 'react'
import { createSupabasePublic } from '@/lib/supabase-public'
import type { Categoria } from '@/types'

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
