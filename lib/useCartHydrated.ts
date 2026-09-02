'use client'

import { useEffect, useState } from 'react'
import { useCarrito } from '@/lib/store'

/**
 * true cuando Zustand persist terminó de leer localStorage.
 * Evita hydration mismatch del badge del carrito (SSR vs cliente).
 */
export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const store = useCarrito.persist
    if (store.hasHydrated()) {
      setHydrated(true)
      return
    }
    return store.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}
