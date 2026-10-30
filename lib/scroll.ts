'use client'

type LenisLike = {
  scrollTo: (
    target: number,
    options?: { immediate?: boolean; force?: boolean },
  ) => void
}

function getLenis(): LenisLike | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as Window & { __lenis?: LenisLike }).__lenis
}

/**
 * Sends the page to the top. The site uses Lenis smooth scrolling, which keeps
 * its own scroll target: a plain window.scrollTo can be undone by Lenis while
 * it is still animating, leaving the new page or step stuck at the bottom.
 * So both Lenis and the window are moved, instantly by default.
 */
export function scrollPageToTop({ smooth = false }: { smooth?: boolean } = {}) {
  if (typeof window === 'undefined') return
  const lenis = getLenis()

  if (smooth && lenis) {
    lenis.scrollTo(0, { force: true })
    return
  }

  lenis?.scrollTo(0, { immediate: true, force: true })
  window.scrollTo({ top: 0, left: 0, behavior: smooth ? 'smooth' : 'instant' })
}
