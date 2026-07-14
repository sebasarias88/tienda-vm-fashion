'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Producto } from '@/types'
import { type CatalogType } from '@/lib/catalog'
import ResponsiveProductCard from '@/components/catalog/mobile/ResponsiveProductCard'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'
import SectionGoldDivider from '@/components/catalog/SectionGoldDivider'
import type { ReactNode } from 'react'

type Props = {
  productos: Producto[]
  catalogType?: CatalogType
  eyebrow: string
  title: ReactNode
  description?: string
  verMasHref: string
  verMasLabel?: string
  /** Fondo sutil para alternar secciones */
  muted?: boolean
}

export default function ProductosCarousel({
  productos,
  catalogType = 'detal',
  eyebrow,
  title,
  description,
  verMasHref,
  verMasLabel = 'Ver más',
  muted = false,
}: Props) {
  if (!productos.length) return null

  return (
    <section
      className={`py-14 sm:py-16 ${muted ? 'bg-[var(--bg-muted)]' : 'bg-[var(--bg-base)]'}`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <SectionGoldDivider />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-8 flex flex-col gap-5 border-b border-[var(--border-subtle)] pb-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px w-8 bg-[var(--gold)]" />
              <span className="catalog-eyebrow tracking-[3px]">{eyebrow}</span>
            </div>
            <h2 className="text-[1.75rem] font-thin uppercase leading-none tracking-[1.5px] text-[var(--text-primary)] sm:text-[2.125rem]">
              {title}
            </h2>
            {description && (
              <p className="mt-3 max-w-lg text-[14px] catalog-lead leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <Link
            href={verMasHref}
            className="group inline-flex shrink-0 items-center gap-2 self-start border-b border-[var(--border)] pb-1 text-[11px] font-light uppercase tracking-[2px] text-[var(--text-secondary)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            {verMasLabel}
            <ArrowRight
              size={14}
              className="text-[var(--gold-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--gold)]"
            />
          </Link>
        </motion.div>

        <HorizontalCarousel
          itemClassName="w-[68vw] sm:w-[240px] lg:w-[260px]"
          gapClassName="gap-3 sm:gap-4"
        >
          {productos.map((producto, i) => (
            <motion.div
              key={producto.id}
              className="h-full max-md:overflow-hidden md:overflow-hidden md:border md:border-[var(--border-card)] md:bg-[var(--bg-card)] md:shadow-[var(--shadow-card)]"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <ResponsiveProductCard producto={producto} catalogType={catalogType} />
            </motion.div>
          ))}
        </HorizontalCarousel>

        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href={verMasHref}
            className="inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--bg-card)] px-6 py-3 text-[11px] font-medium uppercase tracking-[2px] text-[var(--text-primary)] transition-colors hover:border-[color-mix(in_srgb,var(--gold)_40%,var(--border))] hover:text-[var(--gold)]"
          >
            {verMasLabel}
            <ArrowRight size={14} className="text-[var(--gold)]" />
          </Link>
        </div>
      </div>
    </section>
  )
}
