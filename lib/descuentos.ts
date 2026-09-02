import { Categoria, Producto } from '@/types'

export type CatalogDiscountType = 'detal' | 'mayoreo'

export type DescuentoCategoriaResuelto = {
  porcentaje: number
  categoriaNombre: string
  heredadoDePadre: boolean
}

/** Campos de categoría para joins de productos (incluye descuentos detal + mayorista). */
export const CATEGORIA_SELECT_FIELDS =
  'id,nombre,slug,padre_id,descuento_porcentaje,descuento_activo,descuento_fecha_fin,descuento_porcentaje_mayoreo,descuento_activo_mayoreo,descuento_fecha_fin_mayoreo'

export const CATEGORIA_PADRE_EMBED = `padre:categorias!padre_id(${CATEGORIA_SELECT_FIELDS})`

export const CATEGORIA_CARD_EMBED = `categoria:categorias(${CATEGORIA_SELECT_FIELDS}, ${CATEGORIA_PADRE_EMBED})`

export const PRODUCTO_CATEGORIAS_EMBED = `producto_categorias(categoria_id, categoria:categorias(${CATEGORIA_SELECT_FIELDS}, ${CATEGORIA_PADRE_EMBED}))`

function leerDescuentoDirecto(
  categoria: Categoria,
  catalogType: CatalogDiscountType,
): number | null {
  const activo =
    catalogType === 'mayoreo'
      ? categoria.descuento_activo_mayoreo
      : categoria.descuento_activo

  const porcentaje =
    catalogType === 'mayoreo'
      ? categoria.descuento_porcentaje_mayoreo
      : categoria.descuento_porcentaje

  const fechaFin =
    catalogType === 'mayoreo'
      ? categoria.descuento_fecha_fin_mayoreo
      : categoria.descuento_fecha_fin

  if (!activo || !porcentaje) return null

  if (fechaFin) {
    const fin = new Date(fechaFin)
    if (!Number.isNaN(fin.getTime()) && fin < new Date()) return null
  }

  return porcentaje
}

/**
 * Descuento de una categoría: propio o heredado del padre si la subcategoría no tiene uno activo.
 */
export function resolveDescuentoCategoria(
  categoria: Categoria | null | undefined,
  catalogType: CatalogDiscountType = 'detal',
  padre?: Categoria | null,
): DescuentoCategoriaResuelto | null {
  if (!categoria) return null

  const directo = leerDescuentoDirecto(categoria, catalogType)
  if (directo != null) {
    return {
      porcentaje: directo,
      categoriaNombre: categoria.nombre,
      heredadoDePadre: false,
    }
  }

  const padreCat = padre ?? categoria.padre ?? null
  if (!padreCat) return null

  const heredado = leerDescuentoDirecto(padreCat, catalogType)
  if (heredado == null) return null

  return {
    porcentaje: heredado,
    categoriaNombre: padreCat.nombre,
    heredadoDePadre: true,
  }
}

function collectCategoriasProducto(producto: Producto): Categoria[] {
  const seen = new Set<string>()
  const out: Categoria[] = []

  const push = (cat?: Categoria | null) => {
    if (!cat || seen.has(cat.id)) return
    seen.add(cat.id)
    out.push(cat)
  }

  push(producto.categoria)
  producto.categorias?.forEach(push)
  return out
}

/**
 * Mejor descuento aplicable a un producto revisando categoría principal y asignaciones extra.
 */
export function resolveDescuentoProducto(
  producto: Producto,
  catalogType: CatalogDiscountType = 'detal',
): DescuentoCategoriaResuelto | null {
  const categorias = collectCategoriasProducto(producto)
  if (!categorias.length) return null

  const catById = new Map(categorias.map(c => [c.id, c]))
  let mejor: DescuentoCategoriaResuelto | null = null

  for (const categoria of categorias) {
    const padre =
      categoria.padre ??
      (categoria.padre_id ? catById.get(categoria.padre_id) ?? null : null)

    const resuelto = resolveDescuentoCategoria(categoria, catalogType, padre)
    if (!resuelto) continue
    if (!mejor || resuelto.porcentaje > mejor.porcentaje) {
      mejor = resuelto
    }
  }

  return mejor
}

export function calcularPrecioConDescuento(
  precio: number,
  categoria: Categoria | null | undefined,
  catalogType: CatalogDiscountType = 'detal',
  producto?: Producto | null,
): {
  precioFinal: number
  descuentoAplicado: number
  tieneDescuento: boolean
  porcentaje: number
} {
  const noneResult = {
    precioFinal: precio,
    descuentoAplicado: 0,
    tieneDescuento: false,
    porcentaje: 0,
  }

  const descuento = producto
    ? resolveDescuentoProducto(producto, catalogType)
    : resolveDescuentoCategoria(categoria, catalogType, categoria?.padre)

  if (!descuento) return noneResult

  const descuentoFrac = descuento.porcentaje / 100
  const precioFinal = Math.round(precio * (1 - descuentoFrac))
  const descuentoAplicado = precio - precioFinal

  return {
    precioFinal,
    descuentoAplicado,
    tieneDescuento: precioFinal < precio,
    porcentaje: descuento.porcentaje,
  }
}

export function formatDescuento(porcentaje: number): string {
  return `-${porcentaje}%`
}

export function categoriaTieneDescuentoActivo(
  categoria: Categoria | null | undefined,
  catalogType: CatalogDiscountType = 'detal',
  padre?: Categoria | null,
): boolean {
  return resolveDescuentoCategoria(categoria, catalogType, padre) != null
}

export function productoTieneDescuentoCategoria(
  producto: Producto,
  catalogType: CatalogDiscountType = 'detal',
): boolean {
  return resolveDescuentoProducto(producto, catalogType) != null
}

export function getPorcentajeDescuentoActivo(
  categoria: Categoria | null | undefined,
  catalogType: CatalogDiscountType = 'detal',
  padre?: Categoria | null,
): number | null {
  return resolveDescuentoCategoria(categoria, catalogType, padre)?.porcentaje ?? null
}

export function getPorcentajeDescuentoProducto(
  producto: Producto,
  catalogType: CatalogDiscountType = 'detal',
): number | null {
  return resolveDescuentoProducto(producto, catalogType)?.porcentaje ?? null
}

/** Mayor descuento visible en tarjeta de categoría raíz (propia o en alguna subcategoría). */
export function getPorcentajeDescuentoGrupoCategoria(
  categoriaRaiz: Categoria,
  catalogType: CatalogDiscountType = 'detal',
): number | null {
  let max: number | null = null

  const root = resolveDescuentoCategoria(categoriaRaiz, catalogType)
  if (root) max = root.porcentaje

  for (const sub of categoriaRaiz.subcategorias ?? []) {
    const subD = resolveDescuentoCategoria(sub, catalogType, categoriaRaiz)
    if (subD && (max == null || subD.porcentaje > max)) {
      max = subD.porcentaje
    }
  }

  return max
}
