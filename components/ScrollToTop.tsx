'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { scrollPageToTop } from '@/lib/scroll'

/**
 * Resetea el scroll al inicio en cada cambio de ruta y desactiva la
 * restauración automática del navegador para que al volver a una página
 * siempre se muestre desde arriba.
 */
export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    scrollPageToTop()
    // Once more after the new page has painted, in case a closing drawer or
    // Lenis moved the scroll back during the transition.
    const id = requestAnimationFrame(() => scrollPageToTop())
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return null
}
