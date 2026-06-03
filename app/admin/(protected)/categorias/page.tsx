'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Categoria } from '@/types'
import { TableRowSkeleton } from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ImageIcon,
  Search,
  X,
  Tag,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selected, setSelected] = useState<Categoria | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'activas' | 'inactivas'>('todas')

  const [form, setForm] = useState({
    nombre: '',
    slug: '',
    imagen_url: '',
    orden: 0,
    activa: true,
    padre_id: '',
  })

  type CategoriaFila = Categoria & { esSubcategoria: boolean }

  const flattenCategorias = (roots: Categoria[]): CategoriaFila[] => {
    const rows: CategoriaFila[] = []
    for (const root of roots) {
      rows.push({ ...root, esSubcategoria: false })
      const subs = [...(root.subcategorias || [])].sort((a, b) => a.orden - b.orden)
      for (const sub of subs) {
        rows.push({ ...sub, esSubcategoria: true })
      }
    }
    return rows
  }

  const fetchCategorias = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categorias')
      .select('*, subcategorias:categorias!padre_id(*)')
      .is('padre_id', null)
      .order('orden', { ascending: true })

    if (error) toast.error('Error al cargar categorías')
    else setCategorias(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  const categoriasAplanadas = useMemo(() => flattenCategorias(categorias), [categorias])

  const categoriasFiltradas = useMemo(() => {
    return categoriasAplanadas.filter(cat => {
      const matchSearch =
        cat.nombre.toLowerCase().includes(search.toLowerCase()) ||
        cat.slug.toLowerCase().includes(search.toLowerCase())
      const matchEstado =
        filtroEstado === 'todas' ||
        (filtroEstado === 'activas' && cat.activa) ||
        (filtroEstado === 'inactivas' && !cat.activa)
      return matchSearch && matchEstado
    })
  }, [categoriasAplanadas, search, filtroEstado])

  const generarSlug = (nombre: string) =>
    nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

  const abrirCrear = () => {
    setSelected(null)
    setForm({
      nombre: '',
      slug: '',
      imagen_url: '',
      orden: categoriasAplanadas.length,
      activa: true,
      padre_id: '',
    })
    setModalOpen(true)
  }

  const abrirEditar = (cat: Categoria) => {
    setSelected(cat)
    setForm({
      nombre: cat.nombre,
      slug: cat.slug,
      imagen_url: cat.imagen_url || '',
      orden: cat.orden,
      activa: cat.activa,
      padre_id: cat.padre_id || '',
    })
    setModalOpen(true)
  }

  const handleNombreChange = (nombre: string) => {
    setForm(f => ({
      ...f,
      nombre,
      slug: selected ? f.slug : generarSlug(nombre),
    }))
  }

  const handleImagenUpload = async (file: File) => {
    if (!file) return
    setUploadingImg(true)
    const ext = file.name.split('.').pop()
    const path = `categorias/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('productos').upload(path, file, { upsert: true })

    if (error) {
      toast.error('Error al subir imagen')
      setUploadingImg(false)
      return
    }

    const { data } = supabase.storage.from('productos').getPublicUrl(path)
    setForm(f => ({ ...f, imagen_url: data.publicUrl }))
    toast.success('Imagen subida')
    setUploadingImg(false)
  }

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    setSaving(true)

    const payload = {
      nombre: form.nombre.trim(),
      slug: form.slug.trim(),
      imagen_url: form.imagen_url || null,
      orden: form.orden,
      activa: form.activa,
      padre_id: form.padre_id || null,
    }

    if (selected) {
      const { error } = await supabase
        .from('categorias')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', selected.id)

      if (error) toast.error('Error al actualizar')
      else {
        toast.success('Categoría actualizada')
        setModalOpen(false)
        fetchCategorias()
      }
    } else {
      const { error } = await supabase.from('categorias').insert([payload])

      if (error) {
        if (error.code === '23505') toast.error('Ya existe una categoría con ese slug')
        else toast.error('Error al crear categoría')
      } else {
        toast.success('Categoría creada')
        setModalOpen(false)
        fetchCategorias()
      }
    }
    setSaving(false)
  }

  const handleEliminar = async () => {
    if (!selected) return
    setDeleting(true)

    const { error } = await supabase.from('categorias').delete().eq('id', selected.id)

    if (error) toast.error('Error al eliminar')
    else {
      toast.success('Categoría eliminada')
      setDeleteModal(false)
      fetchCategorias()
    }
    setDeleting(false)
  }

  const toggleActiva = async (cat: Categoria) => {
    const { error } = await supabase
      .from('categorias')
      .update({ activa: !cat.activa })
      .eq('id', cat.id)

    if (error) toast.error('Error al actualizar')
    else {
      toast.success(cat.activa ? 'Categoría desactivada' : 'Categoría activada')
      fetchCategorias()
    }
  }

  const inputSelect = `w-full bg-[var(--bg-card)] border border-[rgba(240,235,228,0.22)]
    rounded-[2px] px-4 py-3 text-[13px] font-light text-[#f0ebe4]
    focus:outline-none focus:border-[rgba(201,168,76,0.65)] transition-colors`

  const filtroLabels: Record<typeof filtroEstado, string> = {
    todas: 'Todas',
    activas: 'Activas',
    inactivas: 'Inactivas',
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-light uppercase tracking-[3px] text-[rgba(184,146,42,0.82)]">
            Gestión
          </p>
          <h1 className="text-3xl font-thin uppercase tracking-[2px] text-[#1A1A1A]">Categorías</h1>
          <p className="mt-2 text-[12px] font-light text-[rgba(240,235,228,0.65)]">
            Organiza el catálogo por secciones
          </p>
        </div>
        <Button onClick={abrirCrear} size="sm">
          <Plus size={13} />
          Nueva categoría
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 rounded-[2px] border border-[rgba(184,146,42,0.26)] bg-[#111111] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[2px] border border-[rgba(184,146,42,0.3)] bg-[var(--bg-card)] px-3 py-2.5">
            <Search size={15} className="shrink-0 text-[rgba(240,235,228,0.65)]" />
            <input
              type="text"
              placeholder="Buscar por nombre o slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[13px] font-light text-[#1A1A1A] placeholder:text-[rgba(240,235,228,0.58)] outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="shrink-0 text-[rgba(240,235,228,0.65)] transition-colors hover:text-[#1A1A1A]"
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(['todas', 'activas', 'inactivas'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltroEstado(f)}
                className={`rounded-[2px] border px-4 py-2.5 text-[11px] font-light uppercase tracking-[1.5px] transition-all ${
                  filtroEstado === f
                    ? 'border-[rgba(184,146,42,0.5)] bg-[rgba(184,146,42,0.22)] text-[#B8922A]'
                    : 'border-[rgba(240,235,228,0.42)] text-[rgba(240,235,228,0.82)] hover:border-[rgba(184,146,42,0.42)] hover:text-[#1A1A1A]'
                }`}
              >
                {filtroLabels[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contador */}
      <div className="mb-4 flex items-center justify-between border-b border-[rgba(184,146,42,0.22)] pb-3">
        <p className="text-[12px] font-light uppercase tracking-[1px] text-[rgba(240,235,228,0.78)]">
          {categoriasFiltradas.length} categoría{categoriasFiltradas.length !== 1 ? 's' : ''}
          {search && ` para "${search}"`}
        </p>
        {filtroEstado !== 'todas' && (
          <span className="text-[11px] font-light text-[rgba(184,146,42,0.92)]">
            Filtro: {filtroLabels[filtroEstado]}
          </span>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-[2px] border border-[rgba(184,146,42,0.26)] bg-[#111111]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-[rgba(184,146,42,0.22)] bg-[rgba(184,146,42,0.25)]">
                {['', 'Imagen', 'Categoría', 'Slug', 'Orden', 'Estado', 'Acciones'].map(h => (
                  <th
                    key={h || 'drag'}
                    className="px-4 py-3.5 text-left text-[10px] font-light uppercase tracking-[1.5px] text-[rgba(240,235,228,0.72)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(184,146,42,0.14)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : categoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[2px] bg-[rgba(184,146,42,0.14)]">
                        <Tag size={22} className="text-[rgba(184,146,42,0.5)]" />
                      </div>
                      <p className="text-[14px] font-light text-[rgba(240,235,228,0.88)]">
                        {search
                          ? 'No se encontraron categorías con esa búsqueda'
                          : filtroEstado !== 'todas'
                            ? `No hay categorías ${filtroLabels[filtroEstado].toLowerCase()}`
                            : 'Aún no hay categorías creadas'}
                      </p>
                      <p className="mt-1 text-[12px] font-light text-[rgba(240,235,228,0.6)]">
                        {search || filtroEstado !== 'todas'
                          ? 'Prueba con otros filtros o términos de búsqueda'
                          : 'Crea la primera categoría para organizar tus productos'}
                      </p>
                      {!search && filtroEstado === 'todas' && (
                        <Button onClick={abrirCrear} size="sm" className="mt-5">
                          <Plus size={13} />
                          Crear categoría
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {categoriasFiltradas.map((cat, i) => (
                    <motion.tr
                      key={cat.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="transition-colors hover:bg-[rgba(184,146,42,0.25)]"
                    >
                      <td className="px-3 py-3.5 text-[rgba(240,235,228,0.55)]">
                        <GripVertical size={14} />
                      </td>

                      <td className="px-4 py-3.5">
                        {cat.imagen_url ? (
                          <img
                            src={cat.imagen_url}
                            alt={cat.nombre}
                            className="h-11 w-11 rounded-[2px] border border-[rgba(184,146,42,0.3)] object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-[2px] border border-[rgba(184,146,42,0.22)] bg-[#141414]">
                            <ImageIcon size={14} className="text-[rgba(184,146,42,0.42)]" />
                          </div>
                        )}
                      </td>

                      <td className={`max-w-[240px] px-4 py-3.5 ${cat.esSubcategoria ? 'pl-6' : ''}`}>
                        <p
                          className="truncate text-[13px] font-light text-[#1A1A1A]"
                          title={cat.nombre}
                        >
                          {cat.esSubcategoria && (
                            <span className="mr-1 text-[rgba(240,235,228,0.55)]">└</span>
                          )}
                          {cat.nombre}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <code className="inline-block max-w-[160px] truncate rounded-[2px] bg-[rgba(184,146,42,0.18)] px-2.5 py-1 text-[11px] font-light text-[rgba(184,146,42,0.92)]">
                          {cat.slug}
                        </code>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-[2px] border border-[rgba(240,235,228,0.38)] bg-[var(--bg-card)] px-2 text-[12px] font-light tabular-nums text-[rgba(240,235,228,0.82)]">
                          {cat.orden}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => toggleActiva(cat)}
                          className={`inline-flex items-center gap-1.5 rounded-[2px] border px-2.5 py-1.5 transition-all ${
                            cat.activa
                              ? 'border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.08)] hover:bg-[rgba(74,222,128,0.12)]'
                              : 'border-[rgba(240,235,228,0.42)] bg-[var(--bg-card)] hover:bg-[rgba(240,235,228,0.08)]'
                          }`}
                          title={cat.activa ? 'Desactivar categoría' : 'Activar categoría'}
                        >
                          {cat.activa ? (
                            <>
                              <CheckCircle2 size={13} className="text-emerald-400" />
                              <span className="text-[10px] font-light uppercase tracking-[1px] text-emerald-400">
                                Activa
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle size={13} className="text-[rgba(240,235,228,0.65)]" />
                              <span className="text-[10px] font-light uppercase tracking-[1px] text-[rgba(240,235,228,0.72)]">
                                Inactiva
                              </span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => abrirEditar(cat)}
                            className="rounded-[2px] p-2 text-[rgba(240,235,228,0.72)] transition-all hover:bg-[rgba(184,146,42,0.22)] hover:text-[#B8922A]"
                            aria-label="Editar categoría"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(cat)
                              setDeleteModal(true)
                            }}
                            className="rounded-[2px] p-2 text-[rgba(240,235,228,0.72)] transition-all hover:bg-[rgba(248,113,113,0.1)] hover:text-red-400"
                            aria-label="Eliminar categoría"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selected ? 'Editar categoría' : 'Nueva categoría'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={form.nombre}
            onChange={e => handleNombreChange(e.target.value)}
            placeholder="Ej: Shampoo"
          />

          <Input
            label="Slug (URL)"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            placeholder="ej: shampoo"
            hint="Se genera automáticamente desde el nombre"
          />

          <div className="space-y-1.5">
            <label className="block text-[11px] font-light uppercase tracking-[2px] text-[rgba(240,235,228,0.78)]">
              Categoría padre (opcional)
            </label>
            <select
              value={form.padre_id}
              onChange={e => setForm(f => ({ ...f, padre_id: e.target.value }))}
              className={inputSelect}
            >
              <option value="">Ninguna — categoría raíz</option>
              {categorias
                .filter(c => c.id !== selected?.id)
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
            </select>
            <p className="text-[10px] font-light tracking-[0.3px] text-[rgba(240,235,228,0.58)]">
              Si seleccionas una categoría padre, esta será una subcategoría
            </p>
          </div>

          <Input
            label="Orden"
            type="number"
            value={form.orden}
            onChange={e => setForm(f => ({ ...f, orden: Number(e.target.value) }))}
          />

          <div className="space-y-1.5">
            <label className="block text-[11px] font-light uppercase tracking-[2px] text-[rgba(240,235,228,0.78)]">
              Imagen
            </label>
            <div className="flex items-start gap-3">
              {form.imagen_url && (
                <img
                  src={form.imagen_url}
                  alt="preview"
                  className="h-16 w-16 rounded-[2px] border border-[rgba(26,26,26,0.22)] object-cover"
                />
              )}
              <label className="flex-1 cursor-pointer">
                <div className="rounded-[2px] border border-dashed border-[rgba(184,146,42,0.42)] px-4 py-4 text-center transition-all hover:border-[rgba(184,146,42,0.67)] hover:bg-[rgba(184,146,42,0.25)]">
                  {uploadingImg ? (
                    <p className="animate-pulse text-[11px] font-light text-[rgba(240,235,228,0.78)]">
                      Subiendo...
                    </p>
                  ) : (
                    <>
                      <ImageIcon size={16} className="mx-auto mb-1 text-[rgba(184,146,42,0.72)]" />
                      <p className="text-[11px] font-light tracking-[1px] text-[rgba(240,235,228,0.72)]">
                        Haz clic para subir imagen
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImagenUpload(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[rgba(184,146,42,0.22)] py-3">
            <span className="text-[11px] font-light uppercase tracking-[1px] text-[rgba(240,235,228,0.82)]">
              Categoría activa
            </span>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, activa: !f.activa }))}
              className={`relative h-5 w-10 rounded-full transition-all duration-300 ${
                form.activa ? 'bg-[#B8922A]' : 'bg-[rgba(240,235,228,0.28)]'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-[var(--bg-card)] shadow transition-all duration-300 ${
                  form.activa ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} fullWidth>
              Cancelar
            </Button>
            <Button onClick={handleGuardar} loading={saving} fullWidth>
              {selected ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Eliminar categoría" size="sm">
        <div className="space-y-5">
          <p className="text-[13px] font-light leading-relaxed text-[rgba(240,235,228,0.88)]">
            ¿Estás seguro de eliminar <span className="text-[#1A1A1A]">{selected?.nombre}</span>? Los productos de
            esta categoría quedarán sin categoría.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteModal(false)} fullWidth>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleEliminar} loading={deleting} fullWidth>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
