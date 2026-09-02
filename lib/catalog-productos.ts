import type { Categoria, Producto } from '@/types'
import { createSupabasePublic } from '@/lib/supabase-public'
import { withProductoCategorias } from '@/lib/producto-categorias'
import { PRODUCTO_LIST_SELECT, withCardImagenes } from '@/lib/productQueries'
import { withProductoVariacionesFlag } from '@/lib/variaciones'
import { getMarcasDisponibles } from '@/lib/catalog-data'
import { intersectIds, productIdsMatchingSearch } from '@/lib/productSearch'

export const CATALOG_PAGE_SIZE = 24

export type CatalogOrden = 'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre'

export function resolveCategoriaIds(
  slug: string,
  categorias: Categoria[],
): string[] {
  for (const raiz of categorias) {
    if (raiz.slug === slug) {
      return [raiz.id, ...(raiz.subcategorias || []).map(s => s.id)]
    }
    const sub = raiz.subcategorias?.find(s => s.slug === slug)
    if (sub) return [sub.id]
  }
  return []
}

function sanitizeIlike(value: string): string {
  return value.replace(/[%_,.()]/g, ' ').trim()
}

function buildTextSearchOr(q: string, productIdsByCategoria: string[]): string {
  const parts = [
    `nombre.ilike.%${q}%`,
    `sku.ilike.%${q}%`,
    `marca.ilike.%${q}%`,
  ]
  if (productIdsByCategoria.length > 0) {
    parts.push(`id.in.(${productIdsByCategoria.join(',')})`)
  }
  return parts.join(',')
}

async function getProductIdsByCategoriaNombre(
  supabase: ReturnType<typeof createSupabasePublic>,
  q: string,
): Promise<string[]> {
  const { data: matchingCats } = await supabase
    .from('categorias')
    .select('id')
    .ilike('nombre', `%${q}%`)

  if (!matchingCats?.length) return []

  const catIds = matchingCats.map(c => c.id)
  const [{ data: byPrimary }, { data: links }] = await Promise.all([
    supabase.from('productos').select('id').in('categoria_id', catIds),
    supabase.from('producto_categorias').select('producto_id').in('categoria_id', catIds),
  ])

  const ids = new Set<string>()
  ;(byPrimary || []).forEach((r: { id: string }) => ids.add(r.id))
  ;(links || []).forEach((r: { producto_id: string }) => ids.add(r.producto_id))
  return Array.from(ids)
}

/**
 * Listado de catálogo paginado en servidor (lean select, sin variaciones).
 */
