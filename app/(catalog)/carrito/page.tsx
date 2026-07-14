'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useCarrito } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { DatosCliente, ItemCarrito } from '@/types'
import { generarMensajeWhatsApp, abrirWhatsApp } from '@/lib/whatsapp'
import {
  cartSubtotal,
  formatVariacionesResumen,
  itemLineKey,
  itemLineTotal,
  variacionesCarritoClassName,
} from '@/lib/cart'
import { parseCopValue } from '@/lib/currency'
import { catalogPath, MAYOREO_MIN_COMPRA, type CatalogType } from '@/lib/catalog'
import CarritoMobile from '@/components/catalog/mobile/cart/CarritoMobile'
import PageGoldAccent from '@/components/catalog/PageGoldAccent'
import StickySidebar from '@/components/catalog/StickySidebar'
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ChevronRight,
  ChevronLeft,
  MapPin,
  User,
  CreditCard,
  FileText,
  Loader2,
  Package,
  Truck,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

function formatPrecio(precio: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precio)
}

function WhatsAppIcon({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

type Config = {
  whatsapp_numero: string
  envio_armenia: string
  envio_nacional: string
  envio_gratis_desde: string
  tiempo_entrega_armenia: string
  tiempo_entrega_nacional: string
  metodos_pago: string[]
}

type Step = 'carrito' | 'datos' | 'resumen'

const CIUDADES_ARMENIA = ['armenia', 'armenia quindío', 'armenia quindio']

const STEPS: { id: Step; label: string }[] = [
  { id: 'carrito', label: 'Carrito' },
  { id: 'datos', label: 'Tus datos' },
  { id: 'resumen', label: 'Confirmar' },
]

function SectionTitle({ icon: Icon, children }: { icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <Icon size={15} className="text-[var(--gold-subtle)]" />
      <h2 className="text-[12px] font-light uppercase tracking-[2px] text-[var(--gold)]">{children}</h2>
    </div>
  )
}

function CartSidebar({
  children,
  className = '',
  top = 96,
}: {
  children: React.ReactNode
  className?: string
  top?: number
}) {
  return (
    <StickySidebar className={className} top={top}>
      <aside className="w-full">{children}</aside>
    </StickySidebar>
  )
}

function OrderSummaryPanel({
  items,
  subtotal,
  catalogType,
  envio,
  total,
  tiempoEntrega,
  envioGratis,
  showEnvio = false,
}: {
  items: ItemCarrito[]
  subtotal: number
  catalogType: CatalogType
  envio?: number
  total?: number
  tiempoEntrega?: string
  envioGratis?: boolean
  showEnvio?: boolean
}) {
  return (
    <div className="space-y-4">
      <p className="text-[12px] font-light uppercase tracking-[2px] text-[var(--gold)]">Resumen</p>

      <div className="space-y-3 border-b border-[var(--border-subtle)] pb-4">
        {items.map((item) => {
          const key = itemLineKey(item)
          const { producto, cantidad, variacionesSeleccionadas } = item
          const vars = formatVariacionesResumen(variacionesSeleccionadas)

          return (
          <div key={key} className="flex gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden bg-[var(--bg-surface)]">
              {producto.imagenes?.[0] ? (
                <img src={producto.imagenes[0]} alt={producto.nombre} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingBag size={14} className="text-[var(--text-faint)]" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-light text-[var(--text-primary)]">{producto.nombre}</p>
              {vars && (
                <p className={`truncate ${variacionesCarritoClassName}`}>{vars}</p>
              )}
              <p className="text-[11px] font-light text-[var(--text-subtle)]">× {cantidad}</p>
            </div>
            <p className="shrink-0 text-[12px] font-light text-[var(--gold)]">
              {(() => {
                const line = itemLineTotal(item, catalogType)
                return line != null ? formatPrecio(line) : 'Consultar'
              })()}
            </p>
          </div>
          )
        })}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[13px] font-light">
          <span className="text-[var(--text-muted)]">Subtotal</span>
          <span className="text-[var(--text-primary)]">{formatPrecio(subtotal)}</span>
        </div>
        {showEnvio && (
          <>
            <div className="flex justify-between text-[13px] font-light">
              <span className="text-[var(--text-muted)]">Envío</span>
              <span className="text-[var(--text-primary)]">
                {envioGratis ? 'Gratis' : envio === 0 ? 'A convenir' : formatPrecio(envio ?? 0)}
              </span>
            </div>
            {tiempoEntrega && (
              <div className="flex justify-between text-[13px] font-light">
                <span className="text-[var(--text-muted)]">Entrega</span>
                <span className="text-[var(--text-primary)]">{tiempoEntrega}</span>
              </div>
            )}
          </>
        )}
        {total !== undefined && (
          <div className="flex items-baseline justify-between border-t border-[var(--border-subtle)] pt-3">
            <span className="text-[11px] font-light uppercase tracking-[1.5px] text-[var(--text-secondary)]">
              Total
            </span>
            <span className="text-xl font-light text-[var(--gold)]">{formatPrecio(total)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CarritoPage() {
  const pathname = usePathname()
  const catalogType: CatalogType = pathname.startsWith('/mayoreo') ? 'mayoreo' : 'detal'
  const productosHref = catalogPath(catalogType, '/productos')

  const { items, quitar, actualizarCantidad, vaciar } = useCarrito()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<Step>('carrito')
  const [config, setConfig] = useState<Config>({
    whatsapp_numero: '573185867702',
    envio_armenia: '5000',
    envio_nacional: '0',
    envio_gratis_desde: '0',
    tiempo_entrega_armenia: 'El mismo día',
    tiempo_entrega_nacional: '2 a 3 días hábiles',
    metodos_pago: ['Efectivo contra entrega', 'Nequi', 'Daviplata', 'Transferencia bancaria'],
  })
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [enviando, setEnviando] = useState(false)

  const [datos, setDatos] = useState<DatosCliente>({
    nombre: '',
    celular: '',
    direccion: '',
    ciudad: '',
    metodoPago: '',
    notas: '',
  })

  const [errores, setErrores] = useState<Partial<DatosCliente>>({})

  const fetchConfig = useCallback(async () => {
    const { data } = await supabase.from('configuracion').select('clave, valor')
    if (data) {
      const map: Record<string, string> = {}
      data.forEach(r => {
        map[r.clave] = r.valor
      })
      setConfig({
        whatsapp_numero: map['whatsapp_numero'] || '573185867702',
        envio_armenia: map['envio_armenia'] || '5000',
        envio_nacional: map['envio_nacional'] || '0',
        envio_gratis_desde: map['envio_gratis_desde'] || '0',
        tiempo_entrega_armenia: map['tiempo_entrega_armenia'] || 'El mismo día',
        tiempo_entrega_nacional: map['tiempo_entrega_nacional'] || '2 a 3 días hábiles',
        metodos_pago: (() => {
          const key =
            catalogType === 'mayoreo' ? 'metodos_pago_mayoreo' : 'metodos_pago_detal'
          const raw = map[key] ?? map['metodos_pago']
          try {
            const parsed = JSON.parse(raw || '[]')
            return Array.isArray(parsed) ? parsed : []
          } catch {
            return []
          }
        })(),
      })
    }
    setLoadingConfig(false)
  }, [catalogType])

  useEffect(() => {
    setMounted(true)
    void fetchConfig()
  }, [fetchConfig])

  const esArmenia = CIUDADES_ARMENIA.includes(datos.ciudad.toLowerCase().trim())
  const subtotal = useMemo(
    () => cartSubtotal(items, catalogType),
    [items, catalogType],
  )
  const envioGratisDesde = parseCopValue(config.envio_gratis_desde)
  const envioGratis = envioGratisDesde > 0 && subtotal >= envioGratisDesde

  const costoEnvio = envioGratis
    ? 0
    : esArmenia
      ? parseCopValue(config.envio_armenia)
      : parseCopValue(config.envio_nacional)

  const tiempoEntrega = esArmenia ? config.tiempo_entrega_armenia : config.tiempo_entrega_nacional

  const totalFinal = subtotal + costoEnvio
  const stepIndex = STEPS.findIndex(s => s.id === step)
  const stickyTop = catalogType === 'mayoreo' ? 100 : 96

  const minimoMayoreo = catalogType === 'mayoreo' ? MAYOREO_MIN_COMPRA : 0
  const cumpleMinimo = subtotal >= minimoMayoreo
  const faltaParaMinimo = Math.max(0, minimoMayoreo - subtotal)

  const validar = () => {
    const e: Partial<DatosCliente> = {}
    if (!datos.nombre.trim()) e.nombre = 'El nombre es requerido'
    if (!datos.celular.trim()) e.celular = 'El celular es requerido'
    else if (!/^[0-9+\s]{7,15}$/.test(datos.celular.trim())) e.celular = 'Número inválido'
    if (!datos.direccion.trim()) e.direccion = 'La dirección es requerida'
    if (!datos.ciudad.trim()) e.ciudad = 'La ciudad es requerida'
    if (!datos.metodoPago) e.metodoPago = 'Selecciona un método de pago'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const handleContinuar = () => {
    if (items.length === 0) {
      toast.error('Tu carrito está vacío')
      return
    }
    if (catalogType === 'mayoreo' && !cumpleMinimo) {
      toast.error(
        `La compra mínima mayorista es ${formatPrecio(minimoMayoreo)}`,
      )
      return
    }
    setStep('datos')
    scrollTop()
  }

  const handleConfirmar = () => {
    if (!validar()) {
      toast.error('Completa todos los campos requeridos')
      return
    }
    setStep('resumen')
    scrollTop()
  }

  const handleEnviarWhatsApp = () => {
    setEnviando(true)
    const mensaje = generarMensajeWhatsApp(
      items,
      datos,
      costoEnvio,
      tiempoEntrega,
      catalogType,
    )
    setTimeout(() => {
      abrirWhatsApp(mensaje, config.whatsapp_numero)
      vaciar()
      setEnviando(false)
      toast.success('¡Pedido enviado! Revisa tu WhatsApp')
    }, 800)
  }

  const inputClass = (campo: keyof DatosCliente) =>
    `w-full border-0 border-b bg-transparent py-3.5 text-[13px] font-light text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-faint)] ${
      errores[campo]
        ? 'border-red-400/50 focus:border-red-400'
        : 'border-[var(--border-input)] focus:border-[var(--gold)]'
    }`

  if (!mounted) return null

  const mobilePaddingTop =
    catalogType === 'mayoreo' ? 'max-md:pt-[5.75rem]' : 'max-md:pt-[3.75rem]'

  return (
    <>
      <PageGoldAccent />

      {/* ── Mobile checkout ── */}
      <div className={`relative min-h-screen md:hidden ${mobilePaddingTop}`}>
        <CarritoMobile
          catalogType={catalogType}
          productosHref={productosHref}
          step={step}
          setStep={setStep}
          stepIndex={stepIndex}
          items={items}
          quitar={key => {
            quitar(key)
            toast.success('Producto eliminado')
          }}
          actualizarCantidad={actualizarCantidad}
          subtotal={subtotal}
          minimoMayoreo={minimoMayoreo}
          cumpleMinimo={cumpleMinimo}
          faltaParaMinimo={faltaParaMinimo}
          datos={datos}
          setDatos={setDatos}
          errores={errores}
          setErrores={setErrores}
          config={config}
          loadingConfig={loadingConfig}
          enviando={enviando}
          costoEnvio={costoEnvio}
          envioGratis={envioGratis}
          tiempoEntrega={tiempoEntrega}
          totalFinal={totalFinal}
          handleContinuar={handleContinuar}
          handleConfirmar={handleConfirmar}
          handleEnviarWhatsApp={handleEnviarWhatsApp}
          inputClass={inputClass}
        />
      </div>

      {/* ── Desktop (sin cambios) ── */}
      <div className="relative hidden min-h-screen pb-16 pt-20 sm:pt-24 md:block">
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 border-b border-[var(--border-subtle)] pb-8"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-8 bg-[var(--gold)] opacity-40" />
            <span className="catalog-eyebrow tracking-[3px]">
              Mi pedido
            </span>
          </div>
          <h1 className="text-[1.75rem] font-thin uppercase leading-none tracking-[1.5px] text-[var(--text-primary)] sm:text-[2.125rem]">
            Tu{' '}
            <span className="gold-shimmer">carrito</span>
          </h1>

          {/* Steps */}
          <div className="mt-8 flex flex-wrap items-center gap-x-1 gap-y-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (i < stepIndex) setStep(s.id)
                  }}
                  disabled={i > stepIndex}
                  className={`relative px-3 py-2 text-[11px] font-light uppercase tracking-[1.2px] transition-colors ${
                    step === s.id
                      ? 'text-[var(--gold)]'
                      : i < stepIndex
                        ? 'text-[var(--text-secondary)] hover:text-[var(--gold)]'
                        : 'cursor-default text-[var(--text-faint)]'
                  }`}
                >
                  {s.label}
                  {step === s.id && (
                    <span className="absolute inset-x-2 bottom-0 h-px bg-[var(--gold)]" />
                  )}
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight size={14} className="mx-1 text-[var(--text-subtle)]" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* STEP 1: CARRITO */}
          {step === 'carrito' && (
            <motion.div
              key="carrito"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14"
            >
              <div className="min-w-0">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center py-20 text-center">
                    <ShoppingBag size={40} className="mb-4 text-[var(--text-faint)]" />
                    <p className="text-[13px] font-light uppercase tracking-[1.5px] text-[var(--text-subtle)]">
                      Tu carrito está vacío
                    </p>
                    <Link
                      href={productosHref}
                      className="mt-6 border-b border-[var(--border)] pb-1 text-[11px] font-light uppercase tracking-[2px] text-[var(--gold)] transition-colors hover:border-[var(--gold)]"
                    >
                      Ver catálogo →
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border-subtle)]">
                    <AnimatePresence initial={false}>
                      {items.map((item) => {
                        const key = itemLineKey(item)
                        const { producto, cantidad, variacionesSeleccionadas } = item
                        const vars = formatVariacionesResumen(variacionesSeleccionadas)

                        return (
                        <motion.div
                          key={key}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-4 py-5 first:pt-0"
                        >
                          <Link
                            href={catalogPath(catalogType, `/productos/${producto.slug}`)}
                            className="h-20 w-16 shrink-0 overflow-hidden bg-[var(--bg-surface)] sm:h-24 sm:w-20"
                          >
                            {producto.imagenes?.[0] ? (
                              <img
                                src={producto.imagenes[0]}
                                alt={producto.nombre}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ShoppingBag size={18} className="text-[var(--text-faint)]" />
                              </div>
                            )}
                          </Link>

                          <div className="min-w-0 flex-1">
                            {producto.categoria && (
                              <p className="mb-1 text-[10px] font-light uppercase tracking-[1.5px] text-[var(--gold-subtle)]">
                                {producto.categoria.nombre}
                              </p>
                            )}
                            <Link
                              href={catalogPath(catalogType, `/productos/${producto.slug}`)}
                              className="mb-1 block truncate text-[14px] font-light text-[var(--text-primary)] transition-colors hover:text-[var(--gold-bright)]"
                            >
                              {producto.nombre}
                            </Link>
                            {vars && (
                              <p className={`mb-2 ${variacionesCarritoClassName}`}>
                                {vars}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => actualizarCantidad(key, cantidad - 1)}
                                  className="flex h-8 w-8 items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--gold)]"
                                  aria-label="Disminuir cantidad"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="min-w-[1.5rem] text-center text-[14px] font-light text-[var(--text-primary)]">
                                  {cantidad}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => actualizarCantidad(key, cantidad + 1)}
                                  className="flex h-8 w-8 items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--gold)]"
                                  aria-label="Aumentar cantidad"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>

                              <div className="flex items-center gap-4">
                                <span className="text-[15px] font-light text-[var(--gold)]">
                                  {(() => {
                                    const line = itemLineTotal(item, catalogType)
                                    return line != null ? formatPrecio(line) : 'Consultar'
                                  })()}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    quitar(key)
                                    toast.success('Producto eliminado')
                                  }}
                                  className="text-[var(--text-subtle)] transition-colors hover:text-red-400"
                                  aria-label="Eliminar producto"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="space-y-6">
                  <OrderSummaryPanel
                    items={items}
                    subtotal={subtotal}
                    catalogType={catalogType}
                  />
                  {catalogType === 'mayoreo' && !cumpleMinimo && (
                    <div className="rounded-[2px] border border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.08)] p-4">
                      <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-[var(--gold)]">
                        Compra mínima mayorista
                      </p>
                      <p className="mt-1.5 text-[12px] font-light leading-relaxed text-[var(--text-secondary)]">
                        El pedido mínimo es {formatPrecio(minimoMayoreo)}. Te faltan{' '}
                        <span className="font-medium text-[var(--gold)]">
                          {formatPrecio(faltaParaMinimo)}
                        </span>{' '}
                        para continuar.
                      </p>
                    </div>
                  )}
                  <p className="text-[12px] font-light text-[var(--text-subtle)]">
                    El envío se calcula en el siguiente paso según tu ciudad.
                  </p>
                  <motion.button
                    type="button"
                    whileTap={catalogType === 'mayoreo' && !cumpleMinimo ? undefined : { scale: 0.98 }}
                    onClick={handleContinuar}
                    disabled={catalogType === 'mayoreo' && !cumpleMinimo}
                    className={`catalog-gold-cta flex w-full items-center justify-center gap-2 rounded-[2px] py-4 text-[11px] font-medium uppercase tracking-[2.5px] ${
                      catalogType === 'mayoreo' && !cumpleMinimo
                        ? 'cursor-not-allowed opacity-50'
                        : ''
                    }`}
                  >
                    Continuar
                    <ChevronRight size={14} />
                  </motion.button>
                  <Link
                    href={productosHref}
                    className="block text-center text-[11px] font-light uppercase tracking-[2px] text-[var(--text-muted)] transition-colors hover:text-[var(--gold)]"
                  >
                    ← Seguir comprando
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: DATOS */}
          {step === 'datos' && (
            <motion.div
              key="datos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14"
            >
              <div className="min-w-0 space-y-10">
                <section>
                  <SectionTitle icon={User}>Datos personales</SectionTitle>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[11px] font-light uppercase tracking-[1.5px] text-[var(--text-muted)]">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        value={datos.nombre}
                        onChange={e => {
                          setDatos(d => ({ ...d, nombre: e.target.value }))
                          if (errores.nombre) setErrores(er => ({ ...er, nombre: '' }))
                        }}
                        placeholder="Ej: María López"
                        className={inputClass('nombre')}
                      />
                      {errores.nombre && (
                        <p className="mt-1.5 text-[11px] font-light text-red-400">{errores.nombre}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-light uppercase tracking-[1.5px] text-[var(--text-muted)]">
                        Celular *
                      </label>
                      <input
                        type="tel"
                        value={datos.celular}
                        onChange={e => {
                          setDatos(d => ({ ...d, celular: e.target.value }))
                          if (errores.celular) setErrores(er => ({ ...er, celular: '' }))
                        }}
                        placeholder="Ej: 3001234567"
                        className={inputClass('celular')}
                      />
                      {errores.celular && (
                        <p className="mt-1.5 text-[11px] font-light text-red-400">{errores.celular}</p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="border-t border-[var(--border-subtle)] pt-10">
                  <SectionTitle icon={MapPin}>Dirección de entrega</SectionTitle>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-[11px] font-light uppercase tracking-[1.5px] text-[var(--text-muted)]">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={datos.ciudad}
                        onChange={e => {
                          setDatos(d => ({ ...d, ciudad: e.target.value }))
                          if (errores.ciudad) setErrores(er => ({ ...er, ciudad: '' }))
                        }}
                        placeholder="Ej: Armenia, Bogotá, Medellín..."
                        className={inputClass('ciudad')}
                      />
                      {errores.ciudad && (
                        <p className="mt-1.5 text-[11px] font-light text-red-400">{errores.ciudad}</p>
                      )}
                      {datos.ciudad.trim() && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 flex items-start gap-2 text-[12px] font-light text-[var(--gold-subtle)]"
                        >
                          <Truck size={13} className="mt-0.5 shrink-0" />
                          {envioGratis
                            ? 'Envío gratis para tu pedido'
                            : costoEnvio === 0
                              ? 'Envío a convenir con el negocio'
                              : `Envío estimado: ${formatPrecio(costoEnvio)} — ${tiempoEntrega}`}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-light uppercase tracking-[1.5px] text-[var(--text-muted)]">
                        Dirección completa *
                      </label>
                      <input
                        type="text"
                        value={datos.direccion}
                        onChange={e => {
                          setDatos(d => ({ ...d, direccion: e.target.value }))
                          if (errores.direccion) setErrores(er => ({ ...er, direccion: '' }))
                        }}
                        placeholder="Ej: Calle 10 #5-20, Barrio Los Andes"
                        className={inputClass('direccion')}
                      />
                      {errores.direccion && (
                        <p className="mt-1.5 text-[11px] font-light text-red-400">{errores.direccion}</p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="border-t border-[var(--border-subtle)] pt-10">
                  <SectionTitle icon={CreditCard}>Método de pago</SectionTitle>
                  {loadingConfig ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-11 animate-pulse border-b border-[var(--border-subtle)]" />
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--border-subtle)]">
                      {config.metodos_pago.map(metodo => (
                        <button
                          key={metodo}
                          type="button"
                          onClick={() => {
                            setDatos(d => ({ ...d, metodoPago: metodo }))
                            if (errores.metodoPago) setErrores(er => ({ ...er, metodoPago: '' }))
                          }}
                          className={`flex w-full items-center justify-between py-4 text-left transition-colors ${
                            datos.metodoPago === metodo
                              ? 'text-[var(--gold)]'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <span className="text-[14px] font-light">{metodo}</span>
                          <span
                            className={`h-4 w-4 rounded-full border transition-all ${
                              datos.metodoPago === metodo
                                ? 'border-[var(--gold)] bg-[var(--gold-light)]'
                                : 'border-[var(--border-input)]'
                            }`}
                          >
                            {datos.metodoPago === metodo && (
                              <span className="block h-full w-full scale-[0.4] rounded-full bg-[var(--text-on-gold)]" />
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {errores.metodoPago && (
                    <p className="mt-2 text-[11px] font-light text-red-400">{errores.metodoPago}</p>
                  )}
                </section>

                <section className="border-t border-[var(--border-subtle)] pt-10">
                  <SectionTitle icon={FileText}>Notas adicionales</SectionTitle>
                  <p className="mb-4 text-[12px] font-light text-[var(--text-subtle)]">Opcional</p>
                  <textarea
                    value={datos.notas}
                    onChange={e => setDatos(d => ({ ...d, notas: e.target.value }))}
                    placeholder="Indicaciones especiales para la entrega, referencias, etc."
                    rows={3}
                    className="w-full resize-none border-0 border-b border-[var(--border-input)] bg-transparent py-3 text-[13px] font-light text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--gold)]"
                  />
                </section>

                <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-8 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setStep('carrito')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[11px] font-light uppercase tracking-[2px] text-[var(--text-muted)] transition-colors hover:text-[var(--gold)]"
                  >
                    <ChevronLeft size={14} />
                    Volver
                  </button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmar}
                    className="catalog-gold-cta flex flex-1 items-center justify-center gap-2 rounded-[2px] py-3.5 text-[11px] font-medium uppercase tracking-[2.5px]"
                  >
                    Revisar pedido
                    <ChevronRight size={14} />
                  </motion.button>
                </div>
              </div>

              <CartSidebar className="hidden lg:block" top={stickyTop}>
                <OrderSummaryPanel
                  items={items}
                  subtotal={subtotal}
                  catalogType={catalogType}
                />
              </CartSidebar>
            </motion.div>
          )}

          {/* STEP 3: RESUMEN */}
          {step === 'resumen' && (
            <motion.div
              key="resumen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-2xl space-y-8"
            >
              <div>
                <div className="mb-6 flex items-center gap-2.5">
                  <WhatsAppIcon size={16} className="text-[var(--gold)]" />
                  <div>
                    <p className="text-[12px] font-light uppercase tracking-[2px] text-[var(--gold)]">
                      Resumen del pedido
                    </p>
                    <p className="mt-1 text-[12px] font-light text-[var(--text-muted)]">
                      Esto es lo que se enviará por WhatsApp
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <section>
                    <p className="mb-3 text-[11px] font-light uppercase tracking-[2px] text-[var(--gold-subtle)]">
                      Datos del cliente
                    </p>
                    <dl className="space-y-2.5">
                      {[
                        { label: 'Nombre', value: datos.nombre },
                        { label: 'Celular', value: datos.celular },
                        { label: 'Ciudad', value: datos.ciudad },
                        { label: 'Dirección', value: datos.direccion },
                        { label: 'Pago', value: datos.metodoPago },
                        ...(datos.notas ? [{ label: 'Notas', value: datos.notas }] : []),
                      ].map(({ label, value }) => (
                        <div key={label} className="flex gap-4 text-[13px] font-light">
                          <dt className="w-20 shrink-0 text-[var(--text-subtle)]">{label}</dt>
                          <dd className="text-[var(--text-primary)]">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>

                  <section className="border-t border-[var(--border-subtle)] pt-8">
                    <p className="mb-4 text-[11px] font-light uppercase tracking-[2px] text-[var(--gold-subtle)]">
                      Productos
                    </p>
                    <div className="space-y-3">
                      {items.map((item) => {
                        const key = itemLineKey(item)
                        const { producto, cantidad, variacionesSeleccionadas } = item
                        const vars = formatVariacionesResumen(variacionesSeleccionadas)

                        return (
                        <div key={key} className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden bg-[var(--bg-surface)]">
                            {producto.imagenes?.[0] && (
                              <img
                                src={producto.imagenes[0]}
                                alt={producto.nombre}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-light text-[var(--text-primary)]">{producto.nombre}</p>
                            {vars && (
                              <p className={`truncate ${variacionesCarritoClassName}`}>
                                {vars}
                              </p>
                            )}
                            <p className="text-[11px] font-light text-[var(--text-subtle)]">× {cantidad}</p>
                          </div>
                          <p className="shrink-0 text-[13px] font-light text-[var(--gold)]">
                            {(() => {
                              const line = itemLineTotal(item, catalogType)
                              return line != null ? formatPrecio(line) : 'Consultar'
                            })()}
                          </p>
                        </div>
                        )
                      })}
                    </div>
                  </section>

                  <section className="border-t border-[var(--border-subtle)] pt-8">
                    <p className="mb-4 flex items-center gap-2 text-[11px] font-light uppercase tracking-[2px] text-[var(--gold-subtle)]">
                      <Package size={13} />
                      Resumen de costos
                    </p>
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-[13px] font-light">
                        <span className="text-[var(--text-muted)]">Subtotal</span>
                        <span className="text-[var(--text-primary)]">{formatPrecio(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-[13px] font-light">
                        <span className="text-[var(--text-muted)]">Envío</span>
                        <span className="text-[var(--text-primary)]">
                          {envioGratis ? 'Gratis' : costoEnvio === 0 ? 'A convenir' : formatPrecio(costoEnvio)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[13px] font-light">
                        <span className="text-[var(--text-muted)]">Entrega</span>
                        <span className="text-[var(--text-primary)]">{tiempoEntrega}</span>
                      </div>
                      <div className="flex items-baseline justify-between border-t border-[var(--border-subtle)] pt-4">
                        <span className="text-[11px] font-light uppercase tracking-[1.5px] text-[var(--text-secondary)]">
                          Total
                        </span>
                        <span className="text-2xl font-light text-[var(--gold)]">{formatPrecio(totalFinal)}</span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep('datos')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[11px] font-light uppercase tracking-[2px] text-[var(--text-muted)] transition-colors hover:text-[var(--gold)]"
                >
                  <ChevronLeft size={14} />
                  Volver
                </button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnviarWhatsApp}
                  disabled={enviando}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[2px] bg-[#25D366] py-4 text-[11px] font-medium uppercase tracking-[2px] text-white transition-colors hover:bg-[#22c55e] disabled:opacity-60"
                >
                  {enviando ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Abriendo WhatsApp...
                    </>
                  ) : (
                    <>
                      <WhatsAppIcon size={14} />
                      Enviar pedido por WhatsApp
                    </>
                  )}
                </motion.button>
              </div>

              <p className="text-center text-[12px] font-light leading-relaxed text-[var(--text-subtle)]">
                Al confirmar, se abrirá WhatsApp con tu pedido listo para enviar. El pedido no se procesa hasta que
                lo envíes por WhatsApp.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  )
}
