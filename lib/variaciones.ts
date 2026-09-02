import { Producto, VariacionOpcion, VariacionTipo } from '@/types'
import type { CatalogType } from '@/lib/catalog'

/** Select anidado liviano para listados (Agotado por catálogo). */
export const PRODUCTO_VARIACIONES_SELECT =
  'variacion_tipos(id, orden, opciones:variacion_opciones(id, disponible_detal, disponible_mayoreo, orden))'

export function opcionDisponibleEnCatalogo(
  opcion: VariacionOpcion,
  catalogType: CatalogType,
): boolean {
  if (catalogType === 'mayoreo') return Boolean(opcion.disponible_mayoreo)
  return Boolean(opcion.disponible_detal)
}

/** Tipos ordenados; conserva opciones agotadas para mostrarlas en UI. */
export function normalizarVariacionesProducto(
  tipos: VariacionTipo[] | null | undefined,
): VariacionTipo[] {
  if (!tipos?.length) return []

  return tipos
    .map(tipo => ({
      ...tipo,
      opciones: [...(tipo.opciones || [])].sort((a, b) => a.orden - b.orden),
    }))
    .filter(tipo => (tipo.opciones?.length ?? 0) > 0)
    .sort((a, b) => a.orden - b.orden)
}

/**
 * Agotado en un catálogo si:
 * - el producto está marcado agotado globalmente,
 * - está desactivado para ese catálogo, o
 * - algún tipo de variación no tiene ninguna opción vendible ahí.
 */
export function productoAgotadoEnCatalogo(
  producto: Producto,
  catalogType: CatalogType,
  variaciones?: VariacionTipo[] | null,
): boolean {
  if (!producto.disponible) return true
  if (catalogType === 'mayoreo' && producto.disponible_mayoreo === false) return true
  if (catalogType === 'detal' && producto.disponible_detal === false) return true

  const tipos = normalizarVariacionesProducto(
    variaciones ?? producto.variaciones,
  )
  if (!tipos.length) return false

  return tipos.some(tipo => {
    const opciones = tipo.opciones || []
    return !opciones.some(o => opcionDisponibleEnCatalogo(o, catalogType))
  })
}

/** Adjunta `variaciones` desde el join `variacion_tipos` de Supabase. */
export function withProductoVariaciones<T extends Producto & { variacion_tipos?: VariacionTipo[] }>(
  productos: T[] | null | undefined,
): Producto[] {
  return (productos || []).map(producto => {
    const { variacion_tipos, ...rest } = producto
    return {
      ...rest,
      variaciones: normalizarVariacionesProducto(variacion_tipos),
      tiene_variaciones: (variacion_tipos?.length ?? 0) > 0,
    }
  })
}

export function withProductoVariacionesFlag<
  T extends { variacion_tipos?: { id: string }[] | null },
>(productos: T[] | null | undefined): (Omit<T, 'variacion_tipos'> & {
  tiene_variaciones: boolean
})[] {
  return (productos || []).map(({ variacion_tipos, ...rest }) => ({
    ...rest,
    tiene_variaciones: (variacion_tipos?.length ?? 0) > 0,
  }))
}

export function buildVariacionesSeleccionadas(
  variaciones: VariacionTipo[],
  selectedByTipoId: Record<string, string[]>,
): Record<string, string> | undefined {
  const result: Record<string, string> = {}

  for (const tipo of variaciones) {
    const opcionIds = selectedByTipoId[tipo.id]
    if (!opcionIds?.length) continue
    // Se respeta el orden de las opciones del tipo para una clave estable.
    const nombres = (tipo.opciones || [])
      .filter(o => opcionIds.includes(o.id))
      .map(o => o.nombre)
    if (nombres.length) result[tipo.nombre] = nombres.join(', ')
  }

  return Object.keys(result).length > 0 ? result : undefined
}
