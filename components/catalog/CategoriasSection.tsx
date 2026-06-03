'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Categoria } from '@/types'
import { catalogPath, type CatalogType } from '@/lib/catalog'
import { Tag, ArrowRight } from 'lucide-react'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'

export default function CategoriasSection({
  categorias,
  catalogType = 'detal',
}: {
  categorias: Categoria[]
  catalogType?: CatalogType
}) {
  const categoriasRaiz = useMemo(
    () =>
      categorias
        .filter(cat => cat.padre_id == null)
        .sort((a, b) => a.orden - b.orden),
    [categorias],
  )

  if (!categoriasRaiz.length) return null

  const productosHref = catalogPath(catalogType, '/productos')

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 border-b border-[rgba(201,168,76,0.18)] pb-8"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-8 bg-[#C9A84C]" />
          <span className="text-[11px] font-light uppercase tracking-[3px] text-[rgba(201,168,76,0.92)]">
            Explorar
          </span>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="text-[1.75rem] font-thin uppercase leading-none tracking-[1.5px] text-[#f0ebe4] sm:text-[2.125rem]">
                Por{' '}
                <span className="text-[#C9A84C]">categoría</span>
              </h2>
            </div>
            <p className="mt-3 max-w-lg text-[14px] font-light leading-relaxed text-[rgba(240,235,228,0.85)]">
              Encuentra lo que buscas navegando por nuestras líneas de producto
            </p>
          </div>

          <Link
            href={productosHref}
            className="group inline-flex shrink-0 items-center gap-2 self-start border-b border-[rgba(201,168,76,0.42)] pb-1 text-[11px] font-light uppercase tracking-[2px] text-[rgba(240,235,228,0.82)] transition-colors hover:border-[#C9A84C] hover:text-[#C9A84C] sm:mt-1"
          >
            Ver catálogo
            <ArrowRight
              size={14}
              className="text-[rgba(201,168,76,0.72)] transition-transform group-hover:translate-x-0.5 group-hover:text-[#C9A84C]"
            />
          </Link>
        </div>
      </motion.div>

      {/* Carrusel */}
      <HorizontalCarousel itemClassName="w-[68vw] sm:w-[240px] lg:w-[260px]" gapClassName="gap-3 sm:gap-4">
        {categoriasRaiz.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="h-full"
          >
            <Link
              href={`${productosHref}?categoria=${cat.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-[#141414]"
            >
              {cat.imagen_url ? (
                <img
                  src={cat.imagen_url}
                  alt={cat.nombre}
                  className="h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#141414] transition-colors group-hover:bg-[#1a1a1a]">
                  <Tag size={24} className="text-[rgba(201,168,76,0.38)]" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.75)] via-[rgba(10,10,10,0.08)] to-transparent" />

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-[13px] font-light uppercase tracking-[1.5px] text-[#f0ebe4] transition-colors group-hover:text-[#C9A84C]">
                  {cat.nombre}
                </p>
                <div className="mt-1.5 h-px w-0 bg-[#C9A84C] transition-all duration-300 group-hover:w-full" />
              </div>
            </Link>
          </motion.div>
        ))}
      </HorizontalCarousel>
    </section>
  )
}