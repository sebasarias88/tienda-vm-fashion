'use client'

import { Loader2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

type MobileCartStickyBarProps = {
  totalLabel: string
  totalValue: string
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  primaryLoading?: boolean
  primaryIcon?: ReactNode
  variant?: 'gold' | 'whatsapp'
  secondaryLabel?: string
  onSecondary?: () => void
  hint?: string
  /** stack = CTA ancho completo + volver debajo (mejor para WhatsApp) */
  layout?: 'row' | 'stack'
}

export default function MobileCartStickyBar({
  totalLabel,
  totalValue,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  primaryLoading = false,
  primaryIcon,
  variant = 'gold',
  secondaryLabel,
  onSecondary,
  hint,
  layout,
}: MobileCartStickyBarProps) {
  const useStack = layout === 'stack' || variant === 'whatsapp'

  const primaryClass =
    variant === 'whatsapp'
      ? 'mobile-cart-cta-whatsapp bg-[#25D366] text-white shadow-[0_4px_16px_rgba(37,211,102,0.28)] active:bg-[#20BD5A]'
      : 'catalog-gold-cta text-[var(--text-on-gold)]'

  return (
    <div className="mobile-cart-sticky fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-overlay)] backdrop-blur-md">
      {hint ? (
        <p className="border-b border-[var(--border-subtle)] px-5 py-2 text-center text-[10px] font-light leading-snug text-[var(--text-subtle)]">
          {hint}
        </p>
      ) : null}

      <div className="mobile-cart-sticky-inner px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <div className="mb-2.5 flex items-baseline justify-between gap-3">
          <span className="text-[10px] font-light uppercase tracking-[1.5px] text-[var(--text-muted)]">
            {totalLabel}
          </span>
          <span className="text-[17px] font-light tabular-nums leading-none text-[var(--gold)]">
            {totalValue}
          </span>
        </div>

        {useStack ? (
          <div className="flex flex-col gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={onPrimary}
              disabled={primaryDisabled || primaryLoading}
              className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-4 text-[11px] font-semibold uppercase tracking-[1.2px] disabled:opacity-50 ${primaryClass}`}
            >
              {primaryLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {primaryIcon}
                  <span className="text-center leading-tight">{primaryLabel}</span>
                </>
              )}
            </motion.button>

            {secondaryLabel && onSecondary ? (
              <button
                type="button"
                onClick={onSecondary}
                className="mobile-cart-cta-back flex min-h-[40px] w-full items-center justify-center gap-1.5 text-[11px] font-light uppercase tracking-[1.2px] text-[var(--text-muted)] active:text-[var(--gold)]"
              >
                <ArrowLeft size={14} strokeWidth={1.75} />
                {secondaryLabel}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex gap-2.5">
            {secondaryLabel && onSecondary ? (
              <button
                type="button"
                onClick={onSecondary}
                className="mobile-cart-cta-back flex min-h-[48px] min-w-[6.5rem] shrink-0 items-center justify-center gap-1 rounded-xl border border-[var(--border-input)] bg-[var(--bg-card)] px-3 text-[10px] font-light uppercase tracking-[1.2px] text-[var(--text-secondary)] active:border-[var(--gold)] active:text-[var(--gold)]"
              >
                <ChevronLeft size={15} />
                {secondaryLabel}
              </button>
            ) : null}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={onPrimary}
              disabled={primaryDisabled || primaryLoading}
              className={`flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-[11px] font-semibold uppercase tracking-[1.2px] disabled:opacity-50 ${primaryClass}`}
            >
              {primaryLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <>
                  {primaryIcon}
                  {primaryLabel}
                  <ChevronRight size={15} />
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}
