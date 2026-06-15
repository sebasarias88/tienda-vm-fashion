'use client'

import { motion } from 'framer-motion'
import { Producto } from '@/types'
import { type CatalogType } from '@/lib/catalog'
import ProductCard from '@/components/catalog/ProductCard'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'

export default function ProductosRelacionados({
  productos,
  catalogType = 'detal',
}: {
  productos: Producto[]
  catalogType?: CatalogType
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 pb-16 sm:pb-20">
      <div className="border-t border-[var(--border-subtle)] pt-12">
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
              También te puede gustar
            </span>
          </div>
          <h2 className="text-[1.75rem] font-thin uppercase leading-none tracking-[1.5px] text-[var(--text-primary)] sm:text-[2.125rem]">
            Productos{' '}
            <span className="text-[var(--gold)]">relacionados</span>
          </h2>
        </motion.div>

        <HorizontalCarousel itemClassName="w-[68vw] sm:w-[240px] lg:w-[260px]" gapClassName="gap-3 sm:gap-4">
          {productos.map((producto, i) => (
            <motion.div
              key={producto.id}
              className="h-full overflow-hidden rounded-[2px] border border-[var(--border-subtle)] shadow-[var(--shadow-card)]"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <ProductCard producto={producto} catalogType={catalogType} />
            </motion.div>
          ))}
        </HorizontalCarousel>
      </div>
    </section>
  )
}
