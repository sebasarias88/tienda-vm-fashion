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
  AdminListToolbar,
  AdminListMeta,
} from '@/components/admin/AdminTable'
import toast from 'react-hot-toast'
import {
  Plus,
  GripVertical,
  Tag,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import MobileAdminToolbar from '@/components/admin/mobile/MobileAdminToolbar'
import MobileCategoriaCard from '@/components/admin/mobile/MobileCategoriaCard'
import { MobileEmptyState } from '@/components/admin/mobile/MobileAdminPrimitives'

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
    <>
    <div className="hidden min-h-screen bg-[var(--bg-base)] p-6 sm:p-8 lg:p-10 md:block">
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
            Categorías
          </h1>
          <p className="mt-2 text-[13px] font-light text-[var(--text-muted)]">
            Organiza el catálogo por secciones y subcategorías
          </p>
        </div>
        <Button onClick={abrirCrear} size="sm" className="self-start sm:self-auto">
          <Plus size={13} />
          Nueva categoría
        </Button>
      </div>

      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o slug..."
        filters={[
          { id: 'todas' as const, label: 'Todas' },
          { id: 'activas' as const, label: 'Activas' },
          { id: 'inactivas' as const, label: 'Inactivas' },
        ]}
        activeFilter={filtroEstado}
        onFilterChange={setFiltroEstado}
      />

      <AdminListMeta
        count={categoriasFiltradas.length}
        noun="categoría"
        search={search || undefined}
        activeFilterLabel={filtroEstado !== 'todas' ? filtroLabels[filtroEstado] : undefined}
      />

      {/* Tabla */}
      <AdminTable fixed>
        <AdminTableHead>
          <AdminTableHeaderRow>
            <AdminTableTh className="w-[5.5rem] px-3" />
            <AdminTableTh className="w-[32%]">Categoría</AdminTableTh>
            <AdminTableTh className="w-[28%]">Slug</AdminTableTh>
            <AdminTableTh className="w-[4.5rem]">Orden</AdminTableTh>
            <AdminTableTh className="w-[8rem]">Estado</AdminTableTh>
            <AdminTableTh className="w-[5.5rem] text-center">Acciones</AdminTableTh>
          </AdminTableHeaderRow>
        </AdminTableHead>
        <AdminTableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <AdminTableSkeletonRow key={i} cols={6} />)
          ) : categoriasFiltradas.length === 0 ? (
            <AdminTableEmpty
              colSpan={6}
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
                  <Button onClick={abrirCrear} size="sm" className="">
                    <Plus size={13} />
                    Crear categoría
                  </Button>
                ) : undefined
              }
            />
          ) : (
            categoriasFiltradas.map((cat, i) => (
              <AdminTableRow key={cat.id} index={i}>
                <AdminTableTd className="px-3">
                  <div className="flex items-center gap-2">
                    <GripVertical
                      size={15}
                      className="shrink-0 text-[rgba(248,246,241,0.2)] transition-colors group-hover:text-[rgba(201,168,76,0.45)]"
                    />
                    <AdminTableImage src={cat.imagen_url} alt={cat.nombre} size="sm" />
                  </div>
                </AdminTableTd>

                <AdminTableTd className="max-w-0">
                  <AdminTablePrimary
                    title={cat.nombre}
                    subtitle={cat.esSubcategoria ? 'Subcategoría' : undefined}
                    indent={cat.esSubcategoria}
                  />
                </AdminTableTd>

                <AdminTableTd className="max-w-0">
                  <AdminTableSlug slug={cat.slug} className="max-w-full" />
                </AdminTableTd>

                <AdminTableTd className="px-3">
                  <AdminTableNumber value={cat.orden} />
                </AdminTableTd>

                <AdminTableTd className="px-3">
                  <AdminTableStatus
                    label={cat.activa ? 'Activa' : 'Inactiva'}
                    icon={cat.activa ? CheckCircle2 : XCircle}
                    variant={cat.activa ? 'success' : 'neutral'}
                    onClick={() => toggleActiva(cat)}
                    title={cat.activa ? 'Desactivar categoría' : 'Activar categoría'}
                  />
                </AdminTableTd>

                <AdminTableTd className="px-3 text-center">
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
    </div>

    <div className="mobile-admin-page px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:hidden">
      <p className="mb-4 text-[12px] font-light text-[var(--text-muted)]">
        Organiza el catálogo por secciones y subcategorías
      </p>

      <MobileAdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o slug..."
        filters={[
          { id: 'todas' as const, label: 'Todas' },
          { id: 'activas' as const, label: 'Activas' },
          { id: 'inactivas' as const, label: 'Inactivas' },
        ]}
        activeFilter={filtroEstado}
        onFilterChange={setFiltroEstado}
      />

      <p className="mb-3 text-[11px] text-[var(--text-subtle)]">
        {categoriasFiltradas.length} categoría{categoriasFiltradas.length !== 1 ? 's' : ''}
        {search ? ` · "${search}"` : ''}
        {filtroEstado !== 'todas' ? ` · ${filtroLabels[filtroEstado]}` : ''}
      </p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-[2px] bg-[var(--bg-card)]" />
          ))}
        </div>
      ) : categoriasFiltradas.length === 0 ? (
        <MobileEmptyState
          icon={Tag}
          title={
            search
              ? 'No se encontraron categorías'
              : filtroEstado !== 'todas'
                ? `No hay categorías ${filtroLabels[filtroEstado].toLowerCase()}`
                : 'Aún no hay categorías'
          }
          description={
            search || filtroEstado !== 'todas'
              ? 'Prueba con otros filtros'
              : 'Crea la primera categoría'
          }
          action={
            !search && filtroEstado === 'todas' ? (
              <Button onClick={abrirCrear} size="sm">
                <Plus size={13} />
                Crear categoría
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {categoriasFiltradas.map(cat => (
            <MobileCategoriaCard
              key={cat.id}
              categoria={cat}
              onEdit={() => abrirEditar(cat)}
              onDelete={() => {
                setSelected(cat)
                setDeleteModal(true)
              }}
              onToggleActiva={() => toggleActiva(cat)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={abrirCrear}
        className="mobile-admin-fab fixed z-40 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(201,168,76,0.45)] bg-[var(--gold-bright)] text-[var(--bg-base)] shadow-lg md:hidden"
        aria-label="Nueva categoría"
      >
        <Plus size={22} strokeWidth={1.75} />
      </button>
    </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selected ? 'Editar categoría' : 'Nueva categoría'}
        size="xl"
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
          <p className="text-[13px] font-light leading-relaxed text-[var(--text-secondary)]">
            ¿Estás seguro de eliminar{' '}
            <span className="text-[var(--gold-bright)]">{selected?.nombre}</span>? Los productos de esta
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
    </>
  )
}
