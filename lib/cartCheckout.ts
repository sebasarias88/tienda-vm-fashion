import type { SupabaseClient } from '@supabase/supabase-js'
import type { ItemCarrito } from '@/types'

/** Productos que tienen al menos un tipo de variación en la DB. */
export async function getProductIdsWithVariaciones(
  supabase: SupabaseClient,
  productoIds: string[],
): Promise<Set<string>> {
  if (!productoIds.length) return new Set()

  const { data, error } = await supabase
    .from('variacion_tipos')
    .select('producto_id')
    .in('producto_id', productoIds)

  if (error) {
    console.error('[getProductIdsWithVariaciones]', error.message)
    return new Set()
  }

  return new Set((data || []).map(row => row.producto_id as string))
}

export function itemFaltaVariaciones(
  item: ItemCarrito,
  idsConVariaciones: Set<string>,
): boolean {
  if (!idsConVariaciones.has(item.producto.id)) return false
  const vars = item.variacionesSeleccionadas
  return !vars || Object.keys(vars).length === 0
}

export function findItemsSinVariaciones(
  items: ItemCarrito[],
  idsConVariaciones: Set<string>,
): ItemCarrito[] {
  return items.filter(item => itemFaltaVariaciones(item, idsConVariaciones))
}
