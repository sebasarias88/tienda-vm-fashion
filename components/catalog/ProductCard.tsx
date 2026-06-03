'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useCarrito } from '@/lib/store'
import { Producto } from '@/types'
import {
  catalogPath,
  formatPrecio,
  getProductoPrecios,
  type CatalogType,
} from '@/lib/catalog'
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
  const productHref = catalogPath(catalogType, `/productos/${producto.slug}`)

  const handleAgregar = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!producto.disponible) return
    agregar(producto)
    toast.success(`${producto.nombre} agregado al carrito`)
  }

  return (
    <Link href={productHref} className="block h-full">
      <div className="group relative flex h-full min-h-0 flex-col border border-[rgba(240,235,228,0.32)] bg-[#111111] transition-colors hover:border-[rgba(201,168,76,0.38)] hover:bg-[#0a0a0a] cursor-pointer">

        <div className="relative aspect-[3/4] w-full flex-shrink-0 overflow-hidden bg-[#141414]">
          {producto.imagenes?.[0] ? (
            <img
              src={producto.imagenes[0]}
              alt={producto.nombre}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon size={28} className="text-[rgba(240,235,228,0.28)]" />
            </div>
          )}

          <div className="absolute inset-0 flex items-end justify-center bg-[rgba(201,168,76,0.22)] pb-4 transition-all duration-300 group-hover:bg-[rgba(201,168,76,0.26)]">
            <motion.button
              onClick={handleAgregar}
              initial={false}
              animate={{ opacity: 0, y: 8 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="flex translate-y-2 items-center gap-2 rounded-[2px] bg-[#C9A84C] px-5 py-2.5 text-xs font-medium uppercase tracking-[1.5px] text-[#f0ebe4] opacity-0 transition-all duration-200 hover:bg-[#D4AF37] group-hover:translate-y-0 group-hover:opacity-100"
              disabled={!producto.disponible}
            >
              <ShoppingBag size={13} />
              {producto.disponible ? 'Agregar' : 'Agotado'}
            </motion.button>
          </div>

          <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between gap-2">
            {!producto.disponible && (
              <span className="shrink-0 rounded-[2px] border border-white/30 bg-[rgba(10,10,10,0.92)] px-2.5 py-1 text-[9px] uppercase tracking-[1.5px] text-[#f0ebe4]">
                Agotado
              </span>
            )}
            {precioAntes && producto.disponible && !consultar && (
              <span className="ml-auto shrink-0 rounded-[2px] border border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.28)] px-2.5 py-1 text-[9px] uppercase tracking-[1.5px] text-[#D4AF37]">
                Oferta
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 py-4 min-h-[5.5rem]">
          <p className="mb-3 truncate text-[11px] font-light uppercase tracking-[1.5px] text-[rgba(201,168,76,0.92)]">
            {producto.categoria?.nombre || 'Producto'}
          </p>

          <h3
            className={`truncate text-sm font-normal leading-snug ${
              producto.disponible ? 'text-[#f0ebe4]' : 'text-[rgba(240,235,228,0.72)]'
            }`}
            title={producto.nombre.trim()}
          >
            {tituloCard(producto)}
          </h3>

          <div className="mt-auto pt-4">
            {isMayoreo && (
              <span className="mb-1.5 block text-[9px] font-light uppercase tracking-[1.5px] text-[#C9A84C]">
                Por mayor
              </span>
            )}
            {consultar ? (
              <span className="text-base font-light leading-none text-[#A09890]">
                Consultar precio
              </span>
            ) : (
              <div className="flex items-baseline gap-2.5">
                <span
                  className={`text-base font-light leading-none ${
                    producto.disponible ? 'text-[#D4AF37]' : 'text-[rgba(240,235,228,0.58)]'
                  }`}
                >
                  {formatPrecio(precio!)}
                </span>
                {precioAntes != null && precioAntes > 0 && (
                  <span className="shrink-0 text-xs font-light leading-none text-[rgba(240,235,228,0.78)] line-through">
                    {formatPrecio(precioAntes)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
