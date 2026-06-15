'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { Save, Clock } from 'lucide-react'
import { AdminTableShell } from '@/components/admin/AdminTable'
import ConfigTabPanels from '@/components/admin/config/ConfigTabPanels'
import { CONFIG_TABS, Config, TabId } from '@/components/admin/config/config-ui'
import MobileConfigView from '@/components/admin/mobile/MobileConfigView'

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
        supabase.from('configuracion').update({ valor }).eq('clave', clave),
      ),
    )

    const hasError = results.some(r => r.error)
    if (hasError) toast.error('Error al guardar algunos campos')
    else toast.success('Configuración guardada correctamente')

    setSaving(false)
  }

  const panelProps = {
    config,
    updateConfig,
    metodosPago,
    nuevoMetodo,
    setNuevoMetodo,
    agregarMetodo,
    quitarMetodo,
  }

  if (loading) {
    return (
      <>
        <div className="hidden min-h-screen bg-[var(--bg-base)] p-6 sm:p-8 lg:p-10 md:block">
          <div className="mb-10 flex justify-between border-b border-[rgba(201,168,76,0.16)] pb-8">
            <div>
              <div className="mb-3 h-3 w-20 animate-pulse rounded-[2px] bg-[var(--gold-muted)]" />
              <div className="h-9 w-64 animate-pulse rounded-[2px] bg-[var(--gold-muted)]" />
            </div>
            <div className="h-9 w-32 animate-pulse rounded-[2px] bg-[var(--gold-muted)]" />
          </div>
          <div className="h-80 animate-pulse rounded-[2px] border border-[rgba(201,168,76,0.1)] bg-[var(--bg-card)]" />
        </div>
        <div className="mobile-config-page px-4 py-5 md:hidden">
          <div className="mb-4 h-4 w-48 animate-pulse rounded bg-[var(--gold-muted)]" />
          <div className="mb-4 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-[var(--bg-card)]" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-[2px] bg-[var(--bg-card)]" />
        </div>
      </>
    )
  }

  return (
    <>
      <MobileConfigView
        tab={tab}
        onTabChange={setTab}
        saving={saving}
        onSave={handleGuardar}
        {...panelProps}
      />

      <div className="hidden min-h-screen bg-[var(--bg-base)] p-6 sm:p-8 lg:p-10 md:block">
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
          <Button onClick={handleGuardar} loading={saving} size="sm" className="self-start sm:self-auto">
            <Save size={13} />
            Guardar cambios
          </Button>
        </div>

        <AdminTableShell className="overflow-hidden">
          <div className="flex flex-col">
            <nav className="grid grid-cols-2 gap-2 border-b border-[rgba(201,168,76,0.14)] p-3 sm:grid-cols-4">
              {CONFIG_TABS.map(({ id, label, icon: Icon, desc }) => {
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
                    {activo ? (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--gold-bright)] sm:inset-x-3.5" />
                    ) : null}
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
                          activo
                            ? 'text-[var(--gold-bright)]'
                            : 'text-[var(--text-primary)] group-hover:text-[var(--gold-bright)]'
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
                  className="mobile-admin-form flex-1 space-y-8 p-6"
                >
                  <ConfigTabPanels tab={tab} variant="desktop" {...panelProps} />
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between gap-4 border-t border-[rgba(201,168,76,0.16)] bg-[var(--bg-muted)] px-6 py-4">
                <div className="flex items-center gap-2 text-[11px] font-light text-[var(--text-subtle)]">
                  <Clock size={13} className="shrink-0 text-[rgba(201,168,76,0.55)]" />
                  Los cambios se aplican al guardar
                </div>
                <Button onClick={handleGuardar} loading={saving} size="sm">
                  <Save size={13} />
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </AdminTableShell>
      </div>
    </>
  )
}
