'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCarrito } from '@/lib/store'
import {
  cartSubtotal,
  formatVariacionesResumen,
  itemLineKey,
  itemLineTotal,
  variacionesCarritoClassName,
} from '@/lib/cart'
import { catalogPath, getProductoPrecios, type CatalogType } from '@/lib/catalog'
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

type CartDrawerProps = {
  open: boolean
  onClose: () => void
  catalogType?: CatalogType
}

function formatPrecio(precio: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precio)
}

export default function CartDrawer({
  open,
  onClose,
  catalogType = 'detal',
}: CartDrawerProps) {
  const { items, quitar, actualizarCantidad } = useCarrito()
  const carritoHref = catalogPath(catalogType, '/carrito')
  const subtotal = cartSubtotal(items, catalogType)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#111111] border-l border-[rgba(201,168,76,0.26)] z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(201,168,76,0.22)]">
              <div className="flex items-center gap-3">
                <ShoppingBag size={16} className="text-[#C9A84C]" />
                <h2 className="text-[13px] tracking-[3px] uppercase font-light text-[#f0ebe4]">
                  Carrito
                </h2>
                {items.length > 0 && (
                  <span className="text-[9px] bg-[rgba(201,168,76,0.14)] text-[#C9A84C] border border-[rgba(201,168,76,0.35)] px-2 py-0.5 rounded-[2px]">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-[rgba(240,235,228,0.52)] hover:text-[#f0ebe4] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <ShoppingBag size={40} className="text-[rgba(240,235,228,0.32)]" />
                  <p className="text-[13px] tracking-[1px] text-[rgba(240,235,228,0.65)] font-light uppercase">
                    Tu carrito está vacío
                  </p>
                  <button
                    onClick={onClose}
                    className="text-[10px] tracking-[2px] uppercase text-[#C9A84C] border border-[rgba(201,168,76,0.52)] px-4 py-2 rounded-[2px] hover:bg-[rgba(201,168,76,0.14)] transition-all font-light"
                  >
                    Ver catálogo
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => {
                    const key = itemLineKey(item)
                    const { producto, cantidad, variacionesSeleccionadas } = item
                    const vars = formatVariacionesResumen(variacionesSeleccionadas)

                    return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 py-4 border-b border-[rgba(201,168,76,0.16)] last:border-0"
                    >
                      {/* Imagen */}
                      <div className="w-16 h-16 flex-shrink-0 rounded-[2px] overflow-hidden border border-[rgba(201,168,76,0.26)] bg-[#141414]">
                        {producto.imagenes?.[0] ? (
                          <img
                            src={producto.imagenes[0]}
                            alt={producto.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={16} className="text-[rgba(240,235,228,0.38)]" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-light text-[#f0ebe4] leading-tight truncate mb-1">
                          {producto.nombre}
                        </p>
                        {vars && (
                          <p className={`mb-1 ${variacionesCarritoClassName}`}>
                            {vars}
                          </p>
                        )}
                        <p className="text-[14px] text-[#C9A84C] font-light mb-3">
                          {(() => {
                            const { precio, consultar } = getProductoPrecios(
                              producto,
                              catalogType,
                            )
                            if (consultar || precio == null) return 'Consultar precio'
                            return formatPrecio(precio)
                          })()}
                        </p>

                        {/* Cantidad */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-[rgba(240,235,228,0.22)] rounded-[2px] overflow-hidden">
                            <button
                              onClick={() => actualizarCantidad(key, cantidad - 1)}
                              className="px-2.5 py-1.5 text-[rgba(240,235,228,0.65)] hover:text-[#C9A84C] hover:bg-[rgba(201,168,76,0.14)] transition-all"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="px-3 text-[12px] font-light text-[#f0ebe4] border-x border-[rgba(201,168,76,0.22)]">
                              {cantidad}
                            </span>
                            <button
                              onClick={() => actualizarCantidad(key, cantidad + 1)}
                              className="px-2.5 py-1.5 text-[rgba(240,235,228,0.65)] hover:text-[#C9A84C] hover:bg-[rgba(201,168,76,0.14)] transition-all"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <button
                            onClick={() => quitar(key)}
                            className="text-[rgba(240,235,228,0.55)] hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-[12px] font-light text-[rgba(240,235,228,0.78)]">
                          {(() => {
                            const line = itemLineTotal(item, catalogType)
                            return line != null ? formatPrecio(line) : 'Consultar'
                          })()}
                        </p>
                      </div>
                    </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-[rgba(201,168,76,0.22)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] tracking-[1.5px] uppercase text-[rgba(240,235,228,0.65)] font-light">
                    Subtotal
                  </span>
                  <span className="text-[18px] font-light text-[#C9A84C]">
                    {formatPrecio(subtotal)}
                  </span>
                </div>
                <p className="text-[12px] text-[rgba(240,235,228,0.45)] font-light">
                  Envío calculado al finalizar el pedido
                </p>
                <Link
                  href={carritoHref}
                  onClick={onClose}
                  className="block w-full bg-[#C9A84C] text-[#f0ebe4] text-center py-3.5 rounded-[2px] text-[11px] tracking-[3px] uppercase font-medium hover:bg-[#D4AF37] transition-colors"
                >
                  Finalizar pedido
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}