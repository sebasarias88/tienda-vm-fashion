'use client'

import { Producto } from '@/types'
import {
  CatalogType,
  formatPrecio,
  getDescuentoPorcentaje,
  getProductoPrecios,
} from '@/lib/catalog'

type ProductoPrecioProps = {
  producto: Producto
  catalogType?: CatalogType
  disponible?: boolean
  size?: 'sm' | 'lg'
  layout?: 'inline' | 'stack'
}

export default function ProductoPrecio({
  producto,
  catalogType = 'detal',
  disponible = producto.disponible,
  size = 'sm',
  layout = 'inline',
}: ProductoPrecioProps) {
  const { precio, precioAntes, consultar } = getProductoPrecios(producto, catalogType)
  const isMayoreo = catalogType === 'mayoreo'
  const precioClass =
    size === 'lg'
      ? 'text-[1.75rem] font-light leading-none sm:text-3xl'
      : 'text-base font-light leading-none'
  const labelClass =
    'text-[10px] font-light uppercase tracking-[1px] text-[var(--text-subtle)]'

  const priceColor = disponible
    ? 'text-[var(--gold)]'
    : 'text-[var(--text-faint)]'

  const wrapperClass =
    layout === 'stack'
      ? 'flex flex-col gap-1'
      : 'flex flex-wrap items-baseline gap-x-2 gap-y-1'

  if (consultar) {
    return (
      <div className={wrapperClass}>
        {isMayoreo && <span className={labelClass}>Precio al por mayor</span>}
        <span className={`${precioClass} text-[var(--text-subtle)]`}>Consultar precio</span>
      </div>
    )
  }

  const descuento =
    precio != null ? getDescuentoPorcentaje(precio, precioAntes) : null

  return (
    <div className={wrapperClass}>
      {isMayoreo && <span className={labelClass}>Precio al por mayor</span>}
      <span className={`${precioClass} ${priceColor}`}>{formatPrecio(precio!)}</span>
      {precioAntes != null && precioAntes > 0 && (
        <span className="shrink-0 text-xs font-light leading-none text-[var(--text-subtle)] line-through sm:text-base">
          {formatPrecio(precioAntes)}
        </span>
      )}
      {descuento != null && size === 'lg' && disponible && (
        <span className="text-[11px] font-light uppercase tracking-[1px] text-[var(--gold-subtle)]">
          Ahorras {formatPrecio(precioAntes! - precio!)}
        </span>
      )}
    </div>
  )
}