export async function getCatalogProductosPage(options: {
  categorias: Categoria[]
  q?: string
  categoriaSlug?: string
  marcas?: string[]
  page?: number
  orden?: CatalogOrden
  /** Para ordenar por precio detal vs mayoreo. */
  catalogType?: 'detal' | 'mayoreo'
}): Promise<{
  productos: Producto[]
  total: number
  marcasDisponibles: string[]
  page: number
  pageSize: number
}> {
  const supabase = createSupabasePublic()
  const pageSize = CATALOG_PAGE_SIZE
  const page = Math.max(1, options.page ?? 1)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const catalogType = options.catalogType ?? 'detal'
  const orden = options.orden ?? 'relevancia'

  const marcasPromise = getMarcasDisponibles()

  let idFilter: string[] | null = null
  if (options.categoriaSlug?.trim()) {
    const catIds = resolveCategoriaIds(options.categoriaSlug.trim(), options.categorias)
    if (catIds.length === 0) {
      const marcasDisponibles = await marcasPromise
      return {
        productos: [],
        total: 0,
        marcasDisponibles,
        page: 1,
        pageSize,
      }
    }

    const [{ data: byPrimary }, { data: links }] = await Promise.all([
      supabase.from('productos').select('id').in('categoria_id', catIds),
      supabase.from('producto_categorias').select('producto_id').in('categoria_id', catIds),
    ])

    const ids = new Set<string>()
    ;(byPrimary || []).forEach((r: { id: string }) => ids.add(r.id))
    ;(links || []).forEach((r: { producto_id: string }) => ids.add(r.producto_id))
    idFilter = Array.from(ids)

    if (idFilter.length === 0) {
      const marcasDisponibles = await marcasPromise
      return {
        productos: [],
        total: 0,
        marcasDisponibles,
        page: 1,
        pageSize,
      }
    }
  }

  const q = sanitizeIlike(options.q || '')
  let productIdsByCategoria: string[] = []
  let useIlikeFallback = false

  if (q) {
    const rpcIds = await productIdsMatchingSearch(supabase, q)
    if (rpcIds !== null) {
      if (idFilter) {
        idFilter = intersectIds(rpcIds, idFilter)
      } else {
        idFilter = rpcIds
      }
    } else {
      useIlikeFallback = true
      productIdsByCategoria = await getProductIdsByCategoriaNombre(supabase, q)
    }
  }

  if (q && idFilter && idFilter.length === 0) {
    const marcasDisponibles = await marcasPromise
    return {
      productos: [],
      total: 0,
      marcasDisponibles,
      page: 1,
      pageSize,
    }
  }

  let query = supabase
    .from('productos')
    .select(PRODUCTO_LIST_SELECT, { count: 'exact' })

  if (idFilter) {
    query = query.in('id', idFilter)
  } else if (q && useIlikeFallback) {
    query = query.or(buildTextSearchOr(q, productIdsByCategoria))
  }

  const marcas = (options.marcas || []).map(m => m.trim()).filter(Boolean)
  if (marcas.length === 1) {
    query = query.eq('marca', marcas[0])
  } else if (marcas.length > 1) {
    query = query.in('marca', marcas)
  }

  const priceCol = catalogType === 'mayoreo' ? 'precio_mayoreo' : 'precio'
  switch (orden) {
    case 'precio-asc':
      query = query.order(priceCol, { ascending: true, nullsFirst: false })
      break
    case 'precio-desc':
      query = query.order(priceCol, { ascending: false, nullsFirst: false })
      break
    case 'nombre':
      query = query.order('nombre', { ascending: true })
      break
    default:
      query = query
        .order('orden', { ascending: true })
        .order('created_at', { ascending: false })
  }

  const [{ data, count, error }, marcasDisponibles] = await Promise.all([
    query.range(from, to),
    marcasPromise,
  ])

  if (error) {
    console.error('[getCatalogProductosPage]', error.message)
    return {
      productos: [],
      total: 0,
      marcasDisponibles,
      page,
      pageSize,
    }
  }

  const total = count ?? 0
  const maxPage = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, maxPage)

  // Si pidieron una página fuera de rango, re-fetch la última válida
  if (safePage !== page && total > 0) {
    const retryFrom = (safePage - 1) * pageSize
    const retryTo = retryFrom + pageSize - 1
    let retry = supabase.from('productos').select(PRODUCTO_LIST_SELECT, { count: 'exact' })
    if (idFilter) retry = retry.in('id', idFilter)
    else if (q && useIlikeFallback) {
      retry = retry.or(buildTextSearchOr(q, productIdsByCategoria))
    }
    if (marcas.length === 1) retry = retry.eq('marca', marcas[0])
    else if (marcas.length > 1) retry = retry.in('marca', marcas)
    switch (orden) {
      case 'precio-asc':
        retry = retry.order(priceCol, { ascending: true, nullsFirst: false })
        break
      case 'precio-desc':
        retry = retry.order(priceCol, { ascending: false, nullsFirst: false })
        break
      case 'nombre':
        retry = retry.order('nombre', { ascending: true })
        break
      default:
        retry = retry.order('orden', { ascending: true }).order('created_at', { ascending: false })
    }
    const { data: retryData } = await retry.range(retryFrom, retryTo)
    return {
      productos: mapListRows(retryData),
      total,
      marcasDisponibles,
      page: safePage,
      pageSize,
    }
  }

  return {
    productos: mapListRows(data),
    total,
    marcasDisponibles,
    page: safePage,
    pageSize,
  }
}

function mapListRows(rows: unknown): Producto[] {
  const raw = (rows ?? []) as Parameters<typeof withProductoVariacionesFlag>[0]
  const flagged = withProductoVariacionesFlag(raw)
  const withCats = withProductoCategorias(flagged as Parameters<typeof withProductoCategorias>[0])
  return withCardImagenes(withCats) as Producto[]
}
