'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  MapPin,
  User,
  CreditCard,
  FileText,
  Truck,
  Package,
  Phone,
  Info,
  Store,
} from 'lucide-react'
import { ItemCarrito, DatosCliente, MetodoPagoConfig, TipoEntrega } from '@/types'
import { type CatalogType } from '@/lib/catalog'
import { formatCargoLabel } from '@/lib/metodosPago'
import { DIRECCION_COMPLETA } from '@/lib/negocio'
import MobileCartSteps, { type Step } from '@/components/catalog/mobile/cart/MobileCartSteps'
import MobileCartItem, { formatPrecio } from '@/components/catalog/mobile/cart/MobileCartItem'
import MobileCartSummary from '@/components/catalog/mobile/cart/MobileCartSummary'
import MobileCartStickyBar from '@/components/catalog/mobile/cart/MobileCartStickyBar'
import MobileCartReviewItem from '@/components/catalog/mobile/cart/MobileCartReviewItem'
import { itemLineKey } from '@/lib/cart'

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

type Config = {
  metodos_pago: string[]
}

type CarritoMobileProps = {
  catalogType: CatalogType
  productosHref: string
  step: Step
  setStep: (step: Step) => void
  stepIndex: number
  items: ItemCarrito[]
  quitar: (key: string) => void
  actualizarCantidad: (key: string, cantidad: number) => void
  subtotal: number
  minimoMayoreo: number
  cumpleMinimo: boolean
  faltaParaMinimo: number
  datos: DatosCliente
  setDatos: React.Dispatch<React.SetStateAction<DatosCliente>>
  errores: Partial<Record<keyof DatosCliente, string>>
  setErrores: React.Dispatch<
    React.SetStateAction<Partial<Record<keyof DatosCliente, string>>>
  >
  config: Config
  loadingConfig: boolean
  enviando: boolean
  costoEnvio: number
  envioGratis: boolean
  tiempoEntrega: string
  totalFinal: number
  cargoAdicional: number
  descripcionCargo: string | null
  metodosConfig: MetodoPagoConfig[]
  metodoPagoConfig: MetodoPagoConfig | null
  setMetodoPagoConfig: React.Dispatch<React.SetStateAction<MetodoPagoConfig | null>>
  esRecogida: boolean
  seleccionarTipoEntrega: (tipo: TipoEntrega) => void
  handleContinuar: () => void
  handleConfirmar: () => void
  handleEnviarWhatsApp: () => void
  inputClass: (campo: keyof DatosCliente) => string
}

function CartFormField({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className={`mobile-cart-checkout-field${error ? ' mobile-cart-checkout-field--error' : ''}`}>
      <label htmlFor={id} className="mobile-cart-checkout-field__label">
        {label}
        {required ? <span className="text-[var(--gold)]"> *</span> : null}
      </label>
      {children}
      {error ? <p className="mobile-cart-checkout-field__error">{error}</p> : null}
    </div>
  )
}

const checkoutInputClass = 'mobile-cart-checkout-field__input'

