'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Input, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import {
  Truck,
  CreditCard,
  Type,
  Plus,
  Save,
  LucideIcon,
  Store,
  MapPin,
  Globe,
  Gift,
  Clock,
  Sparkles,
  Trash2,
} from 'lucide-react'
import {
  AdminTableHead,
  AdminTableHeaderRow,
  AdminTableTh,
  AdminTableBody,
  AdminTableRow,
  AdminTableTd,
  AdminTableEmpty,
  AdminTableShell,
} from '@/components/admin/AdminTable'

type Config = Record<string, string>

type TabId = 'negocio' | 'contenido' | 'envios' | 'pagos'

const TABS: { id: TabId; label: string; icon: LucideIcon; desc: string }[] = [
  { id: 'negocio', label: 'Negocio', icon: Store, desc: 'Nombre y contacto de WhatsApp' },
  { id: 'contenido', label: 'Contenido', icon: Type, desc: 'Textos del inicio y nosotros' },
  { id: 'envios', label: 'Envíos', icon: Truck, desc: 'Costos y tiempos de entrega' },
  { id: 'pagos', label: 'Pagos', icon: CreditCard, desc: 'Métodos en el checkout' },
]

function InfoBanner({
  icon: Icon,
  children,
}: {
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-[2px] border border-[rgba(201,168,76,0.22)] bg-[rgba(201,168,76,0.06)] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(201,168,76,0.08)]">
      <Icon size={16} className="mt-0.5 shrink-0 text-[var(--gold-bright)]" />
      <p className="text-[12px] font-light leading-relaxed text-[var(--text-muted)]">
        {children}
      </p>
    </div>
  )
}

