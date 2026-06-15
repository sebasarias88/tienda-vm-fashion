'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Producto } from '@/types'
import { catalogPath, type CatalogType } from '@/lib/catalog'
import ProductCard from '@/components/catalog/ProductCard'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'
import SectionGoldDivider from '@/components/catalog/SectionGoldDivider'

export default function ProductosDestacados({
  productos,
  catalogType = 'detal',
}: {
  productos: Producto[]
  catalogType?: CatalogType
}) {
  if (!productos.length) return null

  const productosHref = catalogPath(catalogType, '/productos')

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
      <SectionGoldDivider />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 border-b border-[var(--border-subtle)] pb-8"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-8 bg-[var(--gold)]" />
          <span className="catalog-eyebrow tracking-[3px]">
            Selección
          </span>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="text-[1.75rem] font-thin uppercase leading-none tracking-[1.5px] text-[var(--text-primary)] sm:text-[2.125rem]">
                Productos{' '}
                <span className="text-[var(--gold)]">destacados</span>
              </h2>
            </div>
            <p className="mt-3 max-w-lg text-[14px] catalog-lead leading-relaxed">
              Los favoritos de nuestra tienda, elegidos por calidad y popularidad
            </p>
          </div>

          <Link
            href={productosHref}
            className="group inline-flex shrink-0 items-center gap-2 self-start border-b border-[var(--border)] pb-1 text-[11px] font-light uppercase tracking-[2px] text-[var(--text-secondary)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] sm:mt-1"
          >
            Ver todos
            <ArrowRight
              size={14}
              className="text-[var(--gold-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--gold)]"
            />
          </Link>
        </div>
      </motion.div>

      <HorizontalCarousel itemClassName="w-[68vw] sm:w-[240px] lg:w-[260px]" gapClassName="gap-3 sm:gap-4">
        {productos.map((producto, i) => (
          <motion.div
            key={producto.id}
            className="h-full overflow-hidden rounded-[2px] border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <ProductCard producto={producto} catalogType={catalogType} />
          </motion.div>
        ))}
      </HorizontalCarousel>
    </section>
  )
}
