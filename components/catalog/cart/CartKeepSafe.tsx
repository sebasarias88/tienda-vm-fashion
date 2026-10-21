'use client'

import { useEffect, useState } from 'react'
import { Bookmark, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ItemCarrito } from '@/types'
import { catalogPath, type CatalogType } from '@/lib/catalog'
import { encodeCart, inAppBrowserName, isInAppBrowser } from '@/lib/cartShare'

type CartKeepSafeProps = {
  items: ItemCarrito[]
  catalogType: CatalogType
}

/**
 * Helps customers not lose their cart:
 * - warns when they browse inside Instagram/Facebook/TikTok (those in-app browsers can wipe data);
 * - "Guardar mi carrito" creates a link that restores the cart in any browser or device.
 */
export default function CartKeepSafe({ items, catalogType }: CartKeepSafeProps) {
  const [inApp, setInApp] = useState<string | null>(null)

  useEffect(() => {
    if (isInAppBrowser(navigator.userAgent)) setInApp(inAppBrowserName(navigator.userAgent))
  }, [])

  if (!items.length) return null

  const handleSave = async () => {
    const url = `${window.location.origin}${catalogPath(catalogType, '/carrito')}?c=${encodeCart(items)}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Mi carrito — VM Fashion', url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success('Enlace copiado. Ábrelo cuando quieras para recuperar tu carrito.')
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') return
      window.prompt('Copia este enlace para recuperar tu carrito:', url)
    }
  }

  return (
    <div className="mb-5 rounded-xl border border-[color-mix(in_srgb,var(--gold)_25%,var(--border))] bg-[color-mix(in_srgb,var(--gold)_6%,transparent)] px-4 py-3 md:rounded-[2px]">
      {inApp && (
        <p className="mb-2 flex gap-2 text-[12px] font-light leading-relaxed text-[var(--text-secondary)]">
          <Info size={14} className="mt-0.5 shrink-0 text-[var(--gold)]" />
          <span>
            Estás navegando dentro de {inApp}. Si cierras esta ventana, tu carrito podría borrarse:
            guárdalo con el botón de abajo o abre la tienda en Safari o Chrome (menú ⋯ → “Abrir en el
            navegador”).
          </span>
        </p>
      )}
      <button
        type="button"
        onClick={handleSave}
        className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[1.5px] text-[var(--gold)] transition-colors hover:text-[var(--text-primary)]"
      >
        <Bookmark size={13} />
        Guardar mi carrito para después
      </button>
    </div>
  )
}
