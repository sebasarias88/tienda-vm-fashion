'use client'

import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useCarrito } from '@/lib/store'
import { useCartHydrated } from '@/lib/useCartHydrated'
import { decodeCart } from '@/lib/cartShare'
import { getLineKey, itemLineKey } from '@/lib/cart'
import { PRODUCTO_LIST_SELECT } from '@/lib/productQueries'
import { mapShelfProductos } from '@/lib/mapShelfProductos'
import { productoVisibleColumn, type CatalogType } from '@/lib/catalog'

/**
 * When the cart page is opened with ?c=…, merges that saved cart into the
 * current one (fresh prices from the database, hidden products skipped), then
 * removes the parameter from the address bar. One small query, only when used.
 */
export function useRestoreSharedCart(catalogType: CatalogType) {
  const hydrated = useCartHydrated()
  const done = useRef(false)

  useEffect(() => {
    if (!hydrated || done.current) return
    const encoded = new URLSearchParams(window.location.search).get('c')
    if (!encoded) return
    done.current = true

    const clearParam = () => {
      const url = new URL(window.location.href)
      url.searchParams.delete('c')
      window.history.replaceState(window.history.state, '', url.toString())
    }

    const entries = decodeCart(encoded)
    if (!entries.length) {
      clearParam()
      return
    }

    ;(async () => {
      const { data, error } = await supabase
        .from('productos')
        .select(PRODUCTO_LIST_SELECT)
        .in('id', [...new Set(entries.map(e => e.id))])
        .eq(productoVisibleColumn(catalogType), true)

      if (error) {
        toast.error('No pudimos recuperar el carrito guardado. Intenta de nuevo.')
        return
      }

      const productos = new Map(mapShelfProductos(data as never).map(p => [p.id, p]))
      const { agregar, actualizarCantidad } = useCarrito.getState()
      let restored = 0

      for (const entry of entries) {
        const producto = productos.get(entry.id)
        if (!producto) continue
        const lineKey = getLineKey(producto.id, entry.options)
        const existing = useCarrito.getState().items.find(i => itemLineKey(i) === lineKey)
        if (!existing) agregar(producto, entry.options)
        const current = existing?.cantidad ?? 1
        actualizarCantidad(lineKey, Math.max(current, entry.qty))
        restored++
      }

      clearParam()
      if (restored) toast.success(`Recuperamos tu carrito (${restored} producto${restored > 1 ? 's' : ''})`)
      const missing = entries.length - restored
      if (missing > 0) toast(`${missing} producto${missing > 1 ? 's ya no están' : ' ya no está'} disponible${missing > 1 ? 's' : ''}`)
    })()
  }, [hydrated, catalogType])
}
