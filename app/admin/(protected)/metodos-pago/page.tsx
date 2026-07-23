'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MetodoPagoConfig } from '@/types'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { AdminSelect } from '@/components/ui/AdminSelect'
import {
  AdminTable,
  AdminTableHead,
  AdminTableHeaderRow,
  AdminTableTh,
  AdminTableBody,
  AdminTableTd,
  AdminTableActions,
  AdminTableStatus,
} from '@/components/admin/AdminTable'
import AdminLoadError from '@/components/admin/AdminLoadError'
import MobileMetodosPagoView from '@/components/admin/mobile/MobileMetodosPagoView'
import toast from 'react-hot-toast'
import {
  Plus,
  Info,
  CreditCard,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

type CatalogoTipo = MetodoPagoConfig['catalogo']
type EstadoFiltro = 'todas' | 'activos' | 'inactivos'
type CatalogoFiltro = 'todos' | CatalogoTipo

type FormState = {
  nombre: string
  catalogo: CatalogoTipo
  porcentaje_adicional: number
  monto_adicional_fijo: number
  descripcion_cliente: string
  activo: boolean
  orden: number
}

const CATALOGO_ORDER: CatalogoTipo[] = ['detal', 'mayoreo', 'ambos']

const CATALOGO_LABELS: Record<CatalogoTipo, string> = {
  detal: 'Detal',
  mayoreo: 'Mayoreo',
  ambos: 'Detal y Mayoreo',
}

const CATALOGO_OPTIONS = [
  { value: 'detal', label: 'Solo catálogo Detal' },
  { value: 'mayoreo', label: 'Solo catálogo Mayoreo' },
  { value: 'ambos', label: 'Ambos catálogos' },
]

const emptyForm = (orden = 0): FormState => ({
  nombre: '',
  catalogo: 'ambos',
  porcentaje_adicional: 0,
  monto_adicional_fijo: 0,
  descripcion_cliente: '',
  activo: true,
  orden,
})

export default function MetodosPagoPage() {
  const [configs, setConfigs] = useState<MetodoPagoConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selected, setSelected] = useState<MetodoPagoConfig | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('todas')
  const [filtroCatalogo, setFiltroCatalogo] = useState<CatalogoFiltro>('todos')

  const fetchConfigs = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('metodo_pago_config')
      .select('*')
      .order('catalogo', { ascending: true })
      .order('orden', { ascending: true })

    if (error) {
      toast.error('Error al cargar métodos de pago')
      setLoadError(true)
    } else {
      setConfigs((data as MetodoPagoConfig[]) || [])
    90|      setLoadError(false)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  const filteredConfigs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return configs.filter(config => {
      if (filtroEstado === 'activos' && !config.activo) return false
      if (filtroEstado === 'inactivos' && config.activo) return false
      if (filtroCatalogo !== 'todos' && config.catalogo !== filtroCatalogo) return false
      if (!q) return true
      const haystack = [
        config.nombre,
        config.descripcion_cliente || '',
        CATALOGO_LABELS[config.catalogo],
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [configs, search, filtroEstado, filtroCatalogo])

  const buildGroups = useCallback((list: MetodoPagoConfig[]) => {
    const map = new Map<CatalogoTipo, MetodoPagoConfig[]>()
    for (const cat of CATALOGO_ORDER) map.set(cat, [])
    for (const config of list) {
      const items = map.get(config.catalogo) ?? []
      items.push(config)
      map.set(config.catalogo, items)
    }
    return CATALOGO_ORDER.map(catalogo => ({
      catalogo,
      items: (map.get(catalogo) || []).sort((a, b) => a.orden - b.orden),
    })).filter(g => g.items.length > 0)
  }, [])

  const groupsDesktop = useMemo(() => buildGroups(configs), [buildGroups, configs])
  const groupsMobile = useMemo(
    () => buildGroups(filteredConfigs),
    [buildGroups, filteredConfigs],
  )

  const abrirCrear = () => {
    setSelected(null)
    const nextOrden =
      configs.length > 0 ? Math.max(...configs.map(c => c.orden)) + 1 : 0
    setForm(emptyForm(nextOrden))
    setModalOpen(true)
  }

  const abrirEditar = (config: MetodoPagoConfig) => {
    setSelected(config)
    setForm({
      nombre: config.nombre,
      catalogo: config.catalogo,
      porcentaje_adicional: config.porcentaje_adicional || 0,
      monto_adicional_fijo: config.monto_adicional_fijo || 0,
      descripcion_cliente: config.descripcion_cliente || '',
      activo: config.activo,
      orden: config.orden,
    })
    setModalOpen(true)
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim()) {
      toast.error('El nombre del método es obligatorio')
      return
    }

    setSaving(true)
    const payload = {
      nombre: form.nombre.trim(),
      catalogo: form.catalogo,
      porcentaje_adicional: Number(form.porcentaje_adicional) || 0,
      monto_adicional_fijo: Number(form.monto_adicional_fijo) || 0,
      descripcion_cliente: form.descripcion_cliente.trim() || null,
      activo: form.activo,
      orden: Number(form.orden) || 0,
    }

    const { error } = selected
      ? await supabase
          .from('metodo_pago_config')
          .update(payload)
          .eq('id', selected.id)
      : await supabase.from('metodo_pago_config').insert(payload)

    if (error) {
      toast.error('Error al guardar el método de pago')
    } else {
      toast.success(selected ? 'Método actualizado' : 'Método creado')
      setModalOpen(false)
      fetchConfigs()
    }
    setSaving(false)
  }

  const handleEliminar = async () => {
    if (!selected) return
    setDeleting(true)
    const { error } = await supabase
      .from('metodo_pago_config')
      .delete()
      .eq('id', selected.id)

    if (error) {
      toast.error('Error al eliminar')
    } else {
      toast.success('Método eliminado')
      setDeleteModal(false)
      setSelected(null)
      fetchConfigs()
    }
    setDeleting(false)
  }

  const toggleActivo = async (config: MetodoPagoConfig) => {
    const { error } = await supabase
      .from('metodo_pago_config')
      .update({ activo: !config.activo })
      .eq('id', config.id)

    if (error) {
      toast.error('Error al actualizar estado')
      return
    }

    toast.success(config.activo ? 'Método desactivado' : 'Método activado')
    setConfigs(prev =>
      prev.map(c => (c.id === config.id ? { ...c, activo: !c.activo } : c)),
    )
  }

  return (
    <>
      {/* ── Desktop ── */}
      <div className="hidden min-h-screen bg-[var(--bg-base)] p-6 sm:p-8 lg:p-10 md:block">
        <div className="mb-8 flex flex-col gap-5 border-b border-[rgba(201,168,76,0.16)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px w-8 bg-[var(--gold-bright)]" />
              <p className="text-[10px] font-light uppercase tracking-[3px] text-[rgba(201,168,76,0.9)]">
                Checkout
              </p>
            </div>
            <h1 className="text-3xl font-thin uppercase tracking-[2px] text-[var(--text-primary)] sm:text-4xl">
              Métodos de Pago
            </h1>
            <p className="mt-2 text-[13px] font-light text-[var(--text-muted)]">
              Cargos adicionales por método y catálogo
            </p>
          </div>
          <Button onClick={abrirCrear} size="sm" className="self-start sm:self-auto">
            <Plus size={13} />
            Nuevo método
          </Button>
        </div>

        <div className="mb-6 flex gap-3 rounded-[2px] border border-[rgba(201,168,76,0.12)] bg-[rgba(201,168,76,0.04)] p-4">
          <Info size={14} className="mt-0.5 shrink-0 text-[var(--gold)]" />
          <div className="space-y-1">
            <p className="text-[12px] font-light text-[var(--text-primary)]">
              Configura los métodos de pago y sus cargos adicionales por catálogo.
            </p>
            <p className="text-[11px] font-light text-[var(--text-subtle)]">
              El cargo se aplica automáticamente cuando el cliente selecciona ese método en el
              checkout. Puede ser un porcentaje o un monto fijo.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-[2px] border border-[var(--border-card)] bg-[var(--bg-card)]"
              />
            ))}
          </div>
        ) : loadError ? (
          <AdminLoadError
            onRetry={fetchConfigs}
            title="No se pudieron cargar los métodos de pago"
          />
        ) : configs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-card)] bg-[var(--bg-card)] px-6 py-20 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.08)] text-[var(--gold)]">
              <CreditCard size={22} />
            </span>
            <p className="text-[14px] font-light text-[var(--text-primary)]">
              Aún no hay métodos de pago configurados
            </p>
            <Button onClick={abrirCrear} size="sm" className="mt-6">
              <Plus size={13} />
              Crear método
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {groupsDesktop.map(({ catalogo, items }) => (
              <div key={catalogo}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-[9px] font-light uppercase tracking-[3px] text-[rgba(201,168,76,0.6)]">
                    Catálogo {CATALOGO_LABELS[catalogo]}
                  </span>
                  <div className="h-px flex-1 bg-[rgba(201,168,76,0.08)]" />
                </div>

                <AdminTable minWidth="720px">
                  <AdminTableHead>
                    <AdminTableHeaderRow>
                      <AdminTableTh>Método de pago</AdminTableTh>
                      <AdminTableTh>Cargo adicional</AdminTableTh>
                      <AdminTableTh>Descripción para el cliente</AdminTableTh>
                      <AdminTableTh>Estado</AdminTableTh>
                      <AdminTableTh className="w-28">Acciones</AdminTableTh>
                    </AdminTableHeaderRow>
                  </AdminTableHead>
                  <AdminTableBody>
                    {items.map(config => (
                      <tr
                        key={config.id}
                        className="border-b border-[var(--border-subtle)]"
                      >
                        <AdminTableTd>
                          <span className="text-[13px] font-light text-[var(--text-primary)]">
                            {config.nombre}
                          </span>
                        </AdminTableTd>
                        <AdminTableTd>
                          <div className="flex flex-col gap-0.5">
                            {config.porcentaje_adicional > 0 && (
                              <span className="text-[12px] font-light text-[var(--gold)]">
                                +{config.porcentaje_adicional}%
                              </span>
                            )}
                            {config.monto_adicional_fijo > 0 && (
                              <span className="text-[11px] font-light text-[rgba(201,168,76,0.7)]">
                                +$
                                {Number(config.monto_adicional_fijo).toLocaleString('es-CO')}
                              </span>
                            )}
                            {config.porcentaje_adicional === 0 &&
                              config.monto_adicional_fijo === 0 && (
                                <span className="text-[11px] text-[var(--text-faint)]">
                                  Sin cargo
                                </span>
                              )}
                          </div>
                        </AdminTableTd>
                        <AdminTableTd>
                          <span className="block max-w-[200px] truncate text-[11px] text-[var(--text-subtle)]">
                            {config.descripcion_cliente || '—'}
                          </span>
                        </AdminTableTd>
                        <AdminTableTd>
                          <AdminTableStatus
                            label={config.activo ? 'Activo' : 'Inactivo'}
                            icon={config.activo ? CheckCircle2 : XCircle}
                            variant={config.activo ? 'success' : 'danger'}
                            onClick={() => toggleActivo(config)}
                            title={
                              config.activo
                                ? 'Clic para desactivar'
                                : 'Clic para activar'
                            }
                          />
                        </AdminTableTd>
                        <AdminTableTd>
                          <AdminTableActions
                            onEdit={() => abrirEditar(config)}
                            onDelete={() => {
                              setSelected(config)
                              setDeleteModal(true)
                            }}
                          />
                        </AdminTableTd>
                      </tr>
                    ))}
                  </AdminTableBody>
                </AdminTable>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Mobile ── */}
      <MobileMetodosPagoView
        loading={loading}
        loadError={loadError}
        groups={groupsMobile}
        totalCount={configs.length}
        search={search}
        onSearchChange={setSearch}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        filtroCatalogo={filtroCatalogo}
        onFiltroCatalogoChange={setFiltroCatalogo}
        onRetry={fetchConfigs}
        onCreate={abrirCrear}
        onEdit={abrirEditar}
        onDelete={config => {
          setSelected(config)
          setDeleteModal(true)
        }}
        onToggleActivo={toggleActivo}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selected ? 'Editar método de pago' : 'Nuevo método de pago'}
        size="lg"
      >
        <form onSubmit={handleGuardar} className="space-y-5 max-md:flex max-md:min-h-0 max-md:flex-1 max-md:flex-col">
          <div className="space-y-5 max-md:min-h-0 max-md:flex-1 max-md:overflow-y-auto max-md:px-5 max-md:py-4">
            <Input
              label="Nombre del método"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Addi, Sistecrédito, Nequi, Efectivo contra entrega"
              hint="Ej: Addi, Sistecrédito, Nequi, Efectivo contra entrega"
              required
            />

            <div className="space-y-1.5">
              <label className="admin-form-label">Aplicar en catálogo</label>
              <AdminSelect
                value={form.catalogo}
                onChange={value =>
                  setForm(f => ({ ...f, catalogo: value as CatalogoTipo }))
                }
                options={CATALOGO_OPTIONS}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Cargo porcentaje (%)"
                type="number"
                min={0}
                max={99}
                step="0.01"
                value={form.porcentaje_adicional}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    porcentaje_adicional: Number(e.target.value) || 0,
                  }))
                }
                hint="Ej: 5 = 5% adicional sobre el total"
              />
              <Input
                label="Cargo fijo (COP)"
                type="number"
                min={0}
                step="1"
                value={form.monto_adicional_fijo}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    monto_adicional_fijo: Number(e.target.value) || 0,
                  }))
                }
                hint="Monto fijo adicional en COP"
              />
            </div>

            <Textarea
              label="Descripción para el cliente"
              value={form.descripcion_cliente}
              onChange={e =>
                setForm(f => ({ ...f, descripcion_cliente: e.target.value }))
              }
              rows={2}
              placeholder="Ej: La financiación con Addi incluye un cargo del 5%"
              hint="Este texto se muestra al cliente cuando selecciona este método"
            />

            <Input
              label="Orden"
              type="number"
              value={form.orden}
              onChange={e =>
                setForm(f => ({ ...f, orden: Number(e.target.value) || 0 }))
              }
            />

            <div className="admin-form-panel flex items-center justify-between px-4 py-3.5">
              <div className="pr-4">
                <p className="admin-form-panel__title">Método activo</p>
                <p className="admin-form-panel__desc">
                  Visible en el checkout del catálogo elegido
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, activo: !f.activo }))}
                className={`admin-toggle ${form.activo ? 'admin-toggle--on' : 'admin-toggle--off'}`}
                aria-pressed={form.activo}
              >
                <span className="admin-toggle__thumb" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 border-t border-[var(--border-subtle)] pt-4 max-md:shrink-0 max-md:px-5 max-md:pb-[max(1rem,env(safe-area-inset-bottom))] max-md:pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              fullWidth
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving} fullWidth>
              {selected ? 'Guardar cambios' : 'Crear método'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Eliminar método"
        size="sm"
      >
        <p className="mb-6 text-[13px] font-light text-[var(--text-muted)] max-md:px-5 max-md:pt-4">
          ¿Eliminar el método{' '}
          <span className="text-[var(--text-primary)]">{selected?.nombre}</span>? Esta acción
          no se puede deshacer.
        </p>
        <div className="flex gap-3 max-md:px-5 max-md:pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button variant="ghost" onClick={() => setDeleteModal(false)} fullWidth>
            Cancelar
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            onClick={handleEliminar}
            fullWidth
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  )
}
