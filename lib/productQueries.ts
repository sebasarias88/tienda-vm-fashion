/**
 * Selects lean para listados de catálogo / home.
 * Evita descripcion, video, variaciones nested y joins pesados.
 */
export const PRODUCTO_CARD_COLUMNS =
  'id, nombre, slug, precio, precio_antes, precio_mayoreo, precio_antes_mayoreo, disponible, disponible_detal, disponible_mayoreo, destacado, marca, categoria_id, imagenes, orden, created_at, updated_at, sku'

export const CATEGORIA_CARD_EMBED =
  'categoria:categorias(id,nombre,slug,padre_id,descuento_porcentaje,descuento_activo,descuento_fecha_fin,descuento_porcentaje_mayoreo,descuento_activo_mayoreo,descuento_fecha_fin_mayoreo)'

/** Join mínimo para filtros multi-categoría en el cliente. */
export const PRODUCTO_CATEGORIAS_EMBED =
  'producto_categorias(categoria_id, categoria:categorias(id,nombre,slug,padre_id))'

/** Solo ids de tipos de variación — para saber si el producto requiere elegir opciones en PDP. */
export const PRODUCTO_VARIACIONES_FLAG_EMBED = 'variacion_tipos(id)'

export const PRODUCTO_LIST_SELECT = `${PRODUCTO_CARD_COLUMNS}, ${CATEGORIA_CARD_EMBED}, ${PRODUCTO_CATEGORIAS_EMBED}, ${PRODUCTO_VARIACIONES_FLAG_EMBED}`

export const PRODUCTO_SHELF_SELECT = `${PRODUCTO_CARD_COLUMNS}, ${CATEGORIA_CARD_EMBED}, ${PRODUCTO_VARIACIONES_FLAG_EMBED}`

/** Solo primera imagen en memoria (URLs bastan para cards). */
export function withCardImagenes<T extends { imagenes?: string[] | null }>(
  productos: T[] | null | undefined,
): T[] {
  return (productos || []).map(p => ({
    ...p,
    imagenes: p.imagenes?.length ? [p.imagenes[0]] : [],
  }))
}
