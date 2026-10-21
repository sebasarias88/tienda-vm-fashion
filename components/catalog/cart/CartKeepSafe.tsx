'use client'

import { useEffect, useState } from 'react'
import { Bookmark, Check, Copy, Info, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ItemCarrito } from '@/types'
import { catalogPath, type CatalogType } from '@/lib/catalog'
import { encodeCart, inAppBrowserName, isInAppBrowser } from '@/lib/cartShare'

type CartKeepSafeProps = {
  items: ItemCarrito[]
  catalogType: CatalogType
}

/**
 * "Save my cart for later": a link that restores this cart in any browser or device.
 * Two explicit actions (copy link / send it to myself on WhatsApp) so customers
 * understand what happens. Also warns inside Instagram/Facebook/TikTok browsers,
 * which can wipe site data when closed.
 */
export default function CartKeepSafe({ items, catalogType }: CartKeepSafeProps) {
  const [inApp, setInApp] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isInAppBrowser(navigator.userAgent)) setInApp(inAppBrowserName(navigator.userAgent))
  }, [])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2500)
    return () => clearTimeout(timer)
  }, [copied])

  if (!items.length) return null

  const buildLink = () =>
    `${window.location.origin}${catalogPath(catalogType, '/carrito')}?c=${encodeCart(items)}`

  const handleCopy = async () => {
    const link = buildLink()
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success('Enlace copiado. Ábrelo cuando quieras y tu carrito volverá.')
    } catch {
      window.prompt('Copia este enlace para recuperar tu carrito:', link)
    }
  }

  const handleWhatsApp = () => {
    const unidades = items.reduce((total, item) => total + item.cantidad, 0)
    const text = `Mi carrito en VM Fashion (${unidades} producto${unidades !== 1 ? 's' : ''}). Ábrelo aquí para continuar mi compra: ${buildLink()}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <section
      aria-labelledby="cart-keep-safe-title"
      className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] md:rounded-[2px] md:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--gold)_12%,transparent)] text-[var(--gold)]">
          <Bookmark size={16} strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2
            id="cart-keep-safe-title"
            className="text-[14px] font-medium leading-snug text-[var(--text-primary)]"
          >
            ¿No vas a terminar tu compra ahora?
          </h2>
          <p className="mt-1 text-[12.5px] font-light leading-relaxed text-[var(--text-muted)]">
            Guarda tu carrito con un enlace y recupéralo cuando quieras, desde este u otro celular o
            computador.
          </p>
        </div>
      </div>

      {inApp && (
        <p className="mt-3 flex gap-2 rounded-lg bg-[color-mix(in_srgb,var(--gold)_8%,transparent)] px-3 py-2 text-[12px] font-light leading-relaxed text-[var(--text-secondary)] md:rounded-[2px]">
          <Info size={14} className="mt-0.5 shrink-0 text-[var(--gold)]" />
          <span>
            Estás dentro de {inApp}: si cierras esta ventana, tu carrito podría borrarse. Guárdalo
            aquí o abre la tienda en Safari o Chrome (menú ⋯ → “Abrir en el navegador”).
          </span>
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-[11px] font-medium uppercase tracking-[1.5px] text-[var(--text-primary)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] md:rounded-[2px]"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          {copied ? 'Enlace copiado' : 'Copiar enlace'}
        </button>
        <button
          type="button"
          onClick={handleWhatsApp}
          className="catalog-gold-cta inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[11px] font-medium uppercase tracking-[1.5px] md:rounded-[2px]"
        >
          <MessageCircle size={14} />
          Enviármelo por WhatsApp
        </button>
      </div>
    </section>
  )
}