function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-[rgba(201,168,76,0.35)] to-transparent" />
        <h3 className="shrink-0 text-[10px] font-medium uppercase tracking-[2.5px] text-[var(--gold)]">
          {title}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-l from-[rgba(201,168,76,0.35)] to-transparent" />
      </div>
      {children}
    </section>
  )
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Config>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [metodosPago, setMetodosPago] = useState<string[]>([])
  const [nuevoMetodo, setNuevoMetodo] = useState('')
  const [tab, setTab] = useState<TabId>('negocio')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('configuracion').select('*')
    if (error) {
      toast.error('Error al cargar configuración')
      setLoading(false)
      return
    }

    const map: Config = {}
    data.forEach(row => {
      map[row.clave] = row.valor
    })
    setConfig(map)

    try {
      const metodos = JSON.parse(map['metodos_pago'] || '[]')
      setMetodosPago(Array.isArray(metodos) ? metodos : [])
    } catch {
      setMetodosPago([])
    }

    setLoading(false)
  }

  const updateConfig = (clave: string, valor: string) => {
    setConfig(prev => ({ ...prev, [clave]: valor }))
  }

  const agregarMetodo = () => {
    const m = nuevoMetodo.trim()
    if (!m) return
    if (metodosPago.includes(m)) {
      toast.error('Este método ya existe')
      return
    }
    setMetodosPago(prev => [...prev, m])
    setNuevoMetodo('')
  }

  const quitarMetodo = (metodo: string) => {
    setMetodosPago(prev => prev.filter(m => m !== metodo))
  }

  const handleGuardar = async () => {
    if (!config['whatsapp_numero']?.trim()) {
      toast.error('El número de WhatsApp es requerido')
      return
    }
    if (metodosPago.length === 0) {
      toast.error('Agrega al menos un método de pago')
      return
    }

    setSaving(true)

    const updates = {
      ...config,
      metodos_pago: JSON.stringify(metodosPago),
    }

    const results = await Promise.all(
      Object.entries(updates).map(([clave, valor]) =>
        supabase.from('configuracion').update({ valor }).eq('clave', clave)
      )
    )

    const hasError = results.some(r => r.error)
    if (hasError) toast.error('Error al guardar algunos campos')
    else toast.success('Configuración guardada correctamente')

    setSaving(false)
  }

  const inputInline =
    'min-w-0 flex-1 rounded-[2px] border border-[var(--border-input)] bg-[var(--bg-muted)] px-4 py-3 text-[13px] font-light text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:border-[rgba(201,168,76,0.65)] focus:outline-none transition-colors'

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] p-6 sm:p-8 lg:p-10">
        <div className="mb-10 flex justify-between border-b border-[rgba(201,168,76,0.16)] pb-8">
          <div>
            <div className="mb-3 h-3 w-20 animate-pulse rounded-[2px] bg-[var(--gold-muted)]" />
            <div className="h-9 w-64 animate-pulse rounded-[2px] bg-[var(--gold-muted)]" />
          </div>
          <div className="h-9 w-32 animate-pulse rounded-[2px] bg-[var(--gold-muted)]" />
        </div>
        <div className="space-y-3">
          <div className="h-64 w-full animate-pulse rounded-[2px] border border-[rgba(201,168,76,0.1)] bg-[var(--bg-card)] lg:h-80" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 border-b border-[rgba(201,168,76,0.16)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px w-8 bg-[var(--gold-bright)]" />
            <p className="text-[10px] font-light uppercase tracking-[3px] text-[rgba(201,168,76,0.9)]">
              Gestión
            </p>
          </div>
          <h1 className="text-3xl font-thin uppercase tracking-[2px] text-[var(--text-primary)] sm:text-4xl">
            Configuración
          </h1>
          <p className="mt-2 text-[13px] font-light text-[var(--text-muted)]">
            Ajustes generales de la tienda, envíos y checkout
          </p>
        </div>
        <Button
          onClick={handleGuardar}
          loading={saving}
          size="sm"
          className="self-start sm:self-auto"
        >
          <Save size={13} />
          Guardar cambios
        </Button>
      </div>

      {/* Tabs horizontales + panel */}
      <AdminTableShell className="overflow-hidden">
        <div className="flex flex-col">
          <nav className="grid grid-cols-2 gap-2 border-b border-[rgba(201,168,76,0.14)] p-3 sm:grid-cols-4">
            {TABS.map(({ id, label, icon: Icon, desc }) => {
              const activo = tab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`group relative flex items-start gap-2.5 rounded-[2px] border px-3 py-3 text-left transition-all sm:gap-3 sm:px-3.5 sm:py-3.5 ${
                    activo
                      ? 'border-[rgba(201,168,76,0.42)] bg-[rgba(201,168,76,0.12)] shadow-[0_4px_20px_rgba(0,0,0,0.18)]'
                      : 'border-[rgba(201,168,76,0.12)] bg-[var(--bg-muted)] hover:border-[rgba(201,168,76,0.28)] hover:bg-[rgba(201,168,76,0.05)]'
                  }`}
                >
                  {activo && (
                    <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--gold-bright)] sm:inset-x-3.5" />
                  )}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border transition-colors sm:h-9 sm:w-9 ${
                      activo
                        ? 'border-[rgba(201,168,76,0.38)] bg-[rgba(201,168,76,0.18)]'
                        : 'border-[rgba(201,168,76,0.14)] bg-[rgba(201,168,76,0.06)] group-hover:border-[rgba(201,168,76,0.28)]'
                    }`}
                  >
                    <Icon
                      size={16}
                      className={
                        activo
                          ? 'text-[var(--gold-bright)]'
                          : 'text-[rgba(201,168,76,0.55)] group-hover:text-[var(--gold-bright)]'
                      }
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[10px] font-light uppercase tracking-[1.2px] transition-colors sm:text-[11px] sm:tracking-[1.4px] ${
                        activo ? 'text-[var(--gold-bright)]' : 'text-[var(--text-primary)] group-hover:text-[var(--gold-bright)]'
                      }`}
                    >
                      {label}
                    </p>
                    <p className="mt-0.5 hidden text-[10px] font-light leading-snug text-[var(--text-subtle)] sm:mt-1 sm:block sm:text-[11px]">
                      {desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </nav>

          <div className="flex min-w-0 flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1 space-y-8 p-6"
              >
              {tab === 'negocio' && (
                <>
                  <InfoBanner icon={Store}>
                    Estos datos aparecen en el footer, WhatsApp del checkout y mensajes automáticos
                    al confirmar pedidos.
                  </InfoBanner>
                  <FormSection title="Datos del negocio">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input
                        label="Nombre del negocio"
                        value={config['nombre_negocio'] || ''}
                        onChange={e => updateConfig('nombre_negocio', e.target.value)}
                        placeholder="Tienda VM Fashion"
                      />
                      <Input
                        label="Número de WhatsApp *"
                        value={config['whatsapp_numero'] || ''}
                        onChange={e => updateConfig('whatsapp_numero', e.target.value)}
                        placeholder="573185867702"
                        hint="Con código de país, sin espacios. Ej: 573185867702"
                      />
                    </div>
                  </FormSection>
                </>
              )}

              {tab === 'contenido' && (
                <>
                  <InfoBanner icon={Sparkles}>
                    Personaliza los textos que ven tus clientes en la página de inicio y la sección
                    nosotros.
                  </InfoBanner>
                  <FormSection title="Hero — Página de inicio">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <Input
                        label="Título del inicio"
                        value={config['hero_titulo'] || ''}
                        onChange={e => updateConfig('hero_titulo', e.target.value)}
                        placeholder="Tu ritual de belleza ideal"
                      />
                      <Input
                        label="Subtítulo del inicio"
                        value={config['hero_subtitulo'] || ''}
                        onChange={e => updateConfig('hero_subtitulo', e.target.value)}
                        placeholder="Productos profesionales para cada tipo de cabello..."
                      />
                    </div>
                  </FormSection>
                  <FormSection title="Sección Nosotros">
                    <Textarea
                      label="Texto descriptivo"
                      value={config['texto_nosotros'] || ''}
                      onChange={e => updateConfig('texto_nosotros', e.target.value)}
                      placeholder="Somos Tienda VM Fashion, tu aliado de belleza en Armenia, Quindío."
                      rows={5}
                    />
                  </FormSection>
                </>
              )}

              {tab === 'envios' && (
                <>
                  <InfoBanner icon={Truck}>
                    El checkout calcula el envío automáticamente: si la ciudad es Armenia aplica la
                    tarifa local; cualquier otra ciudad usa la tarifa nacional.
                  </InfoBanner>

                  <FormSection title="Tarifas por zona">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-[2px] border border-[rgba(201,168,76,0.2)] bg-[var(--bg-muted)] p-5 transition-colors hover:border-[rgba(201,168,76,0.35)]">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.1)]">
                            <MapPin size={16} className="text-[var(--gold-bright)]" />
                          </div>
                          <div>
                            <p className="text-[12px] font-light uppercase tracking-[1px] text-[var(--text-primary)]">
                              Armenia
                            </p>
                            <p className="text-[10px] font-light text-[var(--text-subtle)]">
                              Entrega local
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <Input
                            label="Costo (COP)"
                            type="number"
                            value={config['envio_armenia'] || ''}
                            onChange={e => updateConfig('envio_armenia', e.target.value)}
                            placeholder="5000"
                          />
                          <Input
                            label="Tiempo de entrega"
                            value={config['tiempo_entrega_armenia'] || ''}
                            onChange={e => updateConfig('tiempo_entrega_armenia', e.target.value)}
                            placeholder="El mismo día"
                          />
                        </div>
                      </div>

                      <div className="rounded-[2px] border border-[rgba(201,168,76,0.2)] bg-[var(--bg-muted)] p-5 transition-colors hover:border-[rgba(201,168,76,0.35)]">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.1)]">
                            <Globe size={16} className="text-[var(--gold-bright)]" />
                          </div>
                          <div>
                            <p className="text-[12px] font-light uppercase tracking-[1px] text-[var(--text-primary)]">
                              Resto del país
                            </p>
                            <p className="text-[10px] font-light text-[var(--text-subtle)]">
                              Envío nacional
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <Input
                            label="Costo (COP)"
                            type="number"
                            value={config['envio_nacional'] || ''}
                            onChange={e => updateConfig('envio_nacional', e.target.value)}
                            placeholder="0"
                            hint="0 = A convenir con el cliente"
                          />
                          <Input
                            label="Tiempo de entrega"
                            value={config['tiempo_entrega_nacional'] || ''}
                            onChange={e => updateConfig('tiempo_entrega_nacional', e.target.value)}
                            placeholder="2 a 3 días hábiles"
                          />
                        </div>
                      </div>
                    </div>
                  </FormSection>

                  <FormSection title="Promoción de envío">
                    <div className="rounded-[2px] border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.06)] p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.12)]">
                          <Gift size={16} className="text-[var(--gold-bright)]" />
                        </div>
                        <div>
                          <p className="text-[12px] font-light uppercase tracking-[1px] text-[var(--text-primary)]">
                            Envío gratis
                          </p>
                          <p className="text-[10px] font-light text-[var(--text-subtle)]">
                            Monto mínimo para aplicar
                          </p>
                        </div>
                      </div>
                      <div className="max-w-sm">
                        <Input
                          label="Aplicar envío gratis desde (COP)"
                          type="number"
                          value={config['envio_gratis_desde'] || ''}
                          onChange={e => updateConfig('envio_gratis_desde', e.target.value)}
                          placeholder="0"
                          hint="0 = Desactivado. Ej: 100000 para gratis en pedidos ≥ $100.000"
                        />
                      </div>
                    </div>
                  </FormSection>
                </>
              )}

              {tab === 'pagos' && (
                <>
                  <InfoBanner icon={CreditCard}>
                    Estos métodos aparecen como opciones en el paso de pago del carrito. Agrega al
                    menos uno para que los clientes puedan completar su pedido.
                  </InfoBanner>

                  <FormSection title="Métodos activos">
                    <div className="overflow-x-auto rounded-[2px] border border-[var(--border-card)]">
                      <table className="w-full" style={{ minWidth: '480px' }}>
                        <AdminTableHead>
                          <AdminTableHeaderRow>
                            <AdminTableTh className="w-14">#</AdminTableTh>
                            <AdminTableTh>Método de pago</AdminTableTh>
                            <AdminTableTh className="w-28 text-right">Acciones</AdminTableTh>
                          </AdminTableHeaderRow>
                        </AdminTableHead>
                        <AdminTableBody>
                          {metodosPago.length === 0 ? (
                            <AdminTableEmpty
                              colSpan={3}
                              icon={CreditCard}
                              title="Sin métodos de pago"
                              description="Agrega al menos uno usando el formulario de abajo"
                            />
                          ) : (
                            metodosPago.map((metodo, i) => (
                              <AdminTableRow key={metodo}>
                                <AdminTableTd>
                                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[11px] font-light tabular-nums text-[var(--text-muted)]">
                                    {i + 1}
                                  </span>
                                </AdminTableTd>
                                <AdminTableTd>
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.08)]">
                                      <CreditCard size={14} className="text-[var(--gold-bright)]" />
                                    </div>
                                    <span className="text-[13px] font-light text-[var(--text-primary)]">
                                      {metodo}
                                    </span>
                                  </div>
                                </AdminTableTd>
                                <AdminTableTd className="text-right">
                                  <button
                                    type="button"
                                    onClick={() => quitarMetodo(metodo)}
                                    className="inline-flex items-center gap-1.5 rounded-[2px] border border-transparent px-2.5 py-1.5 text-[var(--text-muted)] transition-all hover:border-[rgba(248,113,113,0.25)] hover:bg-[rgba(248,113,113,0.08)] hover:text-red-400"
                                    aria-label={`Eliminar ${metodo}`}
                                  >
                                    <Trash2 size={14} />
                                    <span className="text-[10px] font-light uppercase tracking-[1px]">
                                      Quitar
                                    </span>
                                  </button>
                                </AdminTableTd>
                              </AdminTableRow>
                            ))
                          )}
                        </AdminTableBody>
                      </table>
                    </div>
                  </FormSection>

                  <FormSection title="Agregar método">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={nuevoMetodo}
                        onChange={e => setNuevoMetodo(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            agregarMetodo()
                          }
                        }}
                        placeholder="Ej: Nequi, Bancolombia, Efectivo..."
                        className={inputInline}
                      />
                      <Button
                        type="button"
                        onClick={agregarMetodo}
                        size="sm"
                        className="shrink-0 sm:w-auto"
                      >
                        <Plus size={13} />
                        Agregar
                      </Button>
                    </div>
                  </FormSection>
                </>
              )}
            </motion.div>
          </AnimatePresence>

            <div className="flex items-center justify-between gap-4 border-t border-[rgba(201,168,76,0.16)] bg-[var(--bg-muted)] px-6 py-4">
              <div className="flex items-center gap-2 text-[11px] font-light text-[var(--text-subtle)]">
                <Clock size={13} className="shrink-0 text-[rgba(201,168,76,0.55)]" />
                Los cambios se aplican al guardar
              </div>
              <Button
                onClick={handleGuardar}
                loading={saving}
                size="sm"
                className=""
              >
                <Save size={13} />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </AdminTableShell>
    </div>
  )
}
