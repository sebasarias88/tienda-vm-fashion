'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { Producto, Categoria } from '@/types'
import ProductCard from '@/components/catalog/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { getPrecioOrden, type CatalogType } from '@/lib/catalog'
import { Search, X, ChevronDown, Check, Package } from 'lucide-react'
import PageGoldAccent from '@/components/catalog/PageGoldAccent'

type Props = {
  productos: Producto[]
  categorias: Categoria[]
  initialQ: string
  initialCategoria: string
  catalogType?: CatalogType
}

type Orden = 'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre'

const ITEMS_POR_PAGINA = 24

function productoCoincideCategoria(
  producto: Producto,
  categoriaActiva: string,
  categoriasRaiz: Categoria[],
): boolean {
  const cat = producto.categoria
  if (!cat) return false

  const raiz = categoriasRaiz.find(r => r.slug === categoriaActiva)
  if (raiz) {
    return cat.slug === raiz.slug || cat.padre_id === raiz.id
  }

  return cat.slug === categoriaActiva
}

export default function ProductosClient({
  productos,
  categorias,
  initialQ,
  initialCategoria,
  catalogType = 'detal',
}: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const [query, setQuery] = useState(initialQ)
  const [inputValue, setInputValue] = useState(initialQ)
  const [categoriaActiva, setCategoriaActiva] = useState(initialCategoria)
  const [orden, setOrden] = useState<Orden>('relevancia')
  const [ordenOpen, setOrdenOpen] = useState(false)
  const [pagina, setPagina] = useState(1)
  const [mounted, setMounted] = useState(false)
  const ordenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
  }, [])

  useEffect(() => {
    if (!ordenOpen) return
    const handleClick = (e: MouseEvent) => {
      if (ordenRef.current && !ordenRef.current.contains(e.target as Node)) {
        setOrdenOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [ordenOpen])

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (categoriaActiva) params.set('categoria', categoriaActiva)
    const search = params.toString()
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
    setPagina(1)
  }, [query, categoriaActiva])

  const productosFiltrados = useMemo(() => {
    let result = [...productos]

    // Filtro búsqueda
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.categoria?.nombre.toLowerCase().includes(q)
      )
    }

    // Filtro categoría (raíz incluye subcategorías; subcategoría solo esa)
    if (categoriaActiva) {
      result = result.filter(p =>
        productoCoincideCategoria(p, categoriaActiva, categorias),
      )
    }

    // Orden
    switch (orden) {
      case 'precio-asc':
        result.sort((a, b) => getPrecioOrden(a, catalogType) - getPrecioOrden(b, catalogType))
        break
      case 'precio-desc':
        result.sort((a, b) => getPrecioOrden(b, catalogType) - getPrecioOrden(a, catalogType))
        break
      case 'nombre':
        result.sort((a, b) => a.nombre.localeCompare(b.nombre))
        break
    }

    return result
  }, [productos, query, categoriaActiva, orden, catalogType, categorias])

  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA)
  const productosPagina = productosFiltrados.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(inputValue)
  }

  const limpiarFiltros = () => {
    setQuery('')
    setInputValue('')
    setCategoriaActiva('')
    setOrden('relevancia')
    setPagina(1)
  }

  const categoriaNombre = useMemo(() => {
    if (!categoriaActiva) return undefined
    const raiz = categorias.find(r => r.slug === categoriaActiva)
    if (raiz) return raiz.nombre
    for (const r of categorias) {
      const sub = r.subcategorias?.find(s => s.slug === categoriaActiva)
      if (sub) return sub.nombre
    }
    return undefined
  }, [categorias, categoriaActiva])

  const raizSeleccionada = useMemo(() => {
    const raizDirecta = categorias.find(r => r.slug === categoriaActiva)
    if (raizDirecta) return raizDirecta
    for (const r of categorias) {
      if (r.subcategorias?.some(s => s.slug === categoriaActiva)) return r
    }
    return null
  }, [categorias, categoriaActiva])

  const subcategoriasVisibles = useMemo(() => {
    if (!raizSeleccionada?.subcategorias?.length) return []
    return [...raizSeleccionada.subcategorias]
      .filter(s => s.activa)
      .sort((a, b) => a.orden - b.orden)
  }, [raizSeleccionada])

  const ordenLabels: Record<Orden, string> = {
    relevancia: 'Relevancia',
    'precio-asc': 'Menor precio',
    'precio-desc': 'Mayor precio',
    nombre: 'Nombre A-Z',
  }

  return (
    <div className={`relative min-h-screen ${catalogType === 'mayoreo' ? 'pt-28 sm:pt-32' : 'pt-20 sm:pt-24'}`}>
      <PageGoldAccent />
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* ── Header + filtros ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-visible"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 bg-[radial-gradient(circle,var(--glow-gold)_0%,transparent_70%)]" />

          {/* Título */}
          <div className="relative pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px w-8 bg-[var(--gold)]" />
                  <span className="catalog-eyebrow tracking-[3px]">
                    Explorar
                  </span>
                </div>
                <h1 className="text-[2rem] font-thin uppercase tracking-[1.5px] sm:text-4xl">
                  <span className="gold-shimmer">{categoriaNombre || 'Catálogo'}</span>
                </h1>
                <p className="mt-2 max-w-lg text-[13px] catalog-lead leading-relaxed">
                  {categoriaNombre
                    ? `Explora nuestra selección de ${categoriaNombre.toLowerCase()}`
                    : 'Encuentra productos de belleza y cuidado capilar'}
                </p>
              </div>

              {mounted && (
                <div className="flex shrink-0 items-center gap-2.5 self-start sm:self-auto">
                  <Package size={15} className="text-[var(--gold-subtle)]" />
                  <span className="text-[12px] font-light uppercase tracking-[1.5px] text-[var(--text-secondary)]">
                    {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Búsqueda + controles */}
          <div className="relative z-30 mb-5 overflow-visible">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
              <form onSubmit={handleSearch} className="relative min-w-0 flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
                />
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Buscar por nombre, SKU o categoría…"
                  className="w-full border-0 border-b-2 border-[var(--border-input)] bg-transparent py-3.5 pl-7 pr-24 text-sm font-normal text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--placeholder)] focus:border-[var(--gold)]"
                />
                <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  {inputValue && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputValue('')
                        setQuery('')
                      }}
                      className="rounded-[2px] p-1.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                      aria-label="Limpiar búsqueda"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="rounded-[2px] px-3 py-1.5 text-[10px] font-light uppercase tracking-[1.5px] text-[var(--gold)] transition-colors hover:text-[var(--gold-bright)]"
                  >
                    Buscar
                  </button>
                </div>
              </form>

              <div ref={ordenRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setOrdenOpen(!ordenOpen)}
                    className="flex items-center gap-2 px-1 py-1 text-[11px] font-light uppercase tracking-[1.2px] text-[var(--text-secondary)] transition-all hover:text-[var(--text-primary)]"
                  >
                    {ordenLabels[orden]}
                    <ChevronDown
                      size={13}
                      className={`text-[var(--gold-subtle)] transition-transform ${ordenOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {ordenOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute right-0 top-full z-[100] mt-2 w-52 overflow-hidden rounded-[2px] border border-[var(--border)] bg-[var(--bg-card)] py-1 shadow-[var(--shadow-dropdown)]"
                      >
                        {(Object.keys(ordenLabels) as Orden[]).map(key => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setOrden(key)
                              setOrdenOpen(false)
                            }}
                            className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] font-light transition-colors ${
                              orden === key
                                ? 'bg-[var(--gold-muted)] text-[var(--gold)]'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            {ordenLabels[key]}
                            {orden === key && <Check size={13} className="text-[var(--gold)]" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
            </div>
          </div>

          {/* Categorías — raíz + subcategorías */}
          <div className="relative border-b border-[var(--border-subtle)]">
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[var(--bg-base)] to-transparent" />

            <div className="flex gap-0 overflow-x-auto scrollbar-hide pr-2">
              <button
                type="button"
                onClick={() => setCategoriaActiva('')}
                className={`relative shrink-0 px-4 py-4 text-[11px] font-light uppercase tracking-[1.2px] transition-colors ${
                  !categoriaActiva
                    ? 'text-[var(--gold)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Todos
                {!categoriaActiva && (
                  <motion.span
                    layoutId="cat-tab"
                    className="absolute inset-x-3 bottom-0 h-px bg-[var(--gold)]"
                  />
                )}
              </button>

              {categorias.map(cat => {
                const raizActiva =
                  categoriaActiva === cat.slug ||
                  cat.subcategorias?.some(s => s.slug === categoriaActiva)

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setCategoriaActiva(
                        categoriaActiva === cat.slug ? '' : cat.slug,
                      )
                    }
                    title={cat.nombre}
                    className={`relative max-w-[9.5rem] shrink-0 truncate px-4 py-4 text-[11px] font-light uppercase tracking-[1.2px] transition-colors sm:max-w-none ${
                      raizActiva
                        ? 'text-[var(--gold)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {cat.nombre}
                    {categoriaActiva === cat.slug && (
                      <motion.span
                        layoutId="cat-tab"
                        className="absolute inset-x-3 bottom-0 h-px bg-[var(--gold)]"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <AnimatePresence>
              {subcategoriasVisibles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-t border-[var(--border-subtle)]"
                >
                  <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide px-2 py-3 pl-5 sm:pl-6">
                    {subcategoriasVisibles.map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setCategoriaActiva(sub.slug)}
                        className={`shrink-0 rounded-[2px] border border-dashed px-3 py-1.5 text-[10px] font-light uppercase tracking-[1px] transition-colors ${
                          categoriaActiva === sub.slug
                            ? 'border-[var(--border)] bg-[var(--gold-muted)] text-[var(--gold)]'
                            : 'border-[var(--border-input)] text-[var(--text-muted)] hover:border-[var(--border)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {sub.nombre}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Grid productos */}
        {!mounted ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px mt-3 mb-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : productosPagina.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <Search size={40} className="text-[var(--text-faint)]" />
            <p className="text-sm tracking-[0.5px] uppercase text-[var(--text-secondary)] font-light">
              No se encontraron productos
            </p>
            <button
              onClick={limpiarFiltros}
              className="text-[11px] tracking-[1.5px] uppercase text-[var(--gold)] border border-[var(--border)] px-5 py-2.5 rounded-[2px] hover:bg-[var(--gold-muted)] transition-all font-light"
            >
              Limpiar filtros
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px mt-3 mb-10"
          >
            <AnimatePresence mode="popLayout">
              {productosPagina.map((producto, i) => (
                <motion.div
                  key={producto.id}
                  layout
                  className="h-full"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <ProductCard producto={producto} catalogType={catalogType} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 pb-12 pt-2"
          >
            <button
              onClick={() => { setPagina(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={pagina === 1}
              className="px-4 py-2.5 text-[11px] tracking-[1.5px] uppercase font-light border border-[var(--border-input)] text-[var(--text-secondary)] rounded-[2px] hover:border-[var(--border)] hover:text-[var(--gold)] disabled:opacity-35 disabled:cursor-not-allowed transition-all"
            >
              ← Anterior
            </button>

            {Array.from({ length: totalPaginas }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setPagina(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className={`w-10 h-10 text-[13px] font-light rounded-[2px] border transition-all ${
                  pagina === i + 1
                    ? 'border-[var(--border)] text-[var(--gold)] bg-[var(--gold-muted)]'
                    : 'border-[var(--border-input)] text-[var(--text-secondary)] hover:border-[var(--border)] hover:text-[var(--text-primary)]'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => { setPagina(p => Math.min(totalPaginas, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={pagina === totalPaginas}
              className="px-4 py-2.5 text-[11px] tracking-[1.5px] uppercase font-light border border-[var(--border-input)] text-[var(--text-secondary)] rounded-[2px] hover:border-[var(--border)] hover:text-[var(--gold)] disabled:opacity-35 disabled:cursor-not-allowed transition-all"
            >
              Siguiente →
            </button>
          </motion.div>
        )}

      </div>
    </div>
  )
}