'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Producto } from '@/types'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import ProductForm from '@/components/admin/ProductForm'
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
  AdminTableCategory,
  AdminTableCategoryEmpty,
  AdminTablePrice,
  AdminTableStatus,
  AdminTableActions,
  AdminTableSkeletonRow,
  AdminListToolbar,
  AdminListMeta,
} from '@/components/admin/AdminTable'
import toast from 'react-hot-toast'
import {
  Plus,
  CheckCircle2,
  XCircle,
  Star,
  Package,
} from 'lucide-react'

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [formModal, setFormModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selected, setSelected] = useState<Producto | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [filtroDisponible, setFiltroDisponible] = useState<'todos' | 'disponible' | 'agotado'>('todos')

  const fetchProductos = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('productos')
      .select('*, categoria:categorias(id, nombre, slug)')
      .order('orden', { ascending: true })

    if (filtroDisponible === 'disponible') query = query.eq('disponible', true)
    if (filtroDisponible === 'agotado') query = query.eq('disponible', false)

    const { data, error } = await query
    if (error) toast.error('Error al cargar productos')
    else setProductos(data || [])
    setLoading(false)
  }, [filtroDisponible])

  useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

  const productosFiltrados = productos.filter(
    p =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()),
  )

  const abrirCrear = () => {
    setSelected(null)
    setFormModal(true)
  }
  const abrirEditar = (p: Producto) => {
    setSelected(p)
    setFormModal(true)
  }

  const handleEliminar = async () => {
    if (!selected) return
    setDeleting(true)

    if (selected.imagenes?.length) {
      const paths = selected.imagenes
        .map(url => {
          const parts = url.split('/productos/')
          return parts.length > 1 ? `productos/${parts[1]}` : null
        })
        .filter(Boolean) as string[]
      if (paths.length) await supabase.storage.from('productos').remove(paths)
    }

    const { error } = await supabase.from('productos').delete().eq('id', selected.id)
    if (error) toast.error('Error al eliminar')
    else {
      toast.success('Producto eliminado')
      setDeleteModal(false)
      fetchProductos()
    }
    setDeleting(false)
  }

  const toggleDisponible = async (p: Producto) => {
    const { error } = await supabase
      .from('productos')
      .update({ disponible: !p.disponible })
      .eq('id', p.id)

    if (error) toast.error('Error al actualizar')
    else {
      toast.success(p.disponible ? 'Marcado como agotado' : 'Marcado como disponible')
      fetchProductos()
    }
  }

  const formatPrecio = (precio: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio)

  const filtroLabels: Record<typeof filtroDisponible, string> = {
    todos: 'Todos',
    disponible: 'Disponibles',
    agotado: 'Agotados',
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
            Productos
          </h1>
          <p className="mt-2 text-[13px] font-light text-[var(--text-muted)]">
            Administra el catálogo de la tienda
          </p>
        </div>
        <Button onClick={abrirCrear} size="sm" className="self-start sm:self-auto">
          <Plus size={13} />
          Nuevo producto
        </Button>
      </div>

      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o SKU..."
        filters={[
          { id: 'todos' as const, label: 'Todos' },
          { id: 'disponible' as const, label: 'Disponibles' },
          { id: 'agotado' as const, label: 'Agotados' },
        ]}
        activeFilter={filtroDisponible}
        onFilterChange={setFiltroDisponible}
      />

      <AdminListMeta
        count={productosFiltrados.length}
        noun="producto"
        search={search || undefined}
        activeFilterLabel={filtroDisponible !== 'todos' ? filtroLabels[filtroDisponible] : undefined}
      />

      {/* Tabla */}
      <AdminTable minWidth="1040px" fixed>
        <AdminTableHead>
          <AdminTableHeaderRow>
            <AdminTableTh className="w-[7rem]">Imagen</AdminTableTh>
            <AdminTableTh className="w-[22%]">Producto</AdminTableTh>
            <AdminTableTh className="w-[20%]">Categoría</AdminTableTh>
            <AdminTableTh className="w-[7.5rem]">Precio detal</AdminTableTh>
            <AdminTableTh className="w-[7.5rem]">Precio mayoreo</AdminTableTh>
            <AdminTableTh className="w-[7.5rem]">Estado</AdminTableTh>
            <AdminTableTh className="w-[7.5rem]">Destacado</AdminTableTh>
            <AdminTableTh className="w-[5.5rem] text-center">Acciones</AdminTableTh>
          </AdminTableHeaderRow>
        </AdminTableHead>
        <AdminTableBody>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <AdminTableSkeletonRow key={i} cols={8} />)
          ) : productosFiltrados.length === 0 ? (
            <AdminTableEmpty
              colSpan={8}
              icon={Package}
              title={
                search
                  ? 'No se encontraron productos con esa búsqueda'
                  : filtroDisponible !== 'todos'
                    ? `No hay productos ${filtroLabels[filtroDisponible].toLowerCase()}`
                    : 'Aún no hay productos en el catálogo'
              }
              description={
                search || filtroDisponible !== 'todos'
                  ? 'Prueba con otros filtros o términos de búsqueda'
                  : 'Crea el primer producto para empezar a vender'
              }
              action={
                !search && filtroDisponible === 'todos' ? (
                  <Button onClick={abrirCrear} size="sm" className="">
                    <Plus size={13} />
                    Crear producto
                  </Button>
                ) : undefined
              }
            />
          ) : (
            productosFiltrados.map((p, i) => (
              <AdminTableRow key={p.id} index={i}>
                <AdminTableTd>
                  <AdminTableImage src={p.imagenes?.[0]} alt={p.nombre} />
                </AdminTableTd>

                <AdminTableTd className="max-w-0">
                  <AdminTablePrimary
                    title={p.nombre}
                    subtitle={p.sku ? `SKU · ${p.sku}` : undefined}
                  />
                </AdminTableTd>

                <AdminTableTd className="max-w-0">
                  {p.categoria ? (
                    <AdminTableCategory name={p.categoria.nombre} />
                  ) : (
                    <AdminTableCategoryEmpty />
                  )}
                </AdminTableTd>

                <AdminTableTd>
                  <AdminTablePrice
                    value={formatPrecio(p.precio)}
                    previous={p.precio_antes ? formatPrecio(p.precio_antes) : null}
                    tone="detal"
                  />
                </AdminTableTd>

                <AdminTableTd>
                  {p.precio_mayoreo != null ? (
                    <AdminTablePrice
                      value={formatPrecio(p.precio_mayoreo)}
                      previous={
                        p.precio_antes_mayoreo ? formatPrecio(p.precio_antes_mayoreo) : null
                      }
                      tone="mayoreo"
                    />
                  ) : (
                    <AdminTablePrice value="—" tone="muted" />
                  )}
                </AdminTableTd>

                <AdminTableTd>
                  <AdminTableStatus
                    label={p.disponible ? 'Disponible' : 'Agotado'}
                    icon={p.disponible ? CheckCircle2 : XCircle}
                    variant={p.disponible ? 'success' : 'danger'}
                    onClick={() => toggleDisponible(p)}
                    title={p.disponible ? 'Marcar como agotado' : 'Marcar como disponible'}
                  />
                </AdminTableTd>

                <AdminTableTd>
                  {p.destacado ? (
                    <AdminTableStatus
                      label="Destacado"
                      icon={Star}
                      variant="gold"
                      iconClassName="fill-[var(--gold-bright)]"
                    />
                  ) : (
                    <span className="text-[11px] font-light text-[var(--text-faint)]">—</span>
                  )}
                </AdminTableTd>

                <AdminTableTd className="text-center">
                  <AdminTableActions
                    onEdit={() => abrirEditar(p)}
                    onDelete={() => {
                      setSelected(p)
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
        open={formModal}
        onClose={() => setFormModal(false)}
        title={selected ? 'Editar producto' : 'Nuevo producto'}
        size="xl"
      >
        <ProductForm
          producto={selected}
          onSuccess={() => {
            setFormModal(false)
            fetchProductos()
          }}
          onCancel={() => setFormModal(false)}
        />
      </Modal>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Eliminar producto" size="sm">
        <div className="space-y-5">
          <p className="text-[13px] font-light leading-relaxed text-[var(--text-secondary)]">
            ¿Estás seguro de eliminar{' '}
            <span className="text-[var(--gold-bright)]">{selected?.nombre}</span>? También se eliminarán todas
            sus imágenes. Esta acción no se puede deshacer.
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
