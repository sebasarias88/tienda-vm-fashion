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
  AdminTablePagination,
} from '@/components/admin/AdminTable'
import {
  ADMIN_TABLE_PAGE_SIZE,
  clampPage,
} from '@/lib/pagination'
import toast from 'react-hot-toast'
import {
  Plus,
  Star,
  Package,
} from 'lucide-react'
import MobileAdminToolbar from '@/components/admin/mobile/MobileAdminToolbar'
import MobileProductCard from '@/components/admin/mobile/MobileProductCard'
import { MobileEmptyState } from '@/components/admin/mobile/MobileAdminPrimitives'
import AdminLoadError from '@/components/admin/AdminLoadError'
import { useDebouncedValue } from '@/lib/useDebounce'
import { productIdsMatchingSearch } from '@/lib/productSearch'

type CategoriaInfo = { nombre: string; padre_id: string | null }

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [categoriasMap, setCategoriasMap] = useState<Record<string, CategoriaInfo>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [formModal, setFormModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selected, setSelected] = useState<Producto | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350)
  const [filtroDisponible, setFiltroDisponible] = useState<'todos' | 'disponible' | 'agotado'>('todos')
  const [page, setPage] = useState(1)

  const fetchProductos = useCallback(async () => {
    setLoading(true)
    const from = (page - 1) * ADMIN_TABLE_PAGE_SIZE
    const to = from + ADMIN_TABLE_PAGE_SIZE - 1
    const q = debouncedSearch.trim()

    let query = supabase
      .from('productos')
      .select(
        'id, nombre, slug, precio, precio_antes, precio_mayoreo, precio_antes_mayoreo, disponible, disponible_detal, disponible_mayoreo, destacado, marca, categoria_id, imagenes, orden, created_at, updated_at, sku, categoria:categorias(id, nombre, slug)',
        { count: 'exact' },
      )
      .order('orden', { ascending: true })

    if (filtroDisponible === 'disponible') query = query.eq('disponible', true)
    if (filtroDisponible === 'agotado') query = query.eq('disponible', false)

    if (q) {
      const searchIds = await productIdsMatchingSearch(supabase, q)
      if (searchIds !== null) {
        if (searchIds.length === 0) {
          setProductos([])
          setTotalCount(0)
          const { data: cats } = await supabase.from('categorias').select('id, nombre, padre_id')
          const map: Record<string, CategoriaInfo> = {}
          ;(cats || []).forEach((c: { id: string; nombre: string; padre_id: string | null }) => {
            map[c.id] = { nombre: c.nombre, padre_id: c.padre_id ?? null }
          })
          setCategoriasMap(map)
          setLoadError(false)
          setLoading(false)
          return
        }
        query = query.in('id', searchIds)
      } else {
        query = query.or(`nombre.ilike.%${q}%,sku.ilike.%${q}%`)
      }
    }

    const [{ data, error, count }, { data: cats }] = await Promise.all([
      query.range(from, to),
      supabase.from('categorias').select('id, nombre, padre_id'),
    ])

    if (error) {
      toast.error('Error al cargar productos')
      setLoadError(true)
    } else {
      setProductos((data as Producto[]) || [])
      setTotalCount(count ?? 0)
      const map: Record<string, CategoriaInfo> = {}
      ;(cats || []).forEach((c: { id: string; nombre: string; padre_id: string | null }) => {
        map[c.id] = { nombre: c.nombre, padre_id: c.padre_id ?? null }
      })
      setCategoriasMap(map)
      setLoadError(false)
    }
    setLoading(false)
  }, [filtroDisponible, page, debouncedSearch])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filtroDisponible])

  useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

  const productosPaginados = productos
  const currentPage = clampPage(page, totalCount, ADMIN_TABLE_PAGE_SIZE)

  const abrirCrear = () => {
    setSelected(null)
    setFormModal(true)
  }
  const abrirEditar = async (p: Producto) => {
    // Cargar fila completa solo al editar (listado es lean)
    const { data, error } = await supabase
      .from('productos')
      .select('*, categoria:categorias(id, nombre, slug)')
      .eq('id', p.id)
      .single()
    if (error || !data) {
      toast.error('No se pudo cargar el producto')
      return
    }
    setSelected(data as Producto)
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

  const toggleCatalogo = async (
    p: Producto,
    campo: 'disponible_detal' | 'disponible_mayoreo',
  ) => {
    const nuevoValor = !p[campo]

    const update: Record<string, boolean> = { [campo]: nuevoValor }
    if (nuevoValor) update.disponible = true

    const { error } = await supabase
      .from('productos')
      .update(update)
      .eq('id', p.id)

    if (error) toast.error('Error al actualizar')
    else {
      const etiqueta = campo === 'disponible_detal' ? 'Detal' : 'Mayorista'
      toast.success(`${etiqueta} ${nuevoValor ? 'disponible' : 'agotado'}`)
      fetchProductos()
    }
  }

  const formatPrecio = (precio: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio)

  /** Nombre de la categoría padre si la categoría del producto es una subcategoría. */
  const getCategoriaPadre = (categoriaId?: string | null): string | null => {
    if (!categoriaId) return null
    const padreId = categoriasMap[categoriaId]?.padre_id
    if (!padreId) return null
    return categoriasMap[padreId]?.nombre ?? null
  }

  const filtroLabels: Record<typeof filtroDisponible, string> = {
    todos: 'Todos',
    disponible: 'Disponibles',
    agotado: 'Agotados',
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
        count={totalCount}
        noun="producto"
        search={search || undefined}
        activeFilterLabel={filtroDisponible !== 'todos' ? filtroLabels[filtroDisponible] : undefined}
      />

      {/* Tabla */}
      {loadError && !loading ? (
        <AdminLoadError
          onRetry={fetchProductos}
          title="No se pudieron cargar los productos"
        />
      ) : (
      <AdminTable
        minWidth="1180px"
        footer={
          <AdminTablePagination
            page={currentPage}
            pageSize={ADMIN_TABLE_PAGE_SIZE}
            totalItems={totalCount}
            onPageChange={setPage}
          />
        }
      >
        <AdminTableHead>
          <AdminTableHeaderRow>
            <AdminTableTh className="w-[7rem]">Imagen</AdminTableTh>
            <AdminTableTh>Producto</AdminTableTh>
            <AdminTableTh>Marca</AdminTableTh>
            <AdminTableTh>Categoría</AdminTableTh>
            <AdminTableTh>Precio detal</AdminTableTh>
            <AdminTableTh>Precio mayorista</AdminTableTh>
            <AdminTableTh>Estado</AdminTableTh>
            <AdminTableTh>Destacado</AdminTableTh>
            <AdminTableTh className="w-[5.5rem] text-center">Acciones</AdminTableTh>
          </AdminTableHeaderRow>
        </AdminTableHead>
        <AdminTableBody>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <AdminTableSkeletonRow key={i} cols={9} />)
          ) : totalCount === 0 ? (
            <AdminTableEmpty
              colSpan={9}
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
            productosPaginados.map((p, i) => (
              <AdminTableRow key={p.id} index={i}>
                <AdminTableTd>
                  <AdminTableImage src={p.imagenes?.[0]} alt={p.nombre} />
                </AdminTableTd>

                <AdminTableTd className="min-w-[12rem] max-w-[16rem]">
                  <AdminTablePrimary
                    title={p.nombre}
                    subtitle={p.sku ? `SKU · ${p.sku}` : undefined}
                  />
                </AdminTableTd>

                <AdminTableTd className="min-w-[7rem] max-w-[10rem]">
                  {p.marca ? (
                    <span className="truncate text-[12px] font-light text-[var(--text-secondary)]">
                      {p.marca}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--text-faint)]">—</span>
                  )}
                </AdminTableTd>

                <AdminTableTd className="min-w-[11rem] max-w-[14rem]">
                  {p.categoria ? (
                    <AdminTableCategory
                      name={p.categoria.nombre}
                      parent={getCategoriaPadre(p.categoria.id)}
                    />
                  ) : (
                    <AdminTableCategoryEmpty />
                  )}
                </AdminTableTd>

                <AdminTableTd className="whitespace-nowrap">
                  <AdminTablePrice
                    value={formatPrecio(p.precio)}
                    previous={p.precio_antes ? formatPrecio(p.precio_antes) : null}
                    tone="detal"
                  />
                </AdminTableTd>

                <AdminTableTd className="whitespace-nowrap">
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

                <AdminTableTd className="min-w-[8.5rem]">
                  <div className="flex flex-col gap-1.5">
                    <CatalogToggle
                      label="Stock"
                      active={p.disponible}
                      tone="stock"
                      onClick={() => toggleDisponible(p)}
                    />
                    <CatalogToggle
                      label="Detal"
                      active={p.disponible_detal}
                      tone="detal"
                      onClick={() => toggleCatalogo(p, 'disponible_detal')}
                    />
                    <CatalogToggle
                      label="Mayorista"
                      active={p.disponible_mayoreo}
                      tone="mayoreo"
                      onClick={() => toggleCatalogo(p, 'disponible_mayoreo')}
                    />
                  </div>
                </AdminTableTd>

                <AdminTableTd className="whitespace-nowrap">
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
      )}
    </div>

    <div className="mobile-admin-page px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:hidden">
      <p className="mb-4 text-[12px] font-light text-[var(--text-muted)]">
        Administra el catálogo de la tienda
      </p>

      <MobileAdminToolbar
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

      <p className="mb-3 text-[11px] text-[var(--text-subtle)]">
        {totalCount} producto{totalCount !== 1 ? 's' : ''}
        {search ? ` · "${search}"` : ''}
        {filtroDisponible !== 'todos' ? ` · ${filtroLabels[filtroDisponible]}` : ''}
      </p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-[2px] bg-[var(--bg-card)]" />
          ))}
        </div>
      ) : loadError ? (
        <AdminLoadError
          onRetry={fetchProductos}
          title="No se pudieron cargar los productos"
        />
      ) : totalCount === 0 ? (
        <MobileEmptyState
          icon={Package}
          title={
            search
              ? 'No se encontraron productos'
              : filtroDisponible !== 'todos'
                ? `No hay productos ${filtroLabels[filtroDisponible].toLowerCase()}`
                : 'Aún no hay productos'
          }
          description={
            search || filtroDisponible !== 'todos'
              ? 'Prueba con otros filtros'
              : 'Crea el primer producto para empezar'
          }
          action={
            !search && filtroDisponible === 'todos' ? (
              <Button onClick={abrirCrear} size="sm">
                <Plus size={13} />
                Crear producto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {productosPaginados.map(p => (
            <MobileProductCard
              key={p.id}
              producto={p}
              formatPrecio={formatPrecio}
              parentCategoria={getCategoriaPadre(p.categoria?.id)}
              onEdit={() => abrirEditar(p)}
              onDelete={() => {
                setSelected(p)
                setDeleteModal(true)
              }}
              onToggleDisponible={() => toggleDisponible(p)}
            />
          ))}
        </div>
      )}

      <AdminTablePagination
        page={currentPage}
        pageSize={ADMIN_TABLE_PAGE_SIZE}
        totalItems={totalCount}
        onPageChange={setPage}
        compact
      />

      <button
        type="button"
        onClick={abrirCrear}
        className="mobile-admin-fab fixed z-40 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(201,168,76,0.45)] bg-[var(--gold-bright)] text-[var(--bg-base)] shadow-lg md:hidden"
        aria-label="Nuevo producto"
      >
        <Plus size={22} strokeWidth={1.75} />
      </button>
    </div>

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
    </>
  )
}

