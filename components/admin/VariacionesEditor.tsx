'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { VariacionTipo } from '@/types'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Loader2, Check } from 'lucide-react'

type VariacionesEditorProps = {
  productoId: string | null
  onChange?: () => void
}

type NuevaOpcionState = {
  nombre: string
  valor_color: string
}

const inputClass =
  'w-full bg-[var(--bg-card)] border border-[rgba(240,235,228,0.22)] rounded-[2px] px-3 py-2 text-[13px] font-light text-[#f0ebe4] placeholder:text-[rgba(240,235,228,0.48)] focus:outline-none focus:border-[rgba(201,168,76,0.65)] transition-colors'

const miniInputClass =
  'min-w-0 flex-1 bg-transparent border-0 border-b border-[rgba(240,235,228,0.22)] py-1.5 text-[12px] font-light text-[#f0ebe4] outline-none placeholder:text-[rgba(240,235,228,0.48)] focus:border-[rgba(201,168,76,0.65)]'

export default function VariacionesEditor({ productoId, onChange }: VariacionesEditorProps) {
  const [tipos, setTipos] = useState<VariacionTipo[]>([])
  const [loading, setLoading] = useState(false)
  const [newTipoNombre, setNewTipoNombre] = useState('')
  const [newTipoColor, setNewTipoColor] = useState('#C9A84C')
  const [addingTipo, setAddingTipo] = useState(false)
  const [editingTipoId, setEditingTipoId] = useState<string | null>(null)
  const [editTipoNombre, setEditTipoNombre] = useState('')
  const [newOpcionByTipo, setNewOpcionByTipo] = useState<Record<string, NuevaOpcionState>>({})

  const notifyChange = () => onChange?.()

  const fetchTipos = useCallback(async () => {
    if (!productoId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('variacion_tipos')
      .select('*, opciones:variacion_opciones(*)')
      .eq('producto_id', productoId)
      .order('orden', { ascending: true })

    if (error) {
      toast.error('Error al cargar variaciones')
      setTipos([])
    } else {
      const sorted = (data || []).map(tipo => ({
        ...tipo,
        opciones: [...(tipo.opciones || [])].sort((a, b) => a.orden - b.orden),
      }))
      setTipos(sorted)
    }
    setLoading(false)
  }, [productoId])

  useEffect(() => {
    if (productoId) fetchTipos()
    else setTipos([])
  }, [productoId, fetchTipos])

  const getNewOpcion = (tipoId: string): NuevaOpcionState =>
    newOpcionByTipo[tipoId] ?? { nombre: '', valor_color: '#C9A84C' }

  const setNewOpcion = (tipoId: string, patch: Partial<NuevaOpcionState>) => {
    setNewOpcionByTipo(prev => ({
      ...prev,
      [tipoId]: { ...getNewOpcion(tipoId), ...patch },
    }))
  }

  const handleAgregarTipo = async () => {
    if (!productoId) return
    const nombre = newTipoNombre.trim()
    if (!nombre) {
      toast.error('Escribe el nombre del tipo de variación')
      return
    }

    setAddingTipo(true)
    const orden = tipos.length
    const { error } = await supabase
      .from('variacion_tipos')
      .insert([{ producto_id: productoId, nombre, orden }])

    if (error) {
      toast.error('Error al crear tipo de variación')
      setAddingTipo(false)
      return
    }

    toast.success('Tipo de variación agregado')
    setNewTipoNombre('')
    setNewTipoColor('#C9A84C')
    await fetchTipos()
    notifyChange()
    setAddingTipo(false)
  }

  const handleEliminarTipo = async (tipo: VariacionTipo) => {
    if (!confirm(`¿Eliminar el tipo "${tipo.nombre}" y todas sus opciones?`)) return

    await supabase.from('variacion_opciones').delete().eq('tipo_id', tipo.id)
    const { error } = await supabase.from('variacion_tipos').delete().eq('id', tipo.id)

    if (error) {
      toast.error('Error al eliminar tipo')
      return
    }

    toast.success('Tipo eliminado')
    await fetchTipos()
    notifyChange()
  }

  const handleGuardarNombreTipo = async (tipoId: string) => {
    const nombre = editTipoNombre.trim()
    if (!nombre) {
      toast.error('El nombre no puede estar vacío')
      return
    }

    const { error } = await supabase
      .from('variacion_tipos')
      .update({ nombre })
      .eq('id', tipoId)

    if (error) {
      toast.error('Error al actualizar tipo')
      return
    }

    toast.success('Tipo actualizado')
    setEditingTipoId(null)
    await fetchTipos()
    notifyChange()
  }

  const handleAgregarOpcion = async (tipoId: string) => {
    const { nombre, valor_color } = getNewOpcion(tipoId)
    const trimmed = nombre.trim()
    if (!trimmed) {
      toast.error('Escribe el nombre de la opción')
      return
    }

    const tipo = tipos.find(t => t.id === tipoId)
    const orden = tipo?.opciones?.length ?? 0

    const { error } = await supabase.from('variacion_opciones').insert([
      {
        tipo_id: tipoId,
        nombre: trimmed,
        valor_color: valor_color || null,
        disponible: true,
        orden,
      },
    ])

    if (error) {
      toast.error('Error al agregar opción')
      return
    }

    toast.success('Opción agregada')
    setNewOpcionByTipo(prev => {
      const next = { ...prev }
      delete next[tipoId]
      return next
    })
    await fetchTipos()
    notifyChange()
  }

  const handleEliminarOpcion = async (opcionId: string) => {
    const { error } = await supabase.from('variacion_opciones').delete().eq('id', opcionId)

    if (error) {
      toast.error('Error al eliminar opción')
      return
    }

    toast.success('Opción eliminada')
    await fetchTipos()
    notifyChange()
  }

  const handleToggleDisponible = async (opcionId: string, disponible: boolean) => {
    const { error } = await supabase
      .from('variacion_opciones')
      .update({ disponible: !disponible })
      .eq('id', opcionId)

    if (error) {
      toast.error('Error al actualizar disponibilidad')
      return
    }

    await fetchTipos()
    notifyChange()
  }

  if (!productoId) {
    return (
      <div className="rounded-[2px] border border-dashed border-[rgba(184,146,42,0.35)] bg-[rgba(184,146,42,0.08)] px-4 py-6 text-center">
        <p className="text-[13px] font-light text-[rgba(240,235,228,0.72)]">
          Guarda el producto primero para agregar variaciones
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(184,146,42,0.22)] pb-3">
        <div>
          <p className="text-[11px] font-light uppercase tracking-[2px] text-[rgba(240,235,228,0.65)]">
            Variaciones
          </p>
          <h3 className="mt-1 text-[15px] font-light tracking-[0.3px] text-[#f0ebe4]">
            Variaciones del producto
          </h3>
        </div>
        <button
          type="button"
          onClick={() => document.getElementById('nuevo-tipo-variacion')?.focus()}
          className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[rgba(201,168,76,0.45)] text-[#C9A84C] transition-colors hover:bg-[rgba(201,168,76,0.14)]"
          aria-label="Agregar tipo de variación"
        >
          <Plus size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-[rgba(240,235,228,0.55)]">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : tipos.length === 0 ? (
        <p className="py-4 text-center text-[12px] font-light text-[rgba(240,235,228,0.55)]">
          Aún no hay tipos de variación. Agrega el primero abajo.
        </p>
      ) : (
        <div className="space-y-3">
          {tipos.map(tipo => (
            <div
              key={tipo.id}
              className="rounded-[2px] border border-[rgba(184,146,42,0.22)] bg-[var(--bg-card)] p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                {editingTipoId === tipo.id ? (
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <input
                      value={editTipoNombre}
                      onChange={e => setEditTipoNombre(e.target.value)}
                      className={`${inputClass} flex-1 py-2`}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleGuardarNombreTipo(tipo.id)
                        if (e.key === 'Escape') setEditingTipoId(null)
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleGuardarNombreTipo(tipo.id)}
                      className="rounded-[2px] p-2 text-[#C9A84C] hover:bg-[rgba(201,168,76,0.14)]"
                      aria-label="Guardar nombre"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <h4 className="text-[14px] font-light uppercase tracking-[1px] text-[#f0ebe4]">
                    {tipo.nombre}
                  </h4>
                )}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTipoId(tipo.id)
                      setEditTipoNombre(tipo.nombre)
                    }}
                    className="rounded-[2px] p-2 text-[rgba(240,235,228,0.65)] hover:bg-[rgba(201,168,76,0.14)] hover:text-[#C9A84C]"
                    aria-label="Editar tipo"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminarTipo(tipo)}
                    className="rounded-[2px] p-2 text-[rgba(240,235,228,0.65)] hover:bg-[rgba(248,113,113,0.1)] hover:text-red-400"
                    aria-label="Eliminar tipo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {tipo.opciones && tipo.opciones.length > 0 ? (
                  tipo.opciones.map(opcion => (
                    <div
                      key={opcion.id}
                      className={`inline-flex items-center gap-2 rounded-[2px] border px-2.5 py-1.5 ${
                        opcion.disponible
                          ? 'border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.1)]'
                          : 'border-[rgba(240,235,228,0.2)] bg-[rgba(240,235,228,0.06)] opacity-60'
                      }`}
                    >
                      {opcion.valor_color && (
                        <span
                          className="h-4 w-4 shrink-0 rounded-full border border-[rgba(240,235,228,0.25)]"
                          style={{ backgroundColor: opcion.valor_color }}
                          title={opcion.valor_color}
                        />
                      )}
                      <span className="text-[12px] font-light text-[#f0ebe4]">{opcion.nombre}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleDisponible(opcion.id, opcion.disponible)}
                        className={`rounded px-1.5 py-0.5 text-[9px] uppercase tracking-[0.5px] transition-colors ${
                          opcion.disponible
                            ? 'text-emerald-400 hover:bg-[rgba(74,222,128,0.12)]'
                            : 'text-[rgba(240,235,228,0.5)] hover:bg-[rgba(240,235,228,0.08)]'
                        }`}
                        title={opcion.disponible ? 'Marcar no disponible' : 'Marcar disponible'}
                      >
                        {opcion.disponible ? 'On' : 'Off'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminarOpcion(opcion.id)}
                        className="text-[rgba(240,235,228,0.55)] hover:text-red-400"
                        aria-label="Eliminar opción"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] font-light italic text-[rgba(240,235,228,0.5)]">
                    Sin opciones — agrega la primera
                  </p>
                )}

                <div className="inline-flex min-w-[12rem] max-w-full flex-1 items-center gap-2 rounded-[2px] border border-dashed border-[rgba(201,168,76,0.35)] px-2 py-1.5 sm:min-w-[16rem]">
                  {getNewOpcion(tipo.id).nombre && (
                    <span
                      className="h-4 w-4 shrink-0 rounded-full border border-[rgba(240,235,228,0.25)]"
                      style={{ backgroundColor: getNewOpcion(tipo.id).valor_color }}
                    />
                  )}
                  <input
                    type="color"
                    value={getNewOpcion(tipo.id).valor_color}
                    onChange={e => setNewOpcion(tipo.id, { valor_color: e.target.value })}
                    className="h-6 w-6 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                    title="Color (opcional)"
                  />
                  <input
                    type="text"
                    value={getNewOpcion(tipo.id).nombre}
                    onChange={e => setNewOpcion(tipo.id, { nombre: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAgregarOpcion(tipo.id)
                      }
                    }}
                    placeholder="+ Agregar opción"
                    className={miniInputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-[2px] border border-[rgba(184,146,42,0.18)] bg-[rgba(184,146,42,0.06)] p-4">
        <p className="mb-3 text-[11px] font-light uppercase tracking-[1.5px] text-[rgba(240,235,228,0.65)]">
          Agregar tipo de variación
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label className="block text-[10px] font-light uppercase tracking-[1px] text-[rgba(240,235,228,0.55)]">
              Nombre (ej. Color, Tono)
            </label>
            <input
              id="nuevo-tipo-variacion"
              type="text"
              value={newTipoNombre}
              onChange={e => setNewTipoNombre(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAgregarTipo()
              }}
              placeholder="Color"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-light uppercase tracking-[1px] text-[rgba(240,235,228,0.55)]">
              Color (opcional)
            </label>
            <input
              type="color"
              value={newTipoColor}
              onChange={e => setNewTipoColor(e.target.value)}
              className="h-10 w-full cursor-pointer rounded-[2px] border border-[rgba(240,235,228,0.22)] bg-[var(--bg-card)] sm:w-14"
            />
          </div>
          <Button type="button" size="sm" onClick={handleAgregarTipo} loading={addingTipo}>
            <Plus size={13} />
            Agregar
          </Button>
        </div>
      </div>
    </div>
  )
}
