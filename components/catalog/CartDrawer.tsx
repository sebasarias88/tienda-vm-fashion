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
import LuxuryCartIcon from '@/components/catalog/LuxuryCartIcon'
import { useScrollLock } from '@/lib/useScrollLock'

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

  useScrollLock(open)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-[var(--overlay-backdrop)] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed right-0 top-0 z-50 flex h-[100dvh] w-full max-w-md min-h-0 flex-col border-l border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-dropdown)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-5">
              <div className="flex items-center gap-3">
                <LuxuryCartIcon size={18} />
                <h2 className="text-[13px] font-light uppercase tracking-[3px] text-[var(--text-primary)]">
                  Carrito
                </h2>
                {items.length > 0 && (
                  <span className="rounded-[2px] border border-[var(--border)] bg-[var(--gold-muted)] px-2 py-0.5 text-[9px] text-[var(--gold)]">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-[var(--text-subtle)] transition-colors hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4"
              data-lenis-prevent
            >
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4">
                  <ShoppingBag size={40} className="text-[var(--text-faint)]" />
                  <p className="text-[13px] font-light uppercase tracking-[1px] text-[var(--text-muted)]">
                    Tu carrito está vacío
                  </p>
                  <button
                    onClick={onClose}
                    className="rounded-[2px] border border-[var(--border)] px-4 py-2 text-[10px] font-light uppercase tracking-[2px] text-[var(--gold)] transition-all hover:bg-[var(--gold-muted)]"
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
                        className="flex gap-4 border-b border-[var(--border-subtle)] py-4 last:border-0"
                      >
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                          {producto.imagenes?.[0] ? (
                            <img
                              src={producto.imagenes[0]}
                              alt={producto.nombre}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingBag size={16} className="text-[var(--text-faint)]" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="mb-1 truncate text-[13px] font-light leading-tight text-[var(--text-primary)]">
                            {producto.nombre}
                          </p>
                          {vars && (
                            <p className={`mb-1 ${variacionesCarritoClassName}`}>{vars}</p>
                          )}
                          <p className="mb-3 text-[14px] font-light text-[var(--gold)]">
                            {(() => {
                              const { precio, consultar } = getProductoPrecios(
                                producto,
                                catalogType,
                              )
                              if (consultar || precio == null) return 'Consultar precio'
                              return formatPrecio(precio)
                            })()}
                          </p>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center overflow-hidden rounded-[2px] border border-[var(--border-input)]">
                              <button
                                onClick={() => actualizarCantidad(key, cantidad - 1)}
                                className="px-2.5 py-1.5 text-[var(--text-muted)] transition-all hover:bg-[var(--gold-muted)] hover:text-[var(--gold)]"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="border-x border-[var(--border-subtle)] px-3 text-[12px] font-light text-[var(--text-primary)]">
                                {cantidad}
                              </span>
                              <button
                                onClick={() => actualizarCantidad(key, cantidad + 1)}
                                className="px-2.5 py-1.5 text-[var(--text-muted)] transition-all hover:bg-[var(--gold-muted)] hover:text-[var(--gold)]"
                              >
                                <Plus size={11} />
                              </button>
                            </div>

                            <button
                              onClick={() => quitar(key)}
                              className="text-[var(--text-subtle)] transition-colors hover:text-red-500"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <p className="text-[12px] font-light text-[var(--text-secondary)]">
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

            {items.length > 0 && (
              <div className="space-y-4 border-t border-[var(--border-subtle)] px-6 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-light uppercase tracking-[1.5px] text-[var(--text-muted)]">
                    Subtotal
                  </span>
                  <span className="text-[18px] font-light text-[var(--gold)]">
                    {formatPrecio(subtotal)}
                  </span>
                </div>
                <p className="text-[12px] font-light text-[var(--text-subtle)]">
                  Envío calculado al finalizar el pedido
                </p>
                <Link
                  href={carritoHref}
                  onClick={onClose}
                  className="catalog-gold-cta block w-full rounded-[2px] py-3.5 text-center text-[11px] font-medium uppercase tracking-[3px]"
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
