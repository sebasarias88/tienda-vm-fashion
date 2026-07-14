'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useCarrito } from '@/lib/store'
import { Producto } from '@/types'
import {
  catalogPath,
  formatPrecio,
  getPrecioDetalInfo,
  getProductoPrecios,
  type CatalogType,
} from '@/lib/catalog'
import { categoriaTieneDescuentoActivo } from '@/lib/descuentos'
import { ShoppingBag, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const MAX_TITULO_CARD = 52

function tituloCard(producto: Producto): string {
  const nombre = producto.nombre.trim()
  if (nombre.length <= MAX_TITULO_CARD) return nombre

  const segmento = nombre.split(/\s+(?:que|con|para|en)\s+|(?<=[.,;:])\s+/i)[0]?.trim()
  if (segmento && segmento.length >= 6 && segmento.length <= MAX_TITULO_CARD) {
    return segmento
  }

  const corte = nombre.slice(0, MAX_TITULO_CARD)
  const ultimoEspacio = corte.lastIndexOf(' ')
  return (ultimoEspacio > 20 ? corte.slice(0, ultimoEspacio) : corte.trimEnd()) + '…'
}

export default function ProductCard({
  producto,
  catalogType = 'detal',
}: {
  producto: Producto
  catalogType?: 'detal' | 'mayoreo'
}) {
  const agregar = useCarrito(s => s.agregar)
  const isMayoreo = catalogType === 'mayoreo'
  const { precio, precioAntes, consultar } = getProductoPrecios(producto, catalogType)
  const precioDetalInfo = isMayoreo ? getPrecioDetalInfo(producto) : null
  const productHref = catalogPath(catalogType, `/productos/${producto.slug}`)
  const descuentoCategoria = categoriaTieneDescuentoActivo(producto.categoria, catalogType)
  const pctDescuento =
    catalogType === 'mayoreo'
      ? producto.categoria?.descuento_porcentaje_mayoreo
      : producto.categoria?.descuento_porcentaje

  const handleAgregar = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!producto.disponible) return
    agregar(producto)
    toast.success(`${producto.nombre} agregado al carrito`)
  }

  return (
    <Link href={productHref} className="block h-full">
      <div className="group relative flex h-full min-h-0 flex-col border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] transition-all duration-300 hover:border-[var(--border)] hover:shadow-[var(--shadow-card-hover)] cursor-pointer">

        <div className="relative aspect-[3/4] w-full flex-shrink-0 overflow-hidden">
          {producto.imagenes?.[0] ? (
            <img
              src={producto.imagenes[0]}
              alt={producto.nombre}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--bg-surface)]">
              <ImageIcon size={28} className="text-[var(--text-faint)]" />
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <motion.button
              onClick={handleAgregar}
              initial={false}
              className="pointer-events-auto catalog-gold-cta flex translate-y-2 items-center gap-2 rounded-[2px] px-5 py-2.5 text-xs font-medium uppercase tracking-[1.5px] transition-all duration-200 group-hover:translate-y-0"
              disabled={!producto.disponible}
            >
              <ShoppingBag size={13} />
              {producto.disponible ? 'Agregar' : 'Agotado'}
            </motion.button>
          </div>

          <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between gap-2">
            {!producto.disponible && (
              <span className="shrink-0 rounded-[2px] border border-white/30 bg-[var(--badge-agotado-bg)] px-2.5 py-1 text-[9px] uppercase tracking-[1.5px] text-[var(--text-inverse)]">
                Agotado
              </span>
            )}
            {descuentoCategoria && producto.disponible && !consultar && (
              <span className="ml-auto shrink-0 rounded-[2px] border border-[var(--border)] bg-[var(--badge-oferta-bg)] px-2.5 py-1 text-[9px] uppercase tracking-[1.5px] text-[var(--gold)]">
                -{pctDescuento}%
              </span>
            )}
            {!descuentoCategoria && precioAntes && producto.disponible && !consultar && (
              <span className="ml-auto shrink-0 rounded-[2px] border border-[var(--border)] bg-[var(--badge-oferta-bg)] px-2.5 py-1 text-[9px] uppercase tracking-[1.5px] text-[var(--gold)]">
                Oferta
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 py-4 min-h-[5.5rem]">
          <p className="mb-1 truncate text-[11px] font-medium uppercase tracking-[1.5px] text-[var(--gold)]">
            {producto.categoria?.nombre || 'Producto'}
          </p>
          {producto.marca && (
            <p className="mb-2 truncate text-[9px] font-light uppercase tracking-[1.5px] text-[var(--text-subtle)]">
              {producto.marca}
            </p>
          )}

          <h3
            className={`truncate text-sm font-medium leading-snug ${
              producto.disponible ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
            }`}
            title={producto.nombre.trim()}
          >
            {tituloCard(producto)}
          </h3>

          <div className="mt-auto pt-4">
            {isMayoreo && (
              <span className="mb-1.5 block text-[9px] font-light uppercase tracking-[1.5px] text-[var(--gold)]">
                Mayorista
              </span>
            )}
            {consultar ? (
              <span className="text-base font-light leading-none text-[var(--text-subtle)]">
                Consultar precio
              </span>
            ) : (
              <div className="flex items-baseline gap-2.5">
                <span
                  className={`text-base font-light leading-none ${
                    producto.disponible ? 'text-[var(--gold)]' : 'text-[var(--text-faint)]'
                  }`}
                >
                  {formatPrecio(precio!)}
                </span>
                {precioAntes != null && precioAntes > 0 && (
                  <span className="shrink-0 text-xs font-light leading-none text-[var(--text-subtle)] line-through">
                    {formatPrecio(precioAntes)}
                  </span>
                )}
              </div>
            )}
            {precioDetalInfo != null && (
              <span className="mt-1.5 block text-[10px] font-light tracking-[0.3px] text-[var(--text-subtle)]">
                Precio al detal{' '}
                <span className="font-normal text-[var(--text-secondary)]">
                  {formatPrecio(precioDetalInfo)}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
