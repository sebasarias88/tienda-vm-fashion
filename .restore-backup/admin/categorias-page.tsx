'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Categoria } from '@/types'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import CategoriaForm from '@/components/admin/CategoriaForm'
import {
  AdminTable,
  AdminTableHead,
  AdminTableHeaderRow,
  AdminTableTh,
  AdminTableBody,
  AdminTableRow,
  AdminTableTd,
  AdminTableEmpty,
  AdminTableImage,
  AdminTablePrimary,
  AdminTableSlug,
  AdminTableNumber,
  AdminTableStatus,
  AdminTableActions,
  AdminTableSkeletonRow,
} from '@/components/admin/AdminTable'
import toast from 'react-hot-toast'
import {
  Plus,
  GripVertical,
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
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'activas' | 'inactivas'>('todas')

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

  const abrirCrear = () => {
    setSelected(null)
    setModalOpen(true)
  }

  const abrirEditar = (cat: Categoria) => {
    setSelected(cat)
    setModalOpen(true)
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

  const filtroLabels: Record<typeof filtroEstado, string> = {
    todas: 'Todas',
    activas: 'Activas',
    inactivas: 'Inactivas',
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 border-b border-[rgba(212,175,55,0.16)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px w-8 bg-[#D4AF37]" />
            <p className="text-[10px] font-light uppercase tracking-[3px] text-[rgba(212,175,55,0.9)]">
              Gestión
            </p>
          </div>
          <h1 className="text-3xl font-thin uppercase tracking-[2px] text-[#F8F6F1] sm:text-4xl">
            Categorías
          </h1>
          <p className="mt-2 text-[13px] font-light text-[rgba(248,246,241,0.55)]">
            Organiza el catálogo por secciones y subcategorías
          </p>
        </div>
        <Button onClick={abrirCrear} size="sm" className="self-start sm:self-auto !text-[#0D0D0D]">
          <Plus size={13} />
          Nueva categoría
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex w-full min-w-0 flex-1 items-center gap-2.5 rounded-[2px] border border-[rgba(212,175,55,0.22)] bg-[#161616] px-3 py-2.5">
          <Search size={15} className="shrink-0 text-[rgba(248,246,241,0.45)]" />
          <input
            type="text"
            placeholder="Buscar por nombre o slug..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[13px] font-light text-[#F8F6F1] outline-none placeholder:text-[rgba(248,246,241,0.45)]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="shrink-0 text-[rgba(248,246,241,0.5)] transition-colors hover:text-[#D4AF37]"
              aria-label="Limpiar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="grid w-full grid-cols-3 gap-2 lg:flex lg:w-auto lg:flex-nowrap">
          {(['todas', 'activas', 'inactivas'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltroEstado(f)}
              className={`rounded-[2px] border px-4 py-2.5 text-[11px] font-light uppercase tracking-[1.5px] transition-all lg:whitespace-nowrap ${
                filtroEstado === f
                  ? 'border-[rgba(212,175,55,0.5)] bg-[rgba(212,175,55,0.12)] text-[#D4AF37]'
                  : 'border-[rgba(248,246,241,0.15)] text-[rgba(248,246,241,0.65)] hover:border-[rgba(212,175,55,0.35)] hover:text-[#D4AF37]'
              }`}
            >
              {filtroLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Contador */}
      <div className="mb-4 flex items-center justify-between border-b border-[rgba(212,175,55,0.12)] pb-3">
        <p className="text-[12px] font-light uppercase tracking-[1px] text-[rgba(248,246,241,0.65)]">
          {categoriasFiltradas.length} categoría{categoriasFiltradas.length !== 1 ? 's' : ''}
          {search && ` para "${search}"`}
        </p>
        {filtroEstado !== 'todas' && (
          <span className="text-[11px] font-light text-[#D4AF37]">
            Filtro: {filtroLabels[filtroEstado]}
          </span>
        )}
      </div>

      {/* Tabla */}
      <AdminTable minWidth="800px">
        <AdminTableHead>
          <AdminTableHeaderRow>
            <AdminTableTh className="w-10" />
            <AdminTableTh>Imagen</AdminTableTh>
            <AdminTableTh>Categoría</AdminTableTh>
            <AdminTableTh>Slug</AdminTableTh>
            <AdminTableTh className="w-16 text-center">Orden</AdminTableTh>
            <AdminTableTh>Estado</AdminTableTh>
            <AdminTableTh className="w-14 text-center">Acciones</AdminTableTh>
          </AdminTableHeaderRow>
        </AdminTableHead>
        <AdminTableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <AdminTableSkeletonRow key={i} cols={7} />)
          ) : categoriasFiltradas.length === 0 ? (
            <AdminTableEmpty
              colSpan={7}
              icon={Tag}
              title={
                search
                  ? 'No se encontraron categorías con esa búsqueda'
                  : filtroEstado !== 'todas'
                    ? `No hay categorías ${filtroLabels[filtroEstado].toLowerCase()}`
                    : 'Aún no hay categorías creadas'
              }
              description={
                search || filtroEstado !== 'todas'
                  ? 'Prueba con otros filtros o términos de búsqueda'
                  : 'Crea la primera categoría para organizar tus productos'
              }
              action={
                !search && filtroEstado === 'todas' ? (
                  <Button onClick={abrirCrear} size="sm" className="!text-[#0D0D0D]">
                    <Plus size={13} />
                    Crear categoría
                  </Button>
                ) : undefined
              }
            />
          ) : (
            categoriasFiltradas.map((cat, i) => (
              <AdminTableRow key={cat.id} index={i}>
                <AdminTableTd className="w-10">
                  <GripVertical
                    size={15}
                    className="text-[rgba(248,246,241,0.2)] transition-colors group-hover:text-[rgba(212,175,55,0.45)]"
                  />
                </AdminTableTd>

                <AdminTableTd>
                  <AdminTableImage src={cat.imagen_url} alt={cat.nombre} size="sm" />
                </AdminTableTd>

                <AdminTableTd className="max-w-0">
                  <AdminTablePrimary
                    title={cat.nombre}
                    subtitle={cat.esSubcategoria ? 'Subcategoría' : undefined}
                    indent={cat.esSubcategoria}
                  />
                </AdminTableTd>

                <AdminTableTd className="max-w-0">
                  <AdminTableSlug slug={cat.slug} />
                </AdminTableTd>

                <AdminTableTd>
                  <AdminTableNumber value={cat.orden} />
                </AdminTableTd>

                <AdminTableTd>
                  <AdminTableStatus
                    label={cat.activa ? 'Activa' : 'Inactiva'}
                    icon={cat.activa ? CheckCircle2 : XCircle}
                    variant={cat.activa ? 'success' : 'neutral'}
                    onClick={() => toggleActiva(cat)}
                    title={cat.activa ? 'Desactivar categoría' : 'Activar categoría'}
                  />
                </AdminTableTd>

                <AdminTableTd className="text-center">
                  <AdminTableActions
                    onEdit={() => abrirEditar(cat)}
                    onDelete={() => {
                      setSelected(cat)
                      setDeleteModal(true)
                    }}
                  />
                </AdminTableTd>
              </AdminTableRow>
            ))
          )}
        </AdminTableBody>
      </AdminTable>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selected ? 'Editar categoría' : 'Nueva categoría'}
        size="lg"
      >
        <CategoriaForm
          key={selected?.id ?? 'nueva'}
          categoria={selected}
          categoriasRaiz={categorias}
          ordenDefault={categoriasAplanadas.length}
          onSuccess={() => {
            setModalOpen(false)
            fetchCategorias()
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Eliminar categoría" size="sm">
        <div className="space-y-5">
          <p className="text-[13px] font-light leading-relaxed text-[rgba(248,246,241,0.75)]">
            ¿Estás seguro de eliminar{' '}
            <span className="text-[#D4AF37]">{selected?.nombre}</span>? Los productos de esta
            categoría quedarán sin categoría.
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
