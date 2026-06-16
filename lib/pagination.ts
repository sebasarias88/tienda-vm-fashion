export const ADMIN_TABLE_PAGE_SIZE = 10

export function getTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0) return 1
  return Math.ceil(totalItems / pageSize)
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function clampPage(page: number, totalItems: number, pageSize: number): number {
  const totalPages = getTotalPages(totalItems, pageSize)
  return Math.min(Math.max(1, page), totalPages)
}

/** Rango de páginas con elipsis para UI de paginación. */
export function getPaginationRange(
  current: number,
  total: number,
): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', total]
  }

  if (current >= total - 3) {
    return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total]
}

export function getPaginationBounds(
  page: number,
  pageSize: number,
  totalItems: number,
): { start: number; end: number } {
  if (totalItems === 0) return { start: 0, end: 0 }
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)
  return { start, end }
}
