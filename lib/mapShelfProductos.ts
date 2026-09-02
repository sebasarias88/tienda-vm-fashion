import { withCardImagenes } from '@/lib/productQueries'
import { withProductoVariacionesFlag } from '@/lib/variaciones'
import type { Producto } from '@/types'

type ShelfRow = {
  imagenes?: string[] | null
  variacion_tipos?: { id: string }[] | null
} & Record<string, unknown>

/** Mapea filas de estantería (home, relacionados) con flag de variaciones + 1 imagen. */
export function mapShelfProductos(rows: ShelfRow[] | null | undefined): Producto[] {
  return withProductoVariacionesFlag(withCardImagenes(rows || [])) as Producto[]
}
