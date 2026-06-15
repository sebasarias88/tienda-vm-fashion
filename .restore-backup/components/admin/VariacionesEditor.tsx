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
  'w-full rounded-[2px] border border-[rgba(248,246,241,0.15)] bg-[#161616] px-3 py-2 text-[13px] font-light text-[#F8F6F1] placeholder:text-[rgba(248,246,241,0.45)] focus:border-[rgba(212,175,55,0.65)] focus:outline-none transition-colors'

function colorSwatchStyle(value: string | null | undefined): React.CSSProperties | undefined {
  const v = value?.trim()
  if (!v) return undefined
  return { backgroundColor: v }
}

export default function VariacionesEditor({ productoId, onChange }: VariacionesEditorProps) {
  const [tipos, setTipos] = useState<VariacionTipo[]>([])
  const [loading, setLoading] = useState(false)
  const [newTipoNombre, setNewTipoNombre] = useState('')
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
    newOpcionByTipo[tipoId] ?? { nombre: '', valor_color: '' }

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

    const { error } = await supabase.from('variacion_tipos').update({ nombre }).eq('id', tipoId)

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
    const colorTrimmed = valor_color.trim()

    const { error } = await supabase.from('variacion_opciones').insert([
      {
        tipo_id: tipoId,
        nombre: trimmed,
        valor_color: colorTrimmed || null,
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
      <div className="rounded-[2px] border border-dashed border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.06)] px-4 py-5 text-center">
        <p className="text-[13px] font-light text-[rgba(248,246,241,0.65)]">
          Guarda el producto primero para agregar variaciones
        </p>
        <p className="mt-1 text-[11px] font-light text-[rgba(248,246,241,0.45)]">
          Ej: Color → Rubio, Castaño · Tono → Claro, Oscuro
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-10 text-[rgba(248,246,241,0.55)]">
          <Loader2 size={20} className="animate-spin text-[#D4AF37]" />
        </div>
      ) : tipos.length === 0 ? (
        <p className="rounded-[2px] border border-[rgba(212,175,55,0.12)] bg-[#161616] py-4 text-center text-[12px] font-light text-[rgba(248,246,241,0.5)]">
          Aún no hay tipos de variación. Agrega el primero abajo.
        </p>
      ) : (
        <div className="space-y-3">
          {tipos.map(tipo => (
            <div
              key={tipo.id}
              className="rounded-[2px] border border-[rgba(212,175,55,0.18)] bg-[#161616] p-4"
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
                      className="rounded-[2px] p-2 text-[#D4AF37] hover:bg-[rgba(212,175,55,0.12)]"
                      aria-label="Guardar nombre"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <h4 className="text-[13px] font-light uppercase tracking-[1px] text-[#F8F6F1]">
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
                    className="rounded-[2px] p-2 text-[rgba(248,246,241,0.55)] hover:bg-[rgba(212,175,55,0.1)] hover:text-[#D4AF37]"
                    aria-label="Editar tipo"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminarTipo(tipo)}
                    className="rounded-[2px] p-2 text-[rgba(248,246,241,0.55)] hover:bg-[rgba(248,113,113,0.1)] hover:text-red-400"
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
                          ? 'border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)]'
                          : 'border-[rgba(248,246,241,0.12)] bg-[rgba(248,246,241,0.04)] opacity-60'
                      }`}
                    >
                      {opcion.valor_color && (
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-[rgba(248,246,241,0.2)]"
                          style={colorSwatchStyle(opcion.valor_color)}
                          title={opcion.valor_color}
                        />
                      )}
                      <span className="text-[12px] font-light text-[#F8F6F1]">{opcion.nombre}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleDisponible(opcion.id, opcion.disponible)}
                        className={`rounded px-1.5 py-0.5 text-[9px] uppercase tracking-[0.5px] transition-colors ${
                          opcion.disponible
                            ? 'text-emerald-400 hover:bg-[rgba(74,222,128,0.12)]'
                            : 'text-[rgba(248,246,241,0.45)] hover:bg-[rgba(248,246,241,0.06)]'
                        }`}
                        title={opcion.disponible ? 'Marcar no disponible' : 'Marcar disponible'}
                      >
                        {opcion.disponible ? 'On' : 'Off'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminarOpcion(opcion.id)}
                        className="text-[rgba(248,246,241,0.45)] hover:text-red-400"
                        aria-label="Eliminar opción"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] font-light italic text-[rgba(248,246,241,0.45)]">
                    Sin opciones — agrega la primera abajo
                  </p>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-2 rounded-[2px] border border-dashed border-[rgba(212,175,55,0.25)] bg-[#111111] p-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1 space-y-1">
                  <label className="block text-[9px] font-light uppercase tracking-[1px] text-[rgba(248,246,241,0.45)]">
                    Nombre de la opción
                  </label>
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
                    placeholder="Ej: Rubio, 500ml, Claro"
                    className={inputClass}
                  />
                </div>
                <div className="w-full space-y-1 sm:w-36">
                  <label className="block text-[9px] font-light uppercase tracking-[1px] text-[rgba(248,246,241,0.45)]">
                    Color hex (opcional)
                  </label>
                  <div className="flex items-center gap-2">
                    {getNewOpcion(tipo.id).valor_color.trim() && (
                      <span
                        className="h-8 w-8 shrink-0 rounded-full border border-[rgba(248,246,241,0.2)]"
                        style={colorSwatchStyle(getNewOpcion(tipo.id).valor_color)}
                      />
                    )}
                    <input
                      type="text"
                      value={getNewOpcion(tipo.id).valor_color}
                      onChange={e => setNewOpcion(tipo.id, { valor_color: e.target.value })}
                      placeholder="#D4AF37"
                      className={`${inputClass} py-2`}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAgregarOpcion(tipo.id)}
                  className="shrink-0 !text-[#0D0D0D]"
                >
                  <Plus size={13} />
                  Agregar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-[2px] border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.05)] p-4">
        <p className="mb-3 text-[10px] font-light uppercase tracking-[1.5px] text-[rgba(212,175,55,0.85)]">
          Nuevo tipo de variación
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label className="block text-[9px] font-light uppercase tracking-[1px] text-[rgba(248,246,241,0.45)]">
              Nombre del tipo
            </label>
            <input
              id="nuevo-tipo-variacion"
              type="text"
              value={newTipoNombre}
              onChange={e => setNewTipoNombre(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAgregarTipo()
              }}
              placeholder="Ej: Color, Tono, Tamaño"
              className={inputClass}
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAgregarTipo}
            loading={addingTipo}
            className="!text-[#0D0D0D]"
          >
            <Plus size={13} />
            Agregar tipo
          </Button>
        </div>
        <p className="mt-2 text-[10px] font-light text-[rgba(248,246,241,0.4)]">
          Solo escribe el nombre del tipo y las opciones en texto. El color hex es opcional y sirve
          para mostrar un círculo de muestra en la tienda.
        </p>
      </div>
    </div>
  )
}
