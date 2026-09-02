import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * IDs de productos que coinciden con búsqueda (sin tildes) vía RPC `product_ids_matching_search`.
 * Retorna `null` si la función no existe en Supabase (fallback a ilike en el caller).
 */
export async function productIdsMatchingSearch(
  supabase: SupabaseClient,
  searchTerm: string,
): Promise<string[] | null> {
  const term = searchTerm.trim()
  if (!term) return []

  const { data, error } = await supabase.rpc('product_ids_matching_search', {
    search_term: term,
  })

  if (error) {
    if (
      error.message.includes('product_ids_matching_search') ||
      error.code === 'PGRST202'
    ) {
      return null
    }
    console.error('[productIdsMatchingSearch]', error.message)
    return null
  }

  return (data as { id: string }[] | null)?.map(row => row.id) ?? []
}

export function intersectIds(a: string[] | null, b: string[]): string[] {
  if (!a) return b
  const set = new Set(b)
  return a.filter(id => set.has(id))
}
