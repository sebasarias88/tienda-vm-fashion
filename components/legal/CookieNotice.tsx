'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie } from 'lucide-react'

const STORAGE_KEY = 'vmfashion-cookie-notice-v1'

/**
 * Informative notice: the store only uses technical storage (cart, admin
 * session), so no consent is needed — just transparency. If analytics or ads
 * are ever added, this must become a real accept/reject consent banner.
 */
export default function CookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== '1') setVisible(true)
    } catch {
      // Storage blocked: show nothing rather than nag on every page.
    }
  }, [])

  if (!visible) return null

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed bottom-3 left-3 right-20 z-40 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-soft)] sm:right-auto sm:max-w-sm md:rounded-[2px]"
    >
      <p className="flex gap-2.5 text-[12px] font-light leading-relaxed text-[var(--text-secondary)]">
        <Cookie size={16} className="mt-0.5 shrink-0 text-[var(--gold)]" aria-hidden />
        <span>
          Solo usamos cookies técnicas para que tu carrito funcione. Nada de publicidad.{' '}
          <Link
            href="/politica-de-cookies"
            className="font-medium text-[var(--gold)] underline underline-offset-2"
          >
            Ver más
          </Link>
        </span>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="catalog-gold-cta mt-3 w-full rounded-lg py-2.5 text-[11px] font-medium uppercase tracking-[2px] md:rounded-[2px]"
      >
        Entendido
      </button>
    </div>
  )
}
