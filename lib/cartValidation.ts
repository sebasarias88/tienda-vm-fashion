import type { SupabaseClient } from '@supabase/supabase-js'
import type { ItemCarrito, Producto, VariacionTipo } from '@/types'
import { productoVisibleColumn, type CatalogType } from '@/lib/catalog'
import { getLineKey } from '@/lib/cart'
import { CATEGORIA_CARD_EMBED, PRODUCTO_CATEGORIAS_EMBED } from '@/lib/descuentos'
import { PRODUCTO_CARD_COLUMNS } from '@/lib/productQueries'
import { mapShelfProductos } from '@/lib/mapShelfProductos'
import {
  normalizarVariacionesProducto,
  opcionDisponibleEnCatalogo,
  productoAgotadoEnCatalogo,
} from '@/lib/variaciones'

/** Same columns as catalog cards, plus every option with its name and stock. */
const CART_VALIDATION_SELECT = `${PRODUCTO_CARD_COLUMNS}, ${CATEGORIA_CARD_EMBED}, ${PRODUCTO_CATEGORIAS_EMBED}, variacion_tipos(id, producto_id, nombre, orden, opciones:variacion_opciones(id, tipo_id, nombre, valor_color, disponible_detal, disponible_mayoreo, orden))`

export type CartValidationResult = {
  /** Cart lines with fresh product data; unavailable lines removed. */
  items: ItemCarrito[]
  /** Names of lines removed because they are sold out / no longer offered. */
  removed: string[]
  /** Names of products whose multi-option line was split into one line per option. */
  split: string[]
  /** Product ids that require choosing options. */
  idsConVariaciones: Set<string>
  /** True when `items` differs from the cart that was checked. */
  changed: boolean
}

/**
 * Old carts (before Oct 2026) could hold several options of one type in a
 * single line, e.g. { Fragancias: "Vainilla, Bombon" }. Expands such a line
 * into one selection per option when every part is a real option name.
 */
function expandSelection(
  seleccion: Record<string, string>,
  tipos: VariacionTipo[],
): Record<string, string>[] | null {
  let combos: Record<string, string>[] = [{}]

  for (const [tipoNombre, valor] of Object.entries(seleccion)) {
    const tipo = tipos.find(t => t.nombre === tipoNombre)
    if (!tipo) return null
    const opciones = tipo.opciones || []
    const names = opciones.some(o => o.nombre === valor)
      ? [valor]
      : valor.split(', ').map(v => v.trim())
    if (!names.every(n => opciones.some(o => o.nombre === n))) return null
    combos = combos.flatMap(c => names.map(n => ({ ...c, [tipoNombre]: n })))
  }

  return combos
}

function selectionAvailable(
  seleccion: Record<string, string>,
  tipos: VariacionTipo[],
  catalogType: CatalogType,
): boolean {
  return Object.entries(seleccion).every(([tipoNombre, opcionNombre]) => {
    const opcion = tipos
      .find(t => t.nombre === tipoNombre)
      ?.opciones?.find(o => o.nombre === opcionNombre)
    return Boolean(opcion && opcionDisponibleEnCatalogo(opcion, catalogType))
  })
}

/**
 * Re-reads every product in the cart and drops what can no longer be ordered
 * (sold out, hidden, deleted, or a sold-out option). The cart lives in the
 * customer's browser for days, so its copy of each product can be stale.
 * Returns null when the database could not be reached.
 */
export async function validateCartItems(
  supabase: SupabaseClient,
  items: ItemCarrito[],
  catalogType: CatalogType,
): Promise<CartValidationResult | null> {
  const ids = [...new Set(items.map(i => i.producto.id))]
  if (!ids.length) {
    return { items, removed: [], split: [], idsConVariaciones: new Set(), changed: false }
  }

  const { data, error } = await supabase
    .from('productos')
    .select(CART_VALIDATION_SELECT)
    .in('id', ids)
    .eq(productoVisibleColumn(catalogType), true)

  if (error) {
    console.error('[validateCartItems]', error.message)
    return null
  }

  const rows = (data || []) as unknown as (Record<string, unknown> & {
    id: string
    variacion_tipos?: VariacionTipo[] | null
  })[]
  const tiposById = new Map(
    rows.map(r => [r.id, normalizarVariacionesProducto(r.variacion_tipos)]),
  )
  // mapShelfProductos turns variacion_tipos into the tiene_variaciones flag.
  const fresh = new Map(mapShelfProductos(rows as never).map(p => [p.id, p as Producto]))

  const removed: string[] = []
  const split: string[] = []
  const next = new Map<string, ItemCarrito>()
  let changed = false

  const push = (item: ItemCarrito) => {
    const existing = next.get(item.lineKey!)
    if (existing) {
      existing.cantidad += item.cantidad
      changed = true
    } else {
      next.set(item.lineKey!, item)
    }
  }

  for (const item of items) {
    const producto = fresh.get(item.producto.id)
    const tipos = tiposById.get(item.producto.id) ?? []

    if (!producto || productoAgotadoEnCatalogo(producto, catalogType, tipos)) {
      removed.push(item.producto.nombre)
      changed = true
      continue
    }

    // Keep the fresh product (prices, stock flags) but no heavy variation data.
    const productoActual: Producto = { ...producto, tiene_variaciones: tipos.length > 0 }
    const seleccion = item.variacionesSeleccionadas

    if (!tipos.length || !seleccion || !Object.keys(seleccion).length) {
      // No options to check (missing selections are handled at checkout).
      push({ ...item, producto: productoActual, lineKey: getLineKey(producto.id, seleccion) })
      continue
    }

    const combos = expandSelection(seleccion, tipos)
    if (!combos) {
      removed.push(item.producto.nombre)
      changed = true
      continue
    }

    if (combos.length > 1) {
      split.push(item.producto.nombre)
      changed = true
    }

    for (const combo of combos) {
      if (!selectionAvailable(combo, tipos, catalogType)) {
        removed.push(`${item.producto.nombre} (${Object.values(combo).join(' / ')})`)
        changed = true
        continue
      }
      push({
        producto: productoActual,
        // A split line has no per-option quantity: start each option at 1.
        cantidad: combos.length > 1 ? 1 : item.cantidad,
        variacionesSeleccionadas: combo,
        lineKey: getLineKey(producto.id, combo),
      })
    }
  }

  const idsConVariaciones = new Set(
    [...tiposById.entries()].filter(([, t]) => t.length > 0).map(([id]) => id),
  )

  return { items: [...next.values()], removed, split, idsConVariaciones, changed }
}
