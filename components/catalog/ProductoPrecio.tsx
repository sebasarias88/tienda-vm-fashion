'use client'

import { Producto } from '@/types'
import {
  CatalogType,
  formatPrecio,
  getDescuentoPorcentaje,
  getPrecioDetalInfo,
  getProductoPrecios,
} from '@/lib/catalog'
import { categoriaTieneDescuentoActivo } from '@/lib/descuentos'

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
  const precioDetalInfo = isMayoreo ? getPrecioDetalInfo(producto) : null
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

  const detalInfoNode =
    precioDetalInfo != null ? (
      <span className="mt-2.5 inline-flex w-fit items-baseline gap-2 border-l-2 border-[var(--gold)]/40 pl-3 text-[12px] leading-none">
        <span className="font-light uppercase tracking-[1.5px] text-[var(--text-subtle)]">
          Precio al detal
        </span>
        <span className="font-normal tracking-[0.3px] text-[var(--text-secondary)]">
          {formatPrecio(precioDetalInfo)}
        </span>
      </span>
    ) : null

  if (consultar) {
    return (
      <div className={wrapperClass}>
        {isMayoreo && <span className={labelClass}>Precio mayorista</span>}
        <span className={`${precioClass} text-[var(--text-subtle)]`}>Consultar precio</span>
        {detalInfoNode}
      </div>
    )
  }

  const descuento =
    precio != null ? getDescuentoPorcentaje(precio, precioAntes) : null
  const descuentoCategoria = categoriaTieneDescuentoActivo(producto.categoria, catalogType)
  const pctDescuento =
    catalogType === 'mayoreo'
      ? producto.categoria?.descuento_porcentaje_mayoreo
      : producto.categoria?.descuento_porcentaje

  return (
    <div className={wrapperClass}>
      {isMayoreo && <span className={labelClass}>Precio mayorista</span>}
      <span className={`${precioClass} ${priceColor}`}>{formatPrecio(precio!)}</span>
      {precioAntes != null && precioAntes > 0 && (
        <span className="shrink-0 text-xs font-light leading-none text-[var(--text-subtle)] line-through sm:text-base">
          {formatPrecio(precioAntes)}
        </span>
      )}
      {descuentoCategoria && pctDescuento != null && size === 'lg' && (
        <span className="text-[11px] font-light uppercase tracking-[1px] text-[var(--gold)]">
          -{pctDescuento}% en {producto.categoria?.nombre}
        </span>
      )}
      {descuento != null && size === 'lg' && disponible && (
        <span className="text-[11px] font-light uppercase tracking-[1px] text-[var(--gold-subtle)]">
          Ahorras {formatPrecio(precioAntes! - precio!)}
        </span>
      )}
      {detalInfoNode}
    </div>
  )
}