export default function CarritoMobile({
  catalogType,
  productosHref,
  step,
  setStep,
  stepIndex,
  items,
  quitar,
  actualizarCantidad,
  subtotal,
  minimoMayoreo,
  cumpleMinimo,
  faltaParaMinimo,
  datos,
  setDatos,
  errores,
  setErrores,
  config,
  loadingConfig,
  enviando,
  costoEnvio,
  envioGratis,
  tiempoEntrega,
  totalFinal,
  cargoAdicional,
  descripcionCargo,
  metodosConfig,
  metodoPagoConfig,
  setMetodoPagoConfig,
  esRecogida,
  seleccionarTipoEntrega,
  handleContinuar,
  handleConfirmar,
  handleEnviarWhatsApp,
}: CarritoMobileProps) {
  const stickySpacer =
    step === 'resumen'
      ? 'h-[calc(10.5rem+env(safe-area-inset-bottom,0px))]'
      : step === 'datos'
        ? 'h-[calc(9rem+env(safe-area-inset-bottom,0px))]'
        : 'h-[calc(7.5rem+env(safe-area-inset-bottom,0px))]'

  return (
    <div className="mobile-catalog-page mobile-cart-page relative z-10 mx-auto max-w-lg px-4 pb-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="h-px w-6 bg-[var(--gold)]" />
          <span className="catalog-eyebrow text-[10px] tracking-[2.5px]">Mi pedido</span>
        </div>
        <h1 className="text-[1.5rem] font-thin uppercase tracking-[1px] text-[var(--text-primary)]">
          Tu <span className="gold-shimmer">carrito</span>
        </h1>
      </motion.div>

      <div className="mb-6">
        <MobileCartSteps
          step={step}
          stepIndex={stepIndex}
          onStepClick={setStep}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 'carrito' && (
          <motion.div
            key="carrito"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {items.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] px-6 py-16 text-center shadow-[var(--shadow-soft)]">
                <ShoppingBag size={44} className="mb-4 text-[var(--text-faint)]" />
                <p className="text-[13px] font-medium uppercase tracking-[1.5px] text-[var(--text-subtle)]">
                  Tu carrito está vacío
                </p>
                <Link
                  href={productosHref}
                  className="catalog-gold-cta mt-6 flex min-h-[52px] w-full max-w-xs items-center justify-center rounded-xl text-[12px] font-semibold uppercase tracking-[1.5px]"
                >
                  Ver catálogo
                </Link>
              </div>
            ) : (
              <>
                <div className="mobile-cart-list-panel">
                  <div className="mobile-cart-list-panel__header">
                    <div className="flex min-w-0 items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--gold)]">
                          Tu selección
                        </p>
                        <p className="mt-1 text-[12px] font-light text-[var(--text-muted)]">
                          {items.length} artículo{items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="mobile-cart-list-panel__count">{items.length}</span>
                    </div>
                  </div>
                  <div className="mobile-cart-item-list">
                    <AnimatePresence initial={false}>
                      {items.map(item => {
                        const key = itemLineKey(item)
                        return (
                          <MobileCartItem
                            key={key}
                            item={item}
                            catalogType={catalogType}
                            onDecrease={() => actualizarCantidad(key, item.cantidad - 1)}
                            onIncrease={() => actualizarCantidad(key, item.cantidad + 1)}
                            onRemove={() => quitar(key)}
                          />
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-5">
                  <MobileCartSummary
                    items={items}
                    subtotal={subtotal}
                    catalogType={catalogType}
                    compact
                  />
                  {catalogType === 'mayoreo' && !cumpleMinimo && (
                    <div className="mt-4 rounded-xl border border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.08)] p-4 md:rounded-[2px]">
                      <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-[var(--gold)]">
                        Compra mínima mayorista
                      </p>
                      <p className="mt-1.5 text-[12px] font-light leading-relaxed text-[var(--text-secondary)]">
                        El pedido mínimo es {formatPrecio(minimoMayoreo)}. Te faltan{' '}
                        <span className="font-medium text-[var(--gold)]">
                          {formatPrecio(faltaParaMinimo)}
                        </span>
                        .
                      </p>
                    </div>
                  )}
                  <p className="mt-3 text-center text-[11px] font-light leading-relaxed text-[var(--text-subtle)]">
                    En el siguiente paso eliges envío a domicilio o recogida en tienda.
                  </p>
                  <Link
                    href={productosHref}
                    className="mt-4 block py-2 text-center text-[11px] font-medium uppercase tracking-[1.5px] text-[var(--text-muted)] active:text-[var(--gold)]"
                  >
                    ← Seguir comprando
                  </Link>
                </div>

                <div className={stickySpacer} aria-hidden />

                <MobileCartStickyBar
                  totalLabel="Subtotal"
                  totalValue={formatPrecio(subtotal)}
                  primaryLabel="Continuar"
                  onPrimary={handleContinuar}
                  primaryDisabled={catalogType === 'mayoreo' && !cumpleMinimo}
                  hint={
                    catalogType === 'mayoreo' && !cumpleMinimo
                      ? `Mínimo ${formatPrecio(minimoMayoreo)} — faltan ${formatPrecio(faltaParaMinimo)}`
                      : `${items.length} producto${items.length !== 1 ? 's' : ''} en tu carrito`
                  }
                />
              </>
            )}
          </motion.div>
        )}

        {step === 'datos' && (
          <motion.div
            key="datos"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-5 pb-1"
          >
            <div className="mobile-cart-list-panel">
              <div className="mobile-cart-list-panel__header">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--gold)]">
                    Tus datos
                  </p>
                  <p className="mt-1 text-[12px] font-light text-[var(--text-muted)]">
                    Nombre y celular de contacto
                  </p>
                </div>
              </div>

              <div className="mobile-cart-checkout-fields">
                <CartFormField id="cart-nombre" label="Nombre completo" required error={errores.nombre}>
                  <input
                    id="cart-nombre"
                    type="text"
                    value={datos.nombre}
                    onChange={e => {
                      setDatos(d => ({ ...d, nombre: e.target.value }))
                      if (errores.nombre) setErrores(er => ({ ...er, nombre: '' }))
                    }}
                    placeholder="Ej: María López"
                    className={checkoutInputClass}
                    autoComplete="name"
                  />
                </CartFormField>

                <CartFormField id="cart-celular" label="Celular" required error={errores.celular}>
                  <input
                    id="cart-celular"
                    type="tel"
                    inputMode="tel"
                    value={datos.celular}
                    onChange={e => {
                      setDatos(d => ({ ...d, celular: e.target.value }))
                      if (errores.celular) setErrores(er => ({ ...er, celular: '' }))
                    }}
                    placeholder="Ej: 3001234567"
                    className={checkoutInputClass}
                    autoComplete="tel"
                  />
                </CartFormField>
              </div>
            </div>

            <div className="mobile-cart-list-panel">
              <div className="mobile-cart-list-panel__header">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--gold)]">
                    Tipo de entrega
                  </p>
                  <p className="mt-1 text-[12px] font-light text-[var(--text-muted)]">
                    ¿Envío o recoges en tienda?
                  </p>
                </div>
              </div>

              <div className="space-y-2 px-4 py-3">
                {(
                  [
                    {
                      id: 'envio' as const,
                      icon: Truck,
                      title: 'Envío a domicilio',
                      desc: 'Llevamos el pedido a tu dirección',
                    },
                    {
                      id: 'recogida' as const,
                      icon: Store,
                      title: 'Recoger en tienda',
                      desc: 'Sin costo de envío · Armenia',
                    },
                  ] as const
                ).map(opcion => {
                  const selected = datos.tipoEntrega === opcion.id
                  const Icon = opcion.icon
                  return (
                    <motion.button
                      key={opcion.id}
                      type="button"
                      whileTap={{ scale: 0.99 }}
                      onClick={() => seleccionarTipoEntrega(opcion.id)}
                      className={`flex w-full items-start gap-3 rounded-[2px] border px-4 py-3.5 text-left transition-all ${
                        selected
                          ? 'border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.08)]'
                          : 'border-[var(--border-subtle)]'
                      }`}
                    >
                      <Icon
                        size={16}
                        className={`mt-0.5 shrink-0 ${
                          selected ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-[13px] font-light ${
                            selected ? 'text-[var(--gold)]' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {opcion.title}
                        </p>
                        <p className="mt-0.5 text-[11px] font-light text-[var(--text-subtle)]">
                          {opcion.desc}
                        </p>
                      </div>
                      {selected ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-[var(--text-on-gold)]" />
                        </motion.div>
                      ) : null}
                    </motion.button>
                  )
                })}
                {errores.tipoEntrega ? (
                  <p className="text-[11px] text-red-400">{errores.tipoEntrega}</p>
                ) : null}
              </div>
            </div>

            {datos.tipoEntrega === 'recogida' ? (
              <div className="mobile-cart-list-panel">
                <div className="mobile-cart-list-panel__header">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--gold)]">
                      Punto de recogida
                    </p>
                    <p className="mt-1 text-[12px] font-light text-[var(--text-muted)]">
                      Tienda física
                    </p>
                  </div>
                </div>
                <div className="space-y-3 px-4 py-3">
                  <div className="rounded-[2px] border border-[rgba(201,168,76,0.18)] bg-[rgba(201,168,76,0.05)] p-3.5">
                    <p className="text-[13px] font-light text-[var(--text-primary)]">
                      Tienda VM Fashion
                    </p>
                    <p className="mt-1 text-[12px] font-light leading-relaxed text-[var(--text-muted)]">
                      {DIRECCION_COMPLETA}
                    </p>
                    <p className="mt-2.5 flex items-start gap-2 text-[11px] font-light text-[var(--gold-subtle)]">
                      <Info size={12} className="mt-0.5 shrink-0" />
                      Sin dirección de envío. Te avisamos cuando esté listo.
                    </p>
                  </div>
                  {cargoAdicional > 0 && datos.metodoPago ? (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 rounded-[2px] border border-[rgba(201,168,76,0.12)] bg-[rgba(201,168,76,0.04)] p-3"
                    >
                      <Info size={12} className="mt-0.5 shrink-0 text-[var(--gold)]" />
                      <p className="text-[11px] font-light leading-relaxed text-[var(--text-muted)]">
                        {descripcionCargo ||
                          `El método ${datos.metodoPago} incluye un cargo adicional de ${formatPrecio(cargoAdicional)}`}
                      </p>
                    </motion.div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {datos.tipoEntrega === 'envio' ? (
              <div className="mobile-cart-list-panel">
                <div className="mobile-cart-list-panel__header">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--gold)]">
                      Dirección de entrega
                    </p>
                    <p className="mt-1 text-[12px] font-light text-[var(--text-muted)]">
                      Para calcular el envío
                    </p>
                  </div>
                </div>

                <div className="mobile-cart-checkout-fields">
                  <CartFormField id="cart-ciudad" label="Ciudad" required error={errores.ciudad}>
                    <input
                      id="cart-ciudad"
                      type="text"
                      value={datos.ciudad}
                      onChange={e => {
                        setDatos(d => ({ ...d, ciudad: e.target.value }))
                        if (errores.ciudad) setErrores(er => ({ ...er, ciudad: '' }))
                      }}
                      placeholder="Ej: Armenia, Bogotá..."
                      className={checkoutInputClass}
                      autoComplete="address-level2"
                    />
                  </CartFormField>

                  {datos.ciudad.trim() ? (
                    <div className="mobile-cart-checkout-shipping">
                      <p className="flex items-start gap-2">
                        <Truck size={14} className="mt-0.5 shrink-0 text-[var(--gold)]" />
                        <span>
                          {envioGratis
                            ? 'Envío gratis para tu pedido'
                            : costoEnvio === 0
                              ? 'Envío a convenir con el negocio'
                              : `Envío: ${formatPrecio(costoEnvio)} — ${tiempoEntrega}`}
                        </span>
                      </p>
                    </div>
                  ) : null}

                  {cargoAdicional > 0 && datos.metodoPago ? (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 rounded-[2px] border border-[rgba(201,168,76,0.12)] bg-[rgba(201,168,76,0.04)] p-3"
                    >
                      <Info size={12} className="mt-0.5 shrink-0 text-[var(--gold)]" />
                      <p className="text-[11px] font-light leading-relaxed text-[var(--text-muted)]">
                        {descripcionCargo ||
                          `El método ${datos.metodoPago} incluye un cargo adicional de ${formatPrecio(cargoAdicional)}`}
                      </p>
                    </motion.div>
                  ) : null}

                  <CartFormField id="cart-direccion" label="Dirección" required error={errores.direccion}>
                    <input
                      id="cart-direccion"
                      type="text"
                      value={datos.direccion}
                      onChange={e => {
                        setDatos(d => ({ ...d, direccion: e.target.value }))
                        if (errores.direccion) setErrores(er => ({ ...er, direccion: '' }))
                      }}
                      placeholder="Calle, barrio, referencias..."
                      className={checkoutInputClass}
                      autoComplete="street-address"
                    />
                  </CartFormField>
                </div>
              </div>
            ) : null}

            <div className="mobile-cart-list-panel">
              <div className="mobile-cart-list-panel__header">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--gold)]">
                    Forma de pago
                  </p>
                  <p className="mt-1 text-[12px] font-light text-[var(--text-muted)]">
                    Elige cómo deseas pagar
                  </p>
                </div>
              </div>

              {loadingConfig ? (
                <div className="space-y-0 px-4 py-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="mb-2 h-11 animate-pulse rounded-lg bg-[var(--bg-muted)] last:mb-0" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 px-4 py-3">
                  {metodosConfig.map(metodo => {
                    const isSelected = datos.metodoPago === metodo.nombre
                    const tieneCargoExtra =
                      metodo.porcentaje_adicional > 0 || metodo.monto_adicional_fijo > 0

                    return (
                      <motion.button
                        key={metodo.id}
                        type="button"
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setDatos(d => ({ ...d, metodoPago: metodo.nombre }))
                          setMetodoPagoConfig(tieneCargoExtra ? metodo : null)
                          if (errores.metodoPago) {
                            setErrores(e => ({ ...e, metodoPago: '' }))
                          }
                        }}
                        className={`flex w-full items-center justify-between rounded-[2px] border px-4 py-3.5 text-left transition-all ${
                          isSelected
                            ? 'border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.08)]'
                            : 'border-[var(--border-subtle)] hover:border-[rgba(201,168,76,0.2)]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-[13px] font-light ${
                              isSelected ? 'text-[var(--gold)]' : 'text-[var(--text-secondary)]'
                            }`}
                          >
                            {metodo.nombre}
                          </p>
                          {tieneCargoExtra ? (
                            <p
                              className={`mt-0.5 text-[10px] font-light ${
                                isSelected
                                  ? 'text-[var(--gold-subtle)]'
                                  : 'text-[var(--text-faint)]'
                              }`}
                            >
                              {metodo.descripcion_cliente || formatCargoLabel(metodo)}
                            </p>
                          ) : null}
                        </div>

                        {isSelected ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-3 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-[var(--text-on-gold)]" />
                          </motion.div>
                        ) : null}
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {errores.metodoPago ? (
                <p className="px-4 pb-3 text-[11px] text-red-400">{errores.metodoPago}</p>
              ) : null}

              <div className="mobile-cart-checkout-notes">
                <label htmlFor="cart-notas" className="mobile-cart-checkout-notes__label">
                  Notas para la entrega <span>(opcional)</span>
                </label>
                <textarea
                  id="cart-notas"
                  value={datos.notas}
                  onChange={e => setDatos(d => ({ ...d, notas: e.target.value }))}
                  placeholder="Ej: dejar en portería, timbre no funciona..."
                  rows={2}
                />
              </div>
            </div>

            <div className={stickySpacer} aria-hidden />

            <MobileCartStickyBar
              totalLabel={cargoAdicional > 0 ? 'Total parcial' : 'Subtotal'}
              totalValue={formatPrecio(
                cargoAdicional > 0 ? subtotal + cargoAdicional : subtotal,
              )}
              primaryLabel="Revisar pedido"
              onPrimary={handleConfirmar}
              secondaryLabel="Volver"
              onSecondary={() => setStep('carrito')}
              layout="stack"
            />
          </motion.div>
        )}

        {step === 'resumen' && (
          <motion.div
            key="resumen"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="mobile-cart-whatsapp-banner flex items-center gap-3.5 rounded-xl border border-[var(--border-card)] p-4 shadow-[var(--shadow-soft)]">
              <span className="mobile-cart-whatsapp-banner__icon" aria-hidden>
                <WhatsAppIcon size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#1a9e4b]">
                  Listo para WhatsApp
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">
                  Último paso: confirma y te llevamos al chat con tu pedido armado.
                </p>
              </div>
            </div>

            <div className="mobile-cart-review-panel overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)]">
              <div className="mobile-cart-review-panel__header">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="mobile-cart-review-panel__icon" aria-hidden>
                    <Package size={15} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--gold)]">
                      Tu pedido
                    </p>
                    <p className="mt-0.5 text-[11px] font-light text-[var(--text-muted)]">
                      Revisa los artículos antes de enviar
                    </p>
                  </div>
                </div>
                <span className="mobile-cart-review-panel__count shrink-0">
                  {items.length}
                </span>
              </div>

              <div className="mobile-cart-review-list">
                {items.map(item => (
                  <MobileCartReviewItem
                    key={itemLineKey(item)}
                    item={item}
                    catalogType={catalogType}
                  />
                ))}
              </div>
            </div>

            <div className="mobile-cart-data-panel rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)]">
              <div className="mobile-cart-data-panel__header">
                <span className="mobile-cart-review-panel__icon" aria-hidden>
                  <User size={15} strokeWidth={1.75} />
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--gold)]">
                  Datos de entrega
                </p>
              </div>
              <dl className="mobile-cart-data-list">
                {[
                  { label: 'Nombre', value: datos.nombre, icon: User },
                  { label: 'Celular', value: datos.celular, icon: Phone },
                  {
                    label: 'Entrega',
                    value: esRecogida ? 'Recoger en tienda' : 'Envío a domicilio',
                    icon: esRecogida ? Store : Truck,
                  },
                  ...(esRecogida
                    ? [{ label: 'Tienda', value: DIRECCION_COMPLETA, icon: MapPin }]
                    : [
                        { label: 'Ciudad', value: datos.ciudad, icon: MapPin },
                        { label: 'Dirección', value: datos.direccion, icon: Truck },
                      ]),
                  { label: 'Pago', value: datos.metodoPago, icon: CreditCard },
                  ...(datos.notas ? [{ label: 'Notas', value: datos.notas, icon: FileText }] : []),
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="mobile-cart-data-row">
                    <span className="mobile-cart-data-row__icon" aria-hidden>
                      <Icon size={13} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <dt>{label}</dt>
                      <dd className="truncate" title={value.length > 42 ? value : undefined}>
                        {value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <MobileCartSummary
              items={items}
              subtotal={subtotal}
              catalogType={catalogType}
              envio={costoEnvio}
              total={totalFinal}
              tiempoEntrega={tiempoEntrega}
              envioGratis={envioGratis}
              showEnvio
              compact
              esRecogida={esRecogida}
              cargoAdicional={cargoAdicional}
              metodoPago={datos.metodoPago}
              porcentajeAdicional={metodoPagoConfig?.porcentaje_adicional || 0}
            />

            <p className="text-center text-[11px] leading-relaxed text-[var(--text-subtle)]">
              Al confirmar se abrirá WhatsApp con tu pedido listo. No se procesa hasta que lo envíes.
            </p>

            <div className={stickySpacer} aria-hidden />

            <MobileCartStickyBar
              totalLabel="Total a pagar"
              totalValue={formatPrecio(totalFinal)}
              primaryLabel="Enviar por WhatsApp"
              onPrimary={handleEnviarWhatsApp}
              primaryDisabled={enviando}
              primaryLoading={enviando}
              primaryIcon={!enviando ? <WhatsAppIcon size={18} /> : undefined}
              variant="whatsapp"
              layout="stack"
              secondaryLabel="Volver a datos"
              onSecondary={() => setStep('datos')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
