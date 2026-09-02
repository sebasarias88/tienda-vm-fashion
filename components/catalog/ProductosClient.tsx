'use client'

import { useState, useMemo, useEffect, useRef, useTransition, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useGuardedRouter } from '@/lib/useGuardedRouter'
import { Producto, Categoria } from '@/types'
import ProductCard from '@/components/catalog/ProductCard'
import ProductCardMobile from '@/components/catalog/mobile/ProductCardMobile'
import { ProductGridMobile } from '@/components/catalog/mobile/ResponsiveProductCard'
import MobileCatalogToolbar from '@/components/catalog/mobile/MobileCatalogToolbar'
import MobileFiltersDrawer from '@/components/catalog/mobile/MobileFiltersDrawer'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { type CatalogType } from '@/lib/catalog'
import { CATALOG_PAGE_SIZE, type CatalogOrden } from '@/lib/catalog-productos'
import { getPaginationChunk } from '@/lib/pagination'
import { Search, X, Package, ChevronLeft, ChevronRight, Tag, Loader2 } from 'lucide-react'
import PageGoldAccent from '@/components/catalog/PageGoldAccent'
import CatalogCategoryMenu from '@/components/catalog/CatalogCategoryMenu'
import CatalogFilterSelect, {
  CatalogFilterOption,
} from '@/components/catalog/CatalogFilterSelect'
import { signalCatalogNavigating } from '@/components/catalog/NavigationProgress'

type Props = {
  productos: Producto[]
  totalCount: number
  marcasDisponibles: string[]
  categorias: Categoria[]
  initialQ: string
  initialCategoria: string
  initialMarca?: string
  initialPage?: number
  initialOrden?: CatalogOrden
  catalogType?: CatalogType
}

type Orden = CatalogOrden

function buildCatalogHref(
  pathname: string,
  opts: {
    q: string
    categoria: string
    marcas: string[]
    page: number
    orden: Orden
  },
): string {
  const params = new URLSearchParams()
  if (opts.q) params.set('q', opts.q)
  if (opts.categoria) params.set('categoria', opts.categoria)
  if (opts.marcas.length > 0) params.set('marca', opts.marcas.join(','))
  if (opts.orden !== 'relevancia') params.set('orden', opts.orden)
  if (opts.page > 1) params.set('page', String(opts.page))
  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}

