'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, MessageCircle, ShoppingBag } from 'lucide-react'

type CartCheckoutSuccessProps = {
  productosHref: string
  onConfirmSent: () => void
  onReopenWhatsApp: () => void
  onBackToReview: () => void
  layout?: 'mobile' | 'desktop'
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function CartCheckoutSuccess({
  productosHref,
  onConfirmSent,
  onReopenWhatsApp,
  onBackToReview,
  layout = 'desktop',
}: CartCheckoutSuccessProps) {
  const isMobile = layout === 'mobile'

  return (
    <motion.div
      key="exito"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={
        isMobile
          ? 'mx-auto max-w-lg space-y-5'
          : 'mx-auto max-w-xl space-y-8 py-4'
      }
    >
      <div
        className={`text-center ${
          isMobile
            ? 'rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] px-6 py-10 shadow-[var(--shadow-soft)]'
            : 'rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-8 py-12'
        }`}
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(37,211,102,0.35)] bg-[rgba(37,211,102,0.1)] text-[#25D366]">
          <CheckCircle2 size={32} strokeWidth={1.5} />
        </div>

        <p className="text-[11px] font-light uppercase tracking-[2.5px] text-[var(--gold)]">
          Pedido preparado
        </p>
        <h2
          className={`mt-3 font-thin uppercase tracking-[1px] text-[var(--text-primary)] ${
            isMobile ? 'text-[1.35rem]' : 'text-[1.75rem]'
          }`}
        >
          Revisa WhatsApp
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-[13px] font-light leading-relaxed text-[var(--text-muted)]">
          Tu pedido ya está armado en WhatsApp. Envía el mensaje para confirmarlo con nosotros.
          Tu carrito se mantiene hasta que confirmes que ya lo enviaste.
        </p>
      </div>

      <div className={`flex flex-col gap-3 ${isMobile ? '' : 'sm:flex-row'}`}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onConfirmSent}
          className={`flex items-center justify-center gap-2 bg-[#25D366] text-white transition-colors hover:bg-[#22c55e] ${
            isMobile
              ? 'min-h-[52px] rounded-xl text-[12px] font-semibold uppercase tracking-[1.5px]'
              : 'flex-1 rounded-[2px] py-4 text-[11px] font-medium uppercase tracking-[2px]'
          }`}
        >
          <CheckCircle2 size={16} />
          Ya envié el mensaje
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onReopenWhatsApp}
          className={`flex items-center justify-center gap-2 border border-[rgba(37,211,102,0.35)] bg-[rgba(37,211,102,0.08)] text-[#1a9e4b] transition-colors hover:bg-[rgba(37,211,102,0.14)] ${
            isMobile
              ? 'min-h-[52px] rounded-xl text-[12px] font-semibold uppercase tracking-[1.5px]'
              : 'flex-1 rounded-[2px] py-4 text-[11px] font-medium uppercase tracking-[2px]'
          }`}
        >
          <WhatsAppIcon size={16} />
          Reabrir WhatsApp
        </motion.button>
      </div>

      <div
        className={`flex flex-col gap-2 sm:flex-row sm:justify-center ${
          isMobile ? 'pt-1' : ''
        }`}
      >
        <button
          type="button"
          onClick={onBackToReview}
          className={`inline-flex items-center justify-center gap-2 text-[var(--text-muted)] transition-colors hover:text-[var(--gold)] ${
            isMobile
              ? 'min-h-[44px] text-[11px] font-medium uppercase tracking-[1.5px]'
              : 'px-4 py-3 text-[11px] font-light uppercase tracking-[2px]'
          }`}
        >
          <MessageCircle size={14} />
          Aún no lo envié
        </button>

        <Link
          href={productosHref}
          className={`inline-flex items-center justify-center gap-2 text-[var(--text-muted)] transition-colors hover:text-[var(--gold)] ${
            isMobile
              ? 'min-h-[44px] text-[11px] font-medium uppercase tracking-[1.5px]'
              : 'px-4 py-3 text-[11px] font-light uppercase tracking-[2px]'
          }`}
        >
          <ShoppingBag size={14} />
          Seguir comprando
        </Link>
      </div>

      <p className="text-center text-[11px] font-light leading-relaxed text-[var(--text-subtle)]">
        Si cierras WhatsApp sin enviar, puedes volver al resumen o reabrir el chat cuando quieras.
      </p>
    </motion.div>
  )
}
