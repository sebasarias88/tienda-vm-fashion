/**
 * Selects lean para listados de catálogo / home.
 * Evita descripcion, video, variaciones nested y joins pesados.
 */
import {
  CATEGORIA_CARD_EMBED,
  CATEGORIA_SELECT_FIELDS,
  CATEGORIA_PADRE_EMBED,
  PRODUCTO_CATEGORIAS_EMBED,
} from '@/lib/descuentos'

export { CATEGORIA_SELECT_FIELDS, CATEGORIA_PADRE_EMBED, PRODUCTO_CATEGORIAS_EMBED }

export const PRODUCTO_CARD_COLUMNS =
  'id, nombre, slug, precio, precio_antes, precio_mayoreo, precio_antes_mayoreo, disponible, disponible_detal, disponible_mayoreo, destacado, marca, categoria_id, imagenes, orden, created_at, updated_at, sku'

/** Join mínimo para filtros multi-categoría en el cliente. */
export const PRODUCTO_CATEGORIAS_EMBED_LEAN =
  'producto_categorias(categoria_id, categoria:categorias(id,nombre,slug,padre_id))'

/** Solo ids de tipos de variación — para saber si el producto requiere elegir opciones en PDP. */
export const PRODUCTO_VARIACIONES_FLAG_EMBED = 'variacion_tipos(id)'

export const PRODUCTO_LIST_SELECT = `${PRODUCTO_CARD_COLUMNS}, ${CATEGORIA_CARD_EMBED}, ${PRODUCTO_CATEGORIAS_EMBED}, ${PRODUCTO_VARIACIONES_FLAG_EMBED}`

export const PRODUCTO_SHELF_SELECT = `${PRODUCTO_CARD_COLUMNS}, ${CATEGORIA_CARD_EMBED}, ${PRODUCTO_CATEGORIAS_EMBED}, ${PRODUCTO_VARIACIONES_FLAG_EMBED}`

export const PRODUCTO_DETAIL_SELECT = `*, ${CATEGORIA_CARD_EMBED}, ${PRODUCTO_CATEGORIAS_EMBED}`

/** Solo primera imagen en memoria (URLs bastan para cards). */
export function withCardImagenes<T extends { imagenes?: string[] | null }>(
  productos: T[] | null | undefined,
): T[] {
  return (productos || []).map(p => ({
    ...p,
    imagenes: p.imagenes?.length ? [p.imagenes[0]] : [],
  }))
}
