'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCarrito } from '@/lib/store'
import { Producto, VariacionTipo } from '@/types'
import { getLineKey } from '@/lib/cart'
import {
  buildVariacionesSeleccionadas,
  resumenVariacionesTexto,
} from '@/lib/variaciones'
import {
  ShoppingBag,
  Plus,
  Minus,
  ChevronLeft,
  ZoomIn,
  Check,
  Share2,
  ImageIcon,
  Package,
  Truck,
  MessageCircle,
  X,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  catalogPath,
  getDescuentoPorcentaje,
  getProductoPrecios,
} from '@/lib/catalog'
import ProductoPrecio from '@/components/catalog/ProductoPrecio'

const ENVIO_INFO = [
  { icon: Package, text: 'Envío en Armenia el mismo día' },
  { icon: Truck, text: 'Envíos nacionales en 2 a 3 días hábiles' },
  { icon: MessageCircle, text: 'Pedido finalizado por WhatsApp' },
] as const

export default function ProductoDetalle({
  producto,
  catalogType = 'detal',
  variaciones = [],
}: {
  producto: Producto
  catalogType?: 'detal' | 'mayoreo'
  variaciones?: VariacionTipo[]
}) {
  const agregar = useCarrito(s => s.agregar)
  const items = useCarrito(s => s.items)

  const [imagenActiva, setImagenActiva] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [agregado, setAgregado] = useState(false)
  const [selectedVariaciones, setSelectedVariaciones] = useState<Record<string, string>>({})

  const tieneVariaciones = variaciones.length > 0

  const variacionesParaCarrito = buildVariacionesSeleccionadas(
    variaciones,
    selectedVariaciones,
  )
  const lineKeyActual = getLineKey(producto.id, variacionesParaCarrito)

  const enCarrito = items.find(i => {
    const key = i.lineKey ?? getLineKey(i.producto.id, i.variacionesSeleccionadas)
    return key === lineKeyActual
  })
  const imagenes = producto.imagenes?.length ? producto.imagenes : []

  const resumenSeleccion = resumenVariacionesTexto(variaciones, selectedVariaciones)

  const handleAgregar = () => {
    if (!producto.disponible) return

    if (tieneVariaciones) {
      const faltantes = variaciones.filter(tipo => !selectedVariaciones[tipo.id])
      if (faltantes.length > 0) {
        toast.error('Selecciona todas las opciones del producto')
        return
      }
    }

    for (let i = 0; i < cantidad; i++) {
      agregar(producto, variacionesParaCarrito)
    }
    setAgregado(true)
    toast.success(`${producto.nombre} agregado al carrito`)
    setTimeout(() => setAgregado(false), 2500)
  }

  const handleCompartir = async () => {
    try {
      await navigator.share({ title: producto.nombre, url: window.location.href })
    } catch {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Enlace copiado')
    }
  }

  const precios = getProductoPrecios(producto, catalogType)
  const descuento =
    precios.precio != null
      ? getDescuentoPorcentaje(precios.precio, precios.precioAntes)
      : null

  const productosHref = catalogPath(catalogType, '/productos')
  const homeHref = catalogPath(catalogType, '/')

  return (
    <div className={`min-h-screen ${catalogType === 'mayoreo' ? 'pt-28 sm:pt-32' : 'pt-20 sm:pt-24'}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        {/* Navegación superior */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 border-b border-[rgba(201,168,76,0.18)] pb-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <Link
            href={productosHref}
            className="group inline-flex items-center gap-2 text-[11px] font-light uppercase tracking-[2px] text-[rgba(240,235,228,0.72)] transition-colors hover:text-[#C9A84C]"
          >
            <ChevronLeft
              size={16}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Volver al catálogo
          </Link>

          <nav
            aria-label="Ruta de navegación"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-light uppercase tracking-[1.2px] text-[rgba(240,235,228,0.5)]"
          >
            <Link href={homeHref} className="transition-colors hover:text-[#C9A84C]">
              Inicio
            </Link>
            <span>/</span>
            <Link href={productosHref} className="transition-colors hover:text-[#C9A84C]">
              Catálogo
            </Link>
            {producto.categoria && (
              <>
                <span>/</span>
                <Link
                  href={`${productosHref}?categoria=${producto.categoria.slug}`}
                  className="transition-colors hover:text-[#C9A84C]"
                >
                  {producto.categoria.nombre}
                </Link>
              </>
            )}
          </nav>
        </motion.div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          {/* Galería */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="space-y-4"
          >
            <div
              className="group relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-[#141414]"
              onClick={() => imagenes.length && setZoomOpen(true)}
            >
              {imagenes.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={imagenActiva}
                    src={imagenes[imagenActiva]}
                    alt={producto.nombre}
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon size={48} className="text-[rgba(240,235,228,0.28)]" />
                </div>
              )}

              {imagenes.length > 0 && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-[rgba(10,10,10,0.85)] px-2.5 py-1.5 text-[10px] font-light uppercase tracking-[1px] text-[var(--text-primary)] opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <ZoomIn size={12} className="text-[#C9A84C]" />
                  Ampliar
                </div>
              )}

              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {!producto.disponible && (
                  <span className="rounded-[2px] bg-[rgba(10,10,10,0.92)] px-2.5 py-1 text-[9px] font-light uppercase tracking-[1.5px] text-[#f0ebe4] backdrop-blur-sm">
                    Agotado
                  </span>
                )}
                {descuento && producto.disponible && (
                  <span className="rounded-[2px] bg-[rgba(201,168,76,0.3)] px-2.5 py-1 text-[9px] font-light uppercase tracking-[1.5px] text-[#C9A84C] backdrop-blur-sm">
                    -{descuento}%
                  </span>
                )}
              </div>
            </div>

            {imagenes.length > 1 && (
              <div className="flex gap-3 overflow-x-auto overscroll-x-contain scrollbar-hide pb-0.5">
                {imagenes.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImagenActiva(i)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden transition-opacity ${
                      imagenActiva === i ? 'opacity-100' : 'opacity-45 hover:opacity-75'
                    }`}
                  >
                    <img src={url} alt={`Vista ${i + 1}`} className="h-full w-full object-cover" />
                    {imagenActiva === i && (
                      <span className="absolute inset-x-1 bottom-0 h-px bg-[#C9A84C]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="flex flex-col lg:sticky lg:top-24 lg:self-start"
          >
            {producto.categoria && (
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px w-8 bg-[#C9A84C]" />
                <Link
                  href={`${productosHref}?categoria=${producto.categoria.slug}`}
                  className="text-[11px] font-light uppercase tracking-[3px] text-[rgba(201,168,76,0.92)] transition-colors hover:text-[#C9A84C]"
                >
                  {producto.categoria.nombre}
                </Link>
              </div>
            )}

            <h1 className="text-[1.75rem] font-thin leading-tight tracking-[-0.3px] text-[#f0ebe4] sm:text-[2rem] lg:text-[2.25rem]">
              {producto.nombre}
            </h1>

            {producto.sku && (
              <p className="mt-3 text-[11px] font-light uppercase tracking-[1.5px] text-[rgba(240,235,228,0.55)]">
                SKU · {producto.sku}
              </p>
            )}

            <div className="mt-6">
              <ProductoPrecio
                producto={producto}
                catalogType={catalogType}
                disponible={producto.disponible}
                size="lg"
                layout="stack"
              />
            </div>

            {producto.descripcion && (
              <p className="mt-8 text-[15px] font-light leading-[1.85] text-[rgba(240,235,228,0.85)]">
                {producto.descripcion}
              </p>
            )}

            {tieneVariaciones && (
              <div className="mt-8 space-y-6">
                {variaciones.map(tipo => (
                  <div key={tipo.id}>
                    <p className="mb-3 text-[11px] font-light uppercase tracking-[2px] text-[rgba(201,168,76,0.92)]">
                      {tipo.nombre}
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {tipo.opciones?.map(opcion => {
                        const selected = selectedVariaciones[tipo.id] === opcion.id
                        const unavailable = !opcion.disponible

                        if (opcion.valor_color) {
                          return (
                            <button
                              key={opcion.id}
                              type="button"
                              title={opcion.nombre}
                              disabled={unavailable}
                              onClick={() =>
                                setSelectedVariaciones(prev => ({
                                  ...prev,
                                  [tipo.id]: opcion.id,
                                }))
                              }
                              className={`rounded-full p-0.5 transition-all ${
                                unavailable
                                  ? 'cursor-not-allowed opacity-40'
                                  : 'cursor-pointer'
                              } ${
                                selected
                                  ? 'ring-2 ring-[#B8922A] ring-offset-2 ring-offset-[var(--bg-base)]'
                                  : ''
                              }`}
                            >
                              <span
                                className="block h-8 w-8 rounded-full border-2 border-transparent"
                                style={{
                                  backgroundColor: opcion.valor_color,
                                  borderColor: selected ? '#B8922A' : 'transparent',
                                }}
                              />
                            </button>
                          )
                        }

                        return (
                          <button
                            key={opcion.id}
                            type="button"
                            disabled={unavailable}
                            onClick={() =>
                              setSelectedVariaciones(prev => ({
                                ...prev,
                                [tipo.id]: opcion.id,
                              }))
                            }
                            className={`rounded-[2px] border px-4 py-2 text-[12px] font-light transition-colors ${
                              unavailable
                                ? 'cursor-not-allowed opacity-40'
                                : selected
                                  ? 'border-[rgba(184,146,42,0.5)] bg-[rgba(184,146,42,0.08)] text-[#B8922A]'
                                  : 'border-[rgba(232,226,217,0.35)] bg-transparent text-[rgba(240,235,228,0.65)] hover:border-[rgba(184,146,42,0.35)]'
                            }`}
                          >
                            {opcion.nombre}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {resumenSeleccion && (
                  <p className="text-[12px] font-light text-[#6B6560]">
                    Seleccionado: {resumenSeleccion}
                  </p>
                )}
              </div>
            )}

            <div className="my-8 h-px bg-[rgba(201,168,76,0.18)]" />

            {producto.disponible ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-[11px] font-light uppercase tracking-[1.5px] text-[rgba(240,235,228,0.65)]">
                    Cantidad
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCantidad(c => Math.max(1, c - 1))}
                      className="flex h-9 w-9 items-center justify-center text-[rgba(240,235,228,0.78)] transition-colors hover:text-[#C9A84C]"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-[2rem] text-center text-[15px] font-light text-[#f0ebe4]">
                      {cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCantidad(c => c + 1)}
                      className="flex h-9 w-9 items-center justify-center text-[rgba(240,235,228,0.78)] transition-colors hover:text-[#C9A84C]"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {enCarrito && (
                    <span className="text-[12px] font-light text-[rgba(201,168,76,0.87)]">
                      {enCarrito.cantidad} en carrito
                    </span>
                  )}
                </div>

                <motion.button
                  type="button"
                  onClick={handleAgregar}
                  whileTap={{ scale: 0.98 }}
                  className={`flex w-full items-center justify-center gap-3 rounded-[2px] py-4 text-[11px] font-medium uppercase tracking-[2.5px] transition-all duration-300 ${
                    agregado
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#C9A84C] text-[#f0ebe4] hover:bg-[#D4AF37]'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {agregado ? (
                      <motion.span
                        key="check"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-center gap-2"
                      >
                        <Check size={14} />
                        Agregado al carrito
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingBag size={14} />
                        Agregar al carrito
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {enCarrito && (
                  <Link
                    href={catalogPath(catalogType, '/carrito')}
                    className="block w-full py-3.5 text-center text-[11px] font-light uppercase tracking-[2px] text-[#C9A84C] transition-colors hover:text-[#D4AF37]"
                  >
                    Ver carrito →
                  </Link>
                )}
              </div>
            ) : (
              <div className="py-5 text-center">
                <p className="text-[11px] font-light uppercase tracking-[2px] text-[rgba(240,235,228,0.58)]">
                  Producto agotado
                </p>
              </div>
            )}

            <ul className="mt-8 space-y-3.5">
              {ENVIO_INFO.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon size={15} className="mt-0.5 shrink-0 text-[rgba(201,168,76,0.77)]" />
                  <span className="text-[13px] font-light leading-relaxed text-[rgba(240,235,228,0.75)]">
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleCompartir}
              className="group mt-8 inline-flex items-center gap-2 border-b border-[rgba(201,168,76,0.36)] pb-1 text-[11px] font-light uppercase tracking-[2px] text-[rgba(240,235,228,0.72)] transition-colors hover:border-[#C9A84C] hover:text-[#C9A84C]"
            >
              <Share2 size={13} />
              Compartir producto
            </button>
          </motion.div>
        </div>
      </div>

      {/* Modal zoom */}
      <AnimatePresence>
        {zoomOpen && imagenes.length > 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-md"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomOpen(false)}
          >
            <motion.img
              src={imagenes[imagenActiva]}
              alt={producto.nombre}
              className="max-h-full max-w-full rounded-[2px] object-contain"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              className="absolute right-5 top-5 rounded-[2px] p-2 text-[rgba(240,235,228,0.82)] transition-colors hover:text-[#f0ebe4]"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
