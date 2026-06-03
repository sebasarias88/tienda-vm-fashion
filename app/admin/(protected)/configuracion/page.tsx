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
  Phone,
  Type,
  Plus,
  X,
  Save,
  LucideIcon,
} from 'lucide-react'

type Config = Record<string, string>

type TabId = 'negocio' | 'contenido' | 'envios' | 'pagos'

const TABS: { id: TabId; label: string; icon: LucideIcon; desc: string }[] = [
  { id: 'negocio', label: 'Negocio', icon: Phone, desc: 'Nombre y contacto de WhatsApp' },
  { id: 'contenido', label: 'Contenido', icon: Type, desc: 'Textos del inicio y nosotros' },
  { id: 'envios', label: 'Envíos', icon: Truck, desc: 'Costos y tiempos de entrega' },
  { id: 'pagos', label: 'Pagos', icon: CreditCard, desc: 'Métodos en el checkout' },
]

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

  const tabActivo = TABS.find(t => t.id === tab)!

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8 flex justify-between">
          <div>
            <div className="mb-2 h-3 w-16 animate-pulse rounded-[2px] bg-[rgba(240,235,228,0.08)]" />
            <div className="h-8 w-56 animate-pulse rounded-[2px] bg-[rgba(240,235,228,0.08)]" />
          </div>
          <div className="h-9 w-36 animate-pulse rounded-[2px] bg-[rgba(240,235,228,0.08)]" />
        </div>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-28 shrink-0 animate-pulse rounded-[2px] bg-[rgba(240,235,228,0.08)]" />
          ))}
        </div>
        <div className="h-96 w-full animate-pulse rounded-[2px] bg-[#0a0a0a]" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-light uppercase tracking-[3px] text-[rgba(184,146,42,0.82)]">
            Gestión
          </p>
          <h1 className="text-3xl font-thin uppercase tracking-[2px] text-[#1A1A1A]">Configuración</h1>
          <p className="mt-2 text-[12px] font-light text-[rgba(240,235,228,0.65)]">
            Ajustes generales de la tienda
          </p>
        </div>
        <Button onClick={handleGuardar} loading={saving} size="sm">
          <Save size={13} />
          Guardar
        </Button>
      </div>

      {/* Tabs horizontales */}
      <nav className="mb-5 flex gap-2 overflow-x-auto border-b border-[rgba(184,146,42,0.22)] pb-3 scrollbar-hide">
        {TABS.map(({ id, label, icon: Icon }) => {
          const activo = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-2 rounded-[2px] border px-4 py-2.5 transition-all ${
                activo
                  ? 'border-[rgba(184,146,42,0.5)] bg-[rgba(184,146,42,0.22)] text-[#B8922A]'
                  : 'border-[rgba(240,235,228,0.38)] text-[rgba(240,235,228,0.82)] hover:border-[rgba(184,146,42,0.42)] hover:text-[#1A1A1A]'
              }`}
            >
              <Icon size={14} className={activo ? 'text-[#B8922A]' : 'text-[rgba(184,146,42,0.67)]'} />
              <span className="whitespace-nowrap text-[11px] font-light uppercase tracking-[1.5px]">
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Panel de contenido — ancho completo */}
      <div className="overflow-hidden rounded-[2px] border border-[rgba(184,146,42,0.26)] bg-[#111111]">
        <div className="border-b border-[rgba(184,146,42,0.22)] px-6 py-5">
          <h2 className="text-[14px] font-light uppercase tracking-[1.5px] text-[#1A1A1A]">
            {tabActivo.label}
          </h2>
          <p className="mt-1 text-[12px] font-light text-[rgba(240,235,228,0.68)]">{tabActivo.desc}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-5 p-6"
          >
                {tab === 'negocio' && (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                      label="Nombre del negocio"
                      value={config['nombre_negocio'] || ''}
                      onChange={e => updateConfig('nombre_negocio', e.target.value)}
                      placeholder="Tienda VM Fashion"
                    />
                    <Input
                      label="Número de WhatsApp"
                      value={config['whatsapp_numero'] || ''}
                      onChange={e => updateConfig('whatsapp_numero', e.target.value)}
                      placeholder="573185867702"
                      hint="Con código de país, sin espacios. Ej: 573185867702"
                    />
                  </div>
                )}

                {tab === 'contenido' && (
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
                    <div className="lg:col-span-2">
                      <Textarea
                        label="Sección Nosotros"
                        value={config['texto_nosotros'] || ''}
                        onChange={e => updateConfig('texto_nosotros', e.target.value)}
                        placeholder="Somos Tienda VM Fashion, tu aliado de belleza en Armenia, Quindío."
                        rows={5}
                      />
                    </div>
                  </div>
                )}

                {tab === 'envios' && (
                  <div className="space-y-8">
                    <p className="text-[12px] font-light leading-relaxed text-[rgba(240,235,228,0.72)]">
                      El checkout calcula el envío automáticamente: si la ciudad es Armenia aplica la tarifa
                      local; cualquier otra ciudad usa la tarifa nacional.
                    </p>

                    {/* Costos */}
                    <div>
                      <h3 className="mb-4 text-[10px] font-light uppercase tracking-[2px] text-[rgba(184,146,42,0.87)]">
                        Costos de envío
                      </h3>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Input
                          label="Armenia (COP)"
                          type="number"
                          value={config['envio_armenia'] || ''}
                          onChange={e => updateConfig('envio_armenia', e.target.value)}
                          placeholder="5000"
                          hint="Tarifa para entregas en Armenia"
                        />
                        <Input
                          label="Resto del país (COP)"
                          type="number"
                          value={config['envio_nacional'] || ''}
                          onChange={e => updateConfig('envio_nacional', e.target.value)}
                          placeholder="0"
                          hint="0 = A convenir con el cliente"
                        />
                      </div>
                    </div>

                    {/* Tiempos */}
                    <div>
                      <h3 className="mb-4 text-[10px] font-light uppercase tracking-[2px] text-[rgba(184,146,42,0.87)]">
                        Tiempos de entrega
                      </h3>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Input
                          label="Armenia"
                          value={config['tiempo_entrega_armenia'] || ''}
                          onChange={e => updateConfig('tiempo_entrega_armenia', e.target.value)}
                          placeholder="El mismo día"
                        />
                        <Input
                          label="Resto del país"
                          value={config['tiempo_entrega_nacional'] || ''}
                          onChange={e => updateConfig('tiempo_entrega_nacional', e.target.value)}
                          placeholder="2 a 3 días hábiles"
                        />
                      </div>
                    </div>

                    {/* Envío gratis */}
                    <div className="rounded-[2px] border border-[rgba(184,146,42,0.26)] bg-[rgba(184,146,42,0.25)] p-5">
                      <h3 className="mb-4 text-[10px] font-light uppercase tracking-[2px] text-[rgba(184,146,42,0.87)]">
                        Envío gratis
                      </h3>
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
                  </div>
                )}

                {tab === 'pagos' && (
                  <div className="space-y-5">
                    {metodosPago.length > 0 ? (
                      <ul className="divide-y divide-[rgba(184,146,42,0.18)] rounded-[2px] border border-[rgba(184,146,42,0.26)]">
                        {metodosPago.map(metodo => (
                          <li
                            key={metodo}
                            className="flex items-center justify-between gap-3 px-4 py-3"
                          >
                            <span className="text-[13px] font-light text-[#1A1A1A]">{metodo}</span>
                            <button
                              type="button"
                              onClick={() => quitarMetodo(metodo)}
                              className="rounded-[2px] p-1.5 text-[rgba(240,235,228,0.65)] transition-colors hover:bg-[rgba(248,113,113,0.1)] hover:text-red-400"
                              aria-label={`Eliminar ${metodo}`}
                            >
                              <X size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="py-6 text-center text-[13px] font-light text-[rgba(240,235,228,0.65)]">
                        Agrega al menos un método de pago
                      </p>
                    )}

                    <div className="flex gap-2">
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
                        placeholder="Nuevo método: Nequi, Bancolombia..."
                        className="min-w-0 flex-1 rounded-[2px] border border-[rgba(26,26,26,0.22)] bg-[var(--bg-card)] px-4 py-3 text-[13px] font-light text-[#1A1A1A] placeholder:text-[rgba(240,235,228,0.58)] focus:border-[rgba(184,146,42,0.65)] focus:outline-none"
                      />
                      <Button type="button" onClick={agregarMetodo} variant="outline" size="sm">
                        <Plus size={13} />
                        Agregar
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
    </div>
  )
}
