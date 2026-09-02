import { withCardImagenes } from '@/lib/productQueries'
import { withProductoVariacionesFlag } from '@/lib/variaciones'
import { withProductoCategorias } from '@/lib/producto-categorias'
import type { Producto } from '@/types'

type ShelfRow = {
  imagenes?: string[] | null
  variacion_tipos?: { id: string }[] | null
  producto_categorias?: unknown
} & Record<string, unknown>

/** Mapea filas de estantería (home, relacionados) con categorías, variaciones y 1 imagen. */
export function mapShelfProductos(rows: ShelfRow[] | null | undefined): Producto[] {
  const flagged = withProductoVariacionesFlag(rows || [])
  const withCats = withProductoCategorias(
    flagged as Parameters<typeof withProductoCategorias>[0],
  )
  return withCardImagenes(withCats) as Producto[]
}