export default function ProductosClient({
  productos,
  totalCount,
  marcasDisponibles,
  categorias,
  initialQ,
  initialCategoria,
  initialMarca = '',
  initialPage = 1,
  initialOrden = 'relevancia',
  catalogType = 'detal',
}: Props) {
  const router = useGuardedRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState(initialQ)
  const [inputValue, setInputValue] = useState(initialQ)
  const [categoriaActiva, setCategoriaActiva] = useState(initialCategoria)
  const [marcasActivas, setMarcasActivas] = useState<string[]>(() =>
    initialMarca
      ? initialMarca.split(',').map(m => m.trim()).filter(Boolean)
      : [],
  )
  const [orden, setOrden] = useState<Orden>(initialOrden)
  const [ordenOpen, setOrdenOpen] = useState(false)
  const [marcaOpen, setMarcaOpen] = useState(false)
  const [pagina, setPagina] = useState(initialPage)
  const [mounted, setMounted] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filtroPendiente, setFiltroPendiente] = useState(false)
  const skipUrlSync = useRef(false)

  const navigateCatalog = useCallback(
    (next: {
      q?: string
      categoria?: string
      marcas?: string[]
      page?: number
      orden?: Orden
    }, options?: { fromUrl?: boolean }) => {
      const q = next.q ?? query
      const categoria = next.categoria ?? categoriaActiva
      const marcas = next.marcas ?? marcasActivas
      const page = next.page ?? 1
      const nextOrden = next.orden ?? orden

      if (!options?.fromUrl) {
        signalCatalogNavigating()
        setFiltroPendiente(true)
      }

      startTransition(() => {
        setQuery(q)
        setInputValue(q)
        setCategoriaActiva(categoria)
        setMarcasActivas(marcas)
        setOrden(nextOrden)
        setPagina(page)
        skipUrlSync.current = true
        const href = buildCatalogHref(pathname, {
          q,
          categoria,
          marcas,
          page,
          orden: nextOrden,
        })
        router.replace(href, { scroll: false })
      })
    },
    [query, categoriaActiva, marcasActivas, orden, pathname, router],
  )

  const aplicarCategoria = useCallback(
    (slug: string, options?: { fromUrl?: boolean }) => {
      navigateCatalog({ categoria: slug, page: 1 }, options)
    },
    [navigateCatalog],
  )

  // Soft nav (Link a ?categoria=…) reutiliza el cliente: sincronizar props → estado
  useEffect(() => {
    skipUrlSync.current = true
    setCategoriaActiva(initialCategoria)
    setFiltroPendiente(false)
  }, [initialCategoria])

  useEffect(() => {
    setQuery(initialQ)
    setInputValue(initialQ)
  }, [initialQ])

  useEffect(() => {
    skipUrlSync.current = true
    setMarcasActivas(
      initialMarca
        ? initialMarca.split(',').map(m => m.trim()).filter(Boolean)
        : [],
    )
  }, [initialMarca])

  useEffect(() => {
    setPagina(initialPage)
    setFiltroPendiente(false)
  }, [initialPage, productos])

  useEffect(() => {
    setOrden(initialOrden)
  }, [initialOrden])

  useEffect(() => {
    const onCategoria = (e: Event) => {
      const slug = (e as CustomEvent<{ slug: string }>).detail?.slug
      if (typeof slug !== 'string') return
      aplicarCategoria(slug)
    }
    window.addEventListener('vm:catalog-categoria', onCategoria)
    return () => window.removeEventListener('vm:catalog-categoria', onCategoria)
  }, [aplicarCategoria])

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
  }, [])

  useEffect(() => {
    if (!filtroPendiente || isPending) return
    const t = setTimeout(() => setFiltroPendiente(false), 180)
    return () => clearTimeout(t)
  }, [filtroPendiente, isPending, categoriaActiva, productos])

  const paginaPrevia = useRef(pagina)
  useEffect(() => {
    if (paginaPrevia.current === pagina) return
    paginaPrevia.current = pagina

    const id = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(id)
  }, [pagina])

  const mostrarCarga = !mounted || isPending || filtroPendiente

  const totalPaginas = Math.max(1, Math.ceil(totalCount / CATALOG_PAGE_SIZE))
  const paginaActual = Math.min(Math.max(1, pagina), totalPaginas)
  const paginasVisibles = useMemo(
    () => getPaginationChunk(paginaActual, totalPaginas, 5),
    [paginaActual, totalPaginas],
  )
  const productosPagina = productos

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigateCatalog({ q: inputValue.trim(), page: 1 })
  }

  const limpiarFiltros = () => {
    navigateCatalog({
      q: '',
      categoria: '',
      marcas: [],
      orden: 'relevancia',
      page: 1,
    })
  }

  const toggleMarca = (marca: string) => {
    const next = marcasActivas.includes(marca)
      ? marcasActivas.filter(m => m !== marca)
      : [...marcasActivas, marca]
    navigateCatalog({ marcas: next, page: 1 })
  }

  const marcaValueLabel =
    marcasActivas.length === 0
      ? 'Marcas'
      : marcasActivas.length === 1
        ? marcasActivas[0]
        : `${marcasActivas.length} marcas`

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

  const ordenLabels: Record<Orden, string> = {
    relevancia: 'Destacados',
    'precio-asc': 'Menor precio',
    'precio-desc': 'Mayor precio',
    nombre: 'Nombre A-Z',
  }

  const activeFiltersCount =
    (categoriaActiva ? 1 : 0) +
    (marcasActivas.length > 0 ? 1 : 0) +
    (orden !== 'relevancia' ? 1 : 0)

  const hayFiltros = Boolean(
    query || categoriaActiva || marcasActivas.length > 0 || orden !== 'relevancia',
  )
  const catalogoVacio = totalCount === 0 && !hayFiltros
  const sinResultados = totalCount === 0 && hayFiltros

  return (
    <div className="mobile-catalog-page relative min-h-screen max-md:pb-20 max-md:pt-[6.5rem] pt-28 sm:pt-32">
      <PageGoldAccent />
      <div className="relative z-10 max-w-7xl mx-auto px-4 max-md:px-4 sm:px-6 lg:px-8">

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 md:hidden"
        >
          <div className="mb-5">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-px w-6 bg-[var(--gold)]" />
              <span className="catalog-eyebrow text-[10px] tracking-[2.5px]">Explorar</span>
            </div>
            <h1 className="text-[1.625rem] font-thin uppercase leading-tight tracking-[1px]">
              <span className="gold-shimmer">{categoriaNombre || 'Catálogo'}</span>
            </h1>
          </div>

          <MobileCatalogToolbar
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSearch={() => navigateCatalog({ q: inputValue.trim(), page: 1 })}
            onClearSearch={() => navigateCatalog({ q: '', page: 1 })}
            onOpenFilters={() => setFiltersOpen(true)}
            activeFiltersCount={activeFiltersCount}
          />

          {(categoriaActiva || marcasActivas.length > 0) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {categoriaActiva && categoriaNombre && (
                <span className="inline-flex max-w-full items-center gap-2 border border-[color-mix(in_srgb,var(--gold)_35%,var(--border))] bg-[var(--gold-muted)] px-3 py-1.5 text-[11px] font-light text-[var(--gold)]">
                  <span className="truncate">{categoriaNombre}</span>
                  <button
                    type="button"
                    onClick={() => aplicarCategoria('')}
                    aria-label="Quitar categoría"
                    className="shrink-0 rounded-sm p-0.5 hover:bg-[color-mix(in_srgb,var(--gold)_15%,transparent)]"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {marcasActivas.map(marca => (
                <button
                  key={marca}
                  type="button"
                  onClick={() => toggleMarca(marca)}
                  className="inline-flex items-center gap-1.5 border border-[color-mix(in_srgb,var(--gold)_35%,var(--border))] bg-[var(--gold-muted)] px-3 py-1.5 text-[11px] font-light text-[var(--gold)]"
                >
                  <Tag size={10} />
                  {marca}
                  <X size={12} />
                </button>
              ))}
            </div>
          )}

          <MobileFiltersDrawer
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            categorias={categorias}
            categoriaActiva={categoriaActiva}
            onCategoriaChange={aplicarCategoria}
            marcas={marcasDisponibles}
            marcasActivas={marcasActivas}
            onMarcasChange={next => navigateCatalog({ marcas: next, page: 1 })}
            orden={orden}
            onOrdenChange={next => navigateCatalog({ orden: next, page: 1 })}
            onLimpiar={limpiarFiltros}
            resultCount={totalCount}
          />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 hidden overflow-visible md:block"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 bg-[radial-gradient(circle,var(--glow-gold)_0%,transparent_70%)]" />

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
                    {totalCount} producto{totalCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-30 mb-2 overflow-visible">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-5">
              <form onSubmit={handleSearch} className="relative min-w-0 flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
                />
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Buscar por nombre, SKU o marca…"
                  className="w-full border-0 border-b-2 border-[var(--border-input)] bg-transparent py-3.5 pl-7 pr-24 text-sm font-normal text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--placeholder)] focus:border-[var(--gold)]"
                />
                <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  {inputValue && (
                    <button
                      type="button"
                      onClick={() => navigateCatalog({ q: '', page: 1 })}
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

              <div className="flex flex-wrap items-end gap-4 sm:gap-5 lg:shrink-0">
                <CatalogCategoryMenu
                  categorias={categorias}
                  categoriaActiva={categoriaActiva}
                  onChange={aplicarCategoria}
                />

                {marcasDisponibles.length > 0 && (
                  <CatalogFilterSelect
                    label="Marca"
                    valueLabel={marcaValueLabel}
                    open={marcaOpen}
                    onOpenChange={setMarcaOpen}
                    active={marcasActivas.length > 0}
                    align="right"
                    panelClassName="w-56"
                  >
                    <CatalogFilterOption
                      active={marcasActivas.length === 0}
                      onClick={() => navigateCatalog({ marcas: [], page: 1 })}
                    >
                      Todas las marcas
                    </CatalogFilterOption>
                    {marcasDisponibles.map(marca => (
                      <CatalogFilterOption
                        key={marca}
                        active={marcasActivas.includes(marca)}
                        onClick={() => toggleMarca(marca)}
                      >
                        {marca}
                      </CatalogFilterOption>
                    ))}
                  </CatalogFilterSelect>
                )}

                <CatalogFilterSelect
                  label="Ordenar"
                  valueLabel={ordenLabels[orden]}
                  open={ordenOpen}
                  onOpenChange={setOrdenOpen}
                  active={orden !== 'relevancia'}
                  align="right"
                  panelClassName="w-56"
                >
                  {(Object.keys(ordenLabels) as Orden[]).map(key => (
                    <CatalogFilterOption
                      key={key}
                      active={orden === key}
                      onClick={() => {
                        setOrdenOpen(false)
                        navigateCatalog({ orden: key, page: 1 })
                      }}
                    >
                      {ordenLabels[key]}
                    </CatalogFilterOption>
                  ))}
                </CatalogFilterSelect>
              </div>
            </div>
          </div>

        </motion.section>

        <div className="mt-2 min-w-0 lg:mt-4">
            {(categoriaActiva || marcasActivas.length > 0 || mostrarCarga) && (
              <div className="mb-4 hidden items-center gap-3 md:flex">
                <span className="text-[10px] font-light uppercase tracking-[1.5px] text-[var(--text-subtle)]">
                  {mostrarCarga ? 'Actualizando catálogo' : 'Filtrado por'}
                </span>
                {mostrarCarga && (
                  <Loader2 size={14} className="animate-spin text-[var(--gold)]" />
                )}
                {!mostrarCarga && categoriaActiva && categoriaNombre && (
                  <button
                    type="button"
                    onClick={() => aplicarCategoria('')}
                    className="inline-flex items-center gap-2 border border-[color-mix(in_srgb,var(--gold)_35%,var(--border))] bg-[var(--gold-muted)] px-3 py-1.5 text-[11px] font-light text-[var(--gold)] transition-colors hover:border-[var(--gold)]"
                  >
                    {categoriaNombre}
                    <X size={12} />
                  </button>
                )}
                {marcasActivas.map(marca => (
                  <button
                    key={marca}
                    type="button"
                    onClick={() => toggleMarca(marca)}
                    className="inline-flex items-center gap-1.5 border border-[color-mix(in_srgb,var(--gold)_35%,var(--border))] bg-[var(--gold-muted)] px-3 py-1.5 text-[11px] font-light text-[var(--gold)] transition-colors hover:border-[var(--gold)]"
                  >
                    <Tag size={10} />
                    {marca}
                    <X size={12} />
                  </button>
                ))}
              </div>
            )}

            {mounted && (
              <div className="mb-3 flex items-center justify-between gap-3 md:hidden">
                <p className="text-[11px] font-light uppercase tracking-[1.5px] text-[var(--text-subtle)]">
                  {mostrarCarga && filtroPendiente
                    ? 'Actualizando…'
                    : `${totalCount} producto${totalCount !== 1 ? 's' : ''}`}
                </p>
                {mostrarCarga && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[1.5px] text-[var(--gold)]">
                    <Loader2 size={12} className="animate-spin" />
                    Cargando
                  </span>
                )}
              </div>
            )}

            {mostrarCarga ? (
              <ProductGridMobile>
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </ProductGridMobile>
            ) : productosPagina.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center md:hidden"
              >
                {catalogoVacio ? (
                  <Package size={36} className="text-[var(--text-faint)]" />
                ) : (
                  <Search size={36} className="text-[var(--text-faint)]" />
                )}
                <p className="text-center text-[12px] font-light uppercase tracking-[1px] text-[var(--text-secondary)]">
                  {catalogoVacio
                    ? 'Aún no hay productos disponibles'
                    : 'No se encontraron productos'}
                </p>
                {(hayFiltros || sinResultados) && (
                  <button
                    onClick={limpiarFiltros}
                    className="catalog-gold-cta min-h-[44px] rounded-xl px-5 text-[11px] font-medium uppercase tracking-[1.5px]"
                  >
                    Limpiar filtros
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div layout className="mb-6 md:hidden">
                <ProductGridMobile>
                  <AnimatePresence mode="popLayout">
                    {productosPagina.map((producto, i) => (
                      <motion.div
                        key={producto.id}
                        layout
                        className="h-full"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ delay: i * 0.03, duration: 0.25 }}
                      >
                        <ProductCardMobile
                          producto={producto}
                          catalogType={catalogType}
                          priority={i < 2}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </ProductGridMobile>
              </motion.div>
            )}

            {mostrarCarga ? (
              <div className="mb-10 mt-3 hidden grid-cols-2 gap-px sm:grid-cols-3 md:grid lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : productosPagina.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden flex-col items-center justify-center gap-4 px-6 py-20 text-center md:flex"
              >
                {catalogoVacio ? (
                  <Package size={40} className="text-[var(--text-faint)]" />
                ) : (
                  <Search size={40} className="text-[var(--text-faint)]" />
                )}
                <p className="text-sm font-light uppercase tracking-[0.5px] text-[var(--text-secondary)]">
                  {catalogoVacio
                    ? 'Aún no hay productos disponibles'
                    : 'No se encontraron productos'}
                </p>
                {catalogoVacio ? (
                  <p className="max-w-sm text-[12px] font-light text-[var(--text-subtle)]">
                    Vuelve pronto, estamos preparando el catálogo.
                  </p>
                ) : (
                  <button
                    onClick={limpiarFiltros}
                    className="border border-[var(--border)] px-5 py-2.5 text-[11px] font-light uppercase tracking-[1.5px] text-[var(--gold)] transition-all hover:bg-[var(--gold-muted)]"
                  >
                    Limpiar filtros
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                layout
                className="mb-10 mt-3 hidden grid-cols-2 gap-px sm:grid-cols-3 md:grid lg:grid-cols-4"
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
                      <ProductCard
                        producto={producto}
                        catalogType={catalogType}
                        priority={i < 4}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {totalPaginas > 1 && totalCount > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-1.5 pb-2 pt-2 max-md:px-1 sm:gap-2 md:pb-12"
              >
                <button
                  type="button"
                  onClick={() => navigateCatalog({ page: Math.max(1, paginaActual - 1) })}
                  disabled={paginaActual === 1}
                  aria-label="Página anterior"
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border-input)] px-3 text-[11px] font-light uppercase tracking-[1.5px] text-[var(--text-secondary)] transition-all hover:border-[var(--border)] hover:text-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-35 md:rounded-[2px] md:px-4"
                >
                  <ChevronLeft size={14} className="md:hidden" />
                  <span className="hidden sm:inline">← Anterior</span>
                  <span className="sm:hidden">Ant</span>
                </button>

                <div className="flex items-center gap-1" role="list">
                  {paginasVisibles.map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => navigateCatalog({ page: num })}
                      aria-label={`Ir a página ${num}`}
                      aria-current={paginaActual === num ? 'page' : undefined}
                      className={`h-10 min-w-10 rounded-xl border text-[13px] font-light tabular-nums transition-all md:rounded-[2px] ${
                        paginaActual === num
                          ? 'border-[var(--border)] bg-[var(--gold-muted)] text-[var(--gold)]'
                          : 'border-[var(--border-input)] text-[var(--text-secondary)] hover:border-[var(--border)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigateCatalog({ page: Math.min(totalPaginas, paginaActual + 1) })
                  }
                  disabled={paginaActual === totalPaginas}
                  aria-label="Página siguiente"
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border-input)] px-3 text-[11px] font-light uppercase tracking-[1.5px] text-[var(--text-secondary)] transition-all hover:border-[var(--border)] hover:text-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-35 md:rounded-[2px] md:px-4"
                >
                  <span className="hidden sm:inline">Siguiente →</span>
                  <span className="sm:hidden">Sig</span>
                  <ChevronRight size={14} className="md:hidden" />
                </button>
              </motion.div>
            )}
        </div>

      </div>
    </div>
  )
}
