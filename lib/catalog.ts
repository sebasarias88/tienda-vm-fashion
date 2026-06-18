import { Producto } from '@/types'

export type CatalogType = 'detal' | 'mayoreo'

/** Monto mínimo de compra para el catálogo al por mayor (COP). */
export const MAYOREO_MIN_COMPRA = 180000

export function catalogBasePath(catalogType: CatalogType = 'detal'): string {
  return catalogType === 'mayoreo' ? '/mayoreo' : ''
}

/** Ruta dentro del catálogo (detal o mayoreo). */
export function catalogPath(catalogType: CatalogType, path: string): string {
  const base = catalogBasePath(catalogType)
  if (!path || path === '/') return base || '/'
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

export function formatPrecio(precio: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precio)
}

export type ProductoPrecios = {
  precio: number | null
  precioAntes: number | null
  consultar: boolean
}

export function getProductoPrecios(
  producto: Producto,
  catalogType: CatalogType = 'detal',
): ProductoPrecios {
  if (catalogType === 'mayoreo') {
    const precio = producto.precio_mayoreo
    const consultar = precio == null || precio === 0
    return {
      precio: consultar ? null : precio,
      precioAntes: consultar ? null : producto.precio_antes_mayoreo,
      consultar,
    }
  }

  return {
    precio: producto.precio,
    precioAntes: producto.precio_antes,
    consultar: false,
  }
}

/** Valor numérico para ordenar por precio (mayoreo sin precio va al final). */
export function getPrecioOrden(producto: Producto, catalogType: CatalogType): number {
  if (catalogType === 'mayoreo') {
    const p = producto.precio_mayoreo
    if (p == null || p === 0) return Number.POSITIVE_INFINITY
    return p
  }
  return producto.precio
}

export function getDescuentoPorcentaje(
  precio: number,
  precioAntes: number | null,
): number | null {
  if (!precioAntes || precioAntes <= precio) return null
  return Math.round((1 - precio / precioAntes) * 100)
}
