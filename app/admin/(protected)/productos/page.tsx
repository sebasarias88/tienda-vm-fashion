'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Producto } from '@/types'
import { TableRowSkeleton } from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import ProductForm from '@/components/admin/ProductForm'
import toast from 'react-hot-toast'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ImageIcon,
  CheckCircle2,
  XCircle,
  Star,
  Package,
  X,
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
      p.sku?.toLowerCase().includes(search.toLowerCase())
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-light uppercase tracking-[3px] text-[rgba(184,146,42,0.82)]">
            Gestión
          </p>
          <h1 className="text-3xl font-thin uppercase tracking-[2px] text-[#1A1A1A]">Productos</h1>
          <p className="mt-2 text-[12px] font-light text-[rgba(240,235,228,0.65)]">
            Administra el catálogo de la tienda
          </p>
        </div>
        <Button onClick={abrirCrear} size="sm">
          <Plus size={13} />
          Nuevo producto
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 rounded-[2px] border border-[rgba(184,146,42,0.26)] bg-[#111111] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[2px] border border-[rgba(184,146,42,0.3)] bg-[var(--bg-card)] px-3 py-2.5">
            <Search size={15} className="shrink-0 text-[rgba(240,235,228,0.65)]" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
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
            {(['todos', 'disponible', 'agotado'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltroDisponible(f)}
                className={`rounded-[2px] border px-4 py-2.5 text-[11px] font-light uppercase tracking-[1.5px] transition-all ${
                  filtroDisponible === f
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
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
          {search && ` para "${search}"`}
        </p>
        {filtroDisponible !== 'todos' && (
          <span className="text-[11px] font-light text-[rgba(184,146,42,0.92)]">
            Filtro: {filtroLabels[filtroDisponible]}
          </span>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-[2px] border border-[rgba(184,146,42,0.26)] bg-[#111111]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-[rgba(184,146,42,0.22)] bg-[rgba(184,146,42,0.25)]">
                {['Imagen', 'Producto', 'Categoría', 'Precio', 'Estado', 'Destacado', 'Acciones'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3.5 text-left text-[10px] font-light uppercase tracking-[1.5px] text-[rgba(240,235,228,0.72)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(184,146,42,0.14)]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[2px] bg-[rgba(184,146,42,0.14)]">
                        <Package size={22} className="text-[rgba(184,146,42,0.5)]" />
                      </div>
                      <p className="text-[14px] font-light text-[rgba(240,235,228,0.88)]">
                        {search
                          ? 'No se encontraron productos con esa búsqueda'
                          : filtroDisponible !== 'todos'
                            ? `No hay productos ${filtroLabels[filtroDisponible].toLowerCase()}`
                            : 'Aún no hay productos en el catálogo'}
                      </p>
                      <p className="mt-1 text-[12px] font-light text-[rgba(240,235,228,0.6)]">
                        {search || filtroDisponible !== 'todos'
                          ? 'Prueba con otros filtros o términos de búsqueda'
                          : 'Crea el primer producto para empezar a vender'}
                      </p>
                      {!search && filtroDisponible === 'todos' && (
                        <Button onClick={abrirCrear} size="sm" className="mt-5">
                          <Plus size={13} />
                          Crear producto
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {productosFiltrados.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="transition-colors hover:bg-[rgba(184,146,42,0.25)]"
                    >
                      <td className="px-4 py-3.5">
                        {p.imagenes?.[0] ? (
                          <img
                            src={p.imagenes[0]}
                            alt={p.nombre}
                            className="h-11 w-11 rounded-[2px] border border-[rgba(184,146,42,0.3)] object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-[2px] border border-[rgba(184,146,42,0.22)] bg-[#141414]">
                            <ImageIcon size={14} className="text-[rgba(184,146,42,0.42)]" />
                          </div>
                        )}
                      </td>

                      <td className="max-w-[220px] px-4 py-3.5">
                        <p className="truncate text-[13px] font-light text-[#1A1A1A]" title={p.nombre}>
                          {p.nombre}
                        </p>
                        {p.sku && (
                          <p className="mt-0.5 truncate text-[11px] font-light text-[rgba(240,235,228,0.65)]">
                            SKU: {p.sku}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {p.categoria ? (
                          <span className="inline-block max-w-[140px] truncate rounded-[2px] bg-[rgba(184,146,42,0.18)] px-2.5 py-1 text-[10px] font-light uppercase tracking-[1px] text-[rgba(184,146,42,0.92)]">
                            {p.categoria.nombre}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[rgba(240,235,228,0.52)]">Sin categoría</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="text-[13px] font-light text-[#B8922A]">{formatPrecio(p.precio)}</p>
                        {p.precio_antes && (
                          <p className="text-[11px] font-light text-[rgba(240,235,228,0.58)] line-through">
                            {formatPrecio(p.precio_antes)}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => toggleDisponible(p)}
                          className={`inline-flex items-center gap-1.5 rounded-[2px] border px-2.5 py-1.5 transition-all ${
                            p.disponible
                              ? 'border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.08)] hover:bg-[rgba(74,222,128,0.12)]'
                              : 'border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.08)] hover:bg-[rgba(248,113,113,0.12)]'
                          }`}
                          title={p.disponible ? 'Marcar como agotado' : 'Marcar como disponible'}
                        >
                          {p.disponible ? (
                            <>
                              <CheckCircle2 size={13} className="text-emerald-400" />
                              <span className="text-[10px] font-light uppercase tracking-[1px] text-emerald-400">
                                Disponible
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle size={13} className="text-red-400" />
                              <span className="text-[10px] font-light uppercase tracking-[1px] text-red-400">
                                Agotado
                              </span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3.5">
                        {p.destacado ? (
                          <span className="inline-flex items-center gap-1 rounded-[2px] bg-[rgba(184,146,42,0.22)] px-2 py-1">
                            <Star size={12} className="fill-[#B8922A] text-[#B8922A]" />
                            <span className="text-[9px] font-light uppercase tracking-[1px] text-[#B8922A]">
                              Sí
                            </span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-light text-[rgba(240,235,228,0.45)]">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => abrirEditar(p)}
                            className="rounded-[2px] p-2 text-[rgba(240,235,228,0.72)] transition-all hover:bg-[rgba(184,146,42,0.22)] hover:text-[#B8922A]"
                            aria-label="Editar producto"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(p)
                              setDeleteModal(true)
                            }}
                            className="rounded-[2px] p-2 text-[rgba(240,235,228,0.72)] transition-all hover:bg-[rgba(248,113,113,0.1)] hover:text-red-400"
                            aria-label="Eliminar producto"
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
        open={formModal}
        onClose={() => setFormModal(false)}
        title={selected ? 'Editar producto' : 'Nuevo producto'}
        size="lg"
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
          <p className="text-[13px] font-light leading-relaxed text-[rgba(240,235,228,0.88)]">
            ¿Estás seguro de eliminar <span className="text-[#1A1A1A]">{selected?.nombre}</span>? También se
            eliminarán todas sus imágenes. Esta acción no se puede deshacer.
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