type CatalogToggleTone = 'stock' | 'detal' | 'mayoreo'

const CATALOG_TOGGLE_STYLES: Record<CatalogToggleTone, string> = {
  stock:
    'border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.1)] text-[var(--gold-bright)] shadow-[0_0_0_1px_rgba(201,168,76,0.06),inset_0_1px_0_rgba(201,168,76,0.12)]',
  detal:
    'border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.1)] text-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.06),inset_0_1px_0_rgba(52,211,153,0.12)]',
  mayoreo:
    'border-[rgba(96,165,250,0.35)] bg-[rgba(96,165,250,0.1)] text-blue-400 shadow-[0_0_0_1px_rgba(96,165,250,0.06),inset_0_1px_0_rgba(96,165,250,0.12)]',
}

function CatalogToggle({
  label,
  active,
  tone,
  onClick,
}: {
  label: string
  active: boolean
  tone: CatalogToggleTone
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={
        active
          ? `Disponible en ${label.toLowerCase()} — click para marcar agotado`
          : `Agotado en ${label.toLowerCase()} — click para habilitar venta`
      }
      aria-pressed={active}
      className={`inline-flex w-[5rem] items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-light uppercase tracking-[1.2px] transition-all duration-200 ${
        active
          ? CATALOG_TOGGLE_STYLES[tone]
          : 'border-[var(--border-subtle)] bg-transparent text-[var(--text-faint)] hover:border-[rgba(248,246,241,0.18)] hover:text-[var(--text-muted)]'
      }`}
    >
      {label}
    </button>
  )
}
