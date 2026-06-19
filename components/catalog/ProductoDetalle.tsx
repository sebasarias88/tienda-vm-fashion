'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCarrito } from '@/lib/store'
import { Producto, ProductoSeccion, VariacionTipo } from '@/types'
import { getLineKey } from '@/lib/cart'
import { buildVariacionesSeleccionadas } from '@/lib/variaciones'
import {
  ShoppingBag,
  Plus,
  Minus,
  ChevronLeft,
  ChevronDown,
  ZoomIn,
  Check,
  Share2,
  ImageIcon,
  Package,
  Truck,
  MessageCircle,
  CreditCard,
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
import PageGoldAccent from '@/components/catalog/PageGoldAccent'

const ENVIO_INFO = [
  { icon: Package, text: 'Envío en Armenia el mismo día' },
  { icon: Truck, text: 'Envíos nacionales en 2 a 3 días hábiles' },
  { icon: MessageCircle, text: 'Pedido finalizado por WhatsApp' },
  { icon: CreditCard, text: 'Paga a cuotas con Addi o Sistecrédito' },
] as const

function SeccionAcordeon({
  seccion,
  defaultOpen = false,
}: {
  seccion: ProductoSeccion
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-[var(--border-subtle)]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="group flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span
          className={`text-[14px] font-light tracking-[0.5px] transition-colors ${
            open ? 'text-[var(--gold)]' : 'text-[var(--text-primary)] group-hover:text-[var(--gold)]'
          }`}
        >
          {seccion.titulo}
        </span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
            open
              ? 'border-[var(--gold)] text-[var(--gold)]'
              : 'border-[var(--border-input)] text-[var(--text-muted)] group-hover:border-[var(--gold)] group-hover:text-[var(--gold)]'
          }`}
        >
          <ChevronDown
            size={15}
            className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="whitespace-pre-line pb-5 text-[14px] font-light leading-[1.8] text-[var(--text-muted)]">
              {seccion.descripcion}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ProductoDetalle({
  producto,
  catalogType = 'detal',
  variaciones = [],
  secciones = [],
}: {
  producto: Producto
  catalogType?: 'detal' | 'mayoreo'
  variaciones?: VariacionTipo[]
  secciones?: ProductoSeccion[]
}) {
  const agregar = useCarrito(s => s.agregar)
  const items = useCarrito(s => s.items)

  const [imagenActiva, setImagenActiva] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [agregado, setAgregado] = useState(false)
  const [selectedVariaciones, setSelectedVariaciones] = useState<Record<string, string[]>>({})

  const tieneVariaciones = variaciones.length > 0

  const toggleOpcion = (tipoId: string, opcionId: string) => {
    setSelectedVariaciones(prev => {
      const actuales = prev[tipoId] ?? []
      return {
        ...prev,
        [tipoId]: actuales.includes(opcionId)
          ? actuales.filter(id => id !== opcionId)
          : [...actuales, opcionId],
      }
    })
  }

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

  const handleAgregar = () => {
    if (!producto.disponible) return

    if (tieneVariaciones) {
      const faltantes = variaciones.filter(
        tipo => !(selectedVariaciones[tipo.id]?.length),
      )
      if (faltantes.length > 0) {
        toast.error('Selecciona al menos una opción del producto')
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
    <div className={`relative min-h-screen ${catalogType === 'mayoreo' ? 'pt-28 sm:pt-32' : 'pt-20 sm:pt-24'}`}>
      <PageGoldAccent />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        {/* Navegación superior */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <Link
            href={productosHref}
            className="group inline-flex items-center gap-2 text-[11px] font-light uppercase tracking-[2px] text-[var(--text-muted)] transition-colors hover:text-[var(--gold)]"
          >
            <ChevronLeft
              size={16}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Volver al catálogo
          </Link>

          <nav
            aria-label="Ruta de navegación"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-light uppercase tracking-[1.2px] text-[var(--text-faint)]"
          >
            <Link href={homeHref} className="transition-colors hover:text-[var(--gold)]">
              Inicio
            </Link>
            <span>/</span>
            <Link href={productosHref} className="transition-colors hover:text-[var(--gold)]">
              Catálogo
            </Link>
            {producto.categoria && (
              <>
                <span>/</span>
                <Link
                  href={`${productosHref}?categoria=${producto.categoria.slug}`}
                  className="transition-colors hover:text-[var(--gold)]"
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
              className="group relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-[var(--bg-surface)]"
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
                  <ImageIcon size={48} className="text-[var(--text-faint)]" />
                </div>
              )}

              {imagenes.length > 0 && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-[var(--bg-overlay)] px-2.5 py-1.5 text-[10px] font-light uppercase tracking-[1px] text-[var(--text-primary)] opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <ZoomIn size={12} className="text-[var(--gold)]" />
                  Ampliar
                </div>
              )}

              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {!producto.disponible && (
                  <span className="rounded-lg bg-[var(--badge-agotado-bg)] px-2.5 py-1 text-[9px] font-light uppercase tracking-[1.5px] text-[var(--text-primary)] backdrop-blur-sm md:rounded-[2px]">
                    Agotado
                  </span>
                )}
                {descuento && producto.disponible && (
                  <span className="rounded-lg bg-[var(--badge-oferta-bg)] px-2.5 py-1 text-[9px] font-light uppercase tracking-[1.5px] text-[var(--gold)] backdrop-blur-sm md:rounded-[2px]">
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
                      <span className="absolute inset-x-1 bottom-0 h-px bg-[var(--gold)]" />
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
                <div className="h-px w-8 bg-[var(--gold)] opacity-40" />
                <Link
                  href={`${productosHref}?categoria=${producto.categoria.slug}`}
                  className="catalog-eyebrow tracking-[3px] transition-colors hover:text-[var(--gold)]"
                >
                  {producto.categoria.nombre}
                </Link>
              </div>
            )}

            <h1 className="text-[1.75rem] font-thin leading-tight tracking-[-0.3px] text-[var(--text-primary)] sm:text-[2rem] lg:text-[2.25rem]">
              {producto.nombre}
            </h1>

            {producto.sku && (
              <p className="mt-3 text-[11px] font-light uppercase tracking-[1.5px] text-[var(--text-subtle)]">
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
              <p className="mt-8 text-[15px] font-light leading-[1.85] text-[var(--text-muted)]">
                {producto.descripcion}
              </p>
            )}

            {tieneVariaciones && (
              <div className="mt-8 space-y-7">
                {variaciones.map(tipo => {
                  return (
                  <div key={tipo.id}>
                    <div className="mb-3 flex items-baseline gap-3">
                      <p className="flex items-center gap-2.5 text-[11px] font-light uppercase tracking-[2px] text-[var(--gold-subtle)]">
                        <span className="h-px w-5 bg-[var(--gold)] opacity-40" />
                        {tipo.nombre}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {tipo.opciones?.map(opcion => {
                        const selected = selectedVariaciones[tipo.id]?.includes(opcion.id) ?? false
                        const unavailable = !opcion.disponible

                        if (opcion.valor_color) {
                          return (
                            <button
                              key={opcion.id}
                              type="button"
                              title={opcion.nombre}
                              disabled={unavailable}
                              onClick={() => toggleOpcion(tipo.id, opcion.id)}
                              className={`rounded-full p-0.5 transition-all ${
                                unavailable
                                  ? 'cursor-not-allowed opacity-40'
                                  : 'cursor-pointer'
                              } ${
                                selected
                                  ? 'ring-2 ring-[var(--gold)] ring-offset-2 ring-offset-[var(--bg-base)]'
                                  : ''
                              }`}
                            >
                              <span
                                className="block h-8 w-8 rounded-full border-2 border-transparent"
                                style={{
                                  backgroundColor: opcion.valor_color,
                                  borderColor: selected ? 'var(--gold)' : 'transparent',
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
                            onClick={() => toggleOpcion(tipo.id, opcion.id)}
                            className={`min-h-[42px] rounded-xl border px-4 py-2.5 text-[12px] font-light tracking-[0.3px] transition-all duration-200 md:rounded-[4px] ${
                              unavailable
                                ? 'cursor-not-allowed border-[var(--border-subtle)] text-[var(--text-faint)] line-through opacity-50'
                                : selected
                                  ? 'border-[var(--gold)] bg-[var(--gold-muted)] text-[var(--gold)] shadow-[0_2px_14px_var(--glow-gold)]'
                                  : 'border-[var(--border-input)] bg-[var(--bg-surface)]/40 text-[var(--text-muted)] hover:border-[var(--gold)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            {opcion.nombre}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  )
                })}
              </div>
            )}

            <div className="my-8 h-px bg-[rgba(201,168,76,0.18)]" />

            {producto.disponible ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-[11px] font-light uppercase tracking-[1.5px] text-[var(--text-muted)]">
                    Cantidad
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCantidad(c => Math.max(1, c - 1))}
                      className="flex h-9 w-9 items-center justify-center text-[var(--text-secondary)] transition-colors hover:text-[var(--gold)]"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-[2rem] text-center text-[15px] font-light text-[var(--text-primary)]">
                      {cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCantidad(c => c + 1)}
                      className="flex h-9 w-9 items-center justify-center text-[var(--text-secondary)] transition-colors hover:text-[var(--gold)]"
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
                  className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 text-[11px] font-medium uppercase tracking-[2.5px] transition-all duration-300 md:rounded-[2px] ${
                    agregado
                      ? 'bg-emerald-600 text-white'
                      : 'catalog-gold-cta'
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
                    className="block w-full py-3.5 text-center text-[11px] font-light uppercase tracking-[2px] text-[var(--gold)] transition-colors hover:text-[var(--gold-bright)]"
                  >
                    Ver carrito →
                  </Link>
                )}
              </div>
            ) : (
              <div className="py-5 text-center">
                <p className="text-[11px] font-light uppercase tracking-[2px] text-[var(--text-subtle)]">
                  Producto agotado
                </p>
              </div>
            )}

            <ul className="mt-8 space-y-3.5">
              {ENVIO_INFO.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon size={15} className="mt-0.5 shrink-0 text-[var(--gold-subtle)]" />
                  <span className="text-[13px] catalog-lead leading-relaxed">
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleCompartir}
              className="group mt-8 inline-flex items-center gap-2 border-b border-[var(--border)] pb-1 text-[11px] font-medium uppercase tracking-[2px] text-[var(--text-muted)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              <Share2 size={13} />
              Compartir producto
            </button>
          </motion.div>
        </div>

        {/* Secciones de información (estilo marketplace) */}
        {secciones.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mt-14 sm:mt-20"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-8 bg-[var(--gold)] opacity-40" />
              <h2 className="catalog-eyebrow tracking-[3px]">
                Información del producto
              </h2>
            </div>
            <div className="max-w-3xl border-t border-[var(--border-subtle)]">
              {secciones.map((seccion, i) => (
                <SeccionAcordeon
                  key={seccion.id}
                  seccion={seccion}
                  defaultOpen={i === 0}
                />
              ))}
            </div>
          </motion.section>
        )}
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
              className="max-h-full max-w-full rounded-lg object-contain md:rounded-[2px]"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              className="absolute right-5 top-5 rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] md:rounded-[2px]"
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
