'use client'

import { motion } from 'framer-motion'
import { Truck, MessageCircle, Sparkles, ShieldCheck } from 'lucide-react'

const ITEMS = [
  {
    icon: Truck,
    title: 'Envíos nacionales',
    desc: 'A toda Colombia',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp directo',
    desc: 'Te asesoramos',
  },
  {
    icon: Sparkles,
    title: 'Belleza profesional',
    desc: 'Marcas en tendencia',
  },
  {
    icon: ShieldCheck,
    title: 'Compra segura',
    desc: 'Pedido confirmado',
  },
] as const

export default function TrustStrip() {
  return (
    <section className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8">
        <ul className="grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:gap-y-0">
          {ITEMS.map(({ icon: Icon, title, desc }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className={`relative flex flex-col items-center px-3 text-center sm:px-5 ${
                i % 2 === 1
                  ? 'border-l border-[var(--border-subtle)] sm:border-l-0'
                  : ''
              }`}
            >
              {i > 0 && (
                <span
                  className="absolute left-0 top-1/2 hidden h-8 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-[color-mix(in_srgb,var(--gold)_35%,var(--border))] to-transparent sm:block"
                  aria-hidden
                />
              )}

              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--gold)_28%,var(--border))] bg-[var(--gold-muted)]">
                <Icon size={18} className="text-[var(--gold)]" strokeWidth={1.4} />
              </div>

              <p className="text-[11px] font-medium uppercase tracking-[1.8px] text-[var(--text-primary)] sm:text-[12px]">
                {title}
              </p>
              <p className="mt-1.5 text-[12px] font-light leading-snug text-[var(--text-subtle)] sm:text-[13px]">
                {desc}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
