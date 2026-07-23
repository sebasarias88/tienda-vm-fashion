'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Categoria } from '@/types'
import { catalogPath, type CatalogType } from '@/lib/catalog'
import { ArrowRight, ArrowUpRight, Tag } from 'lucide-react'
import { categoriaTieneDescuentoActivo } from '@/lib/descuentos'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'

export default function CategoriasGrid({
  categorias,
  catalogType = 'detal',
}: {
  categorias: Categoria[]
  catalogType?: CatalogType
}) {
  if (!categorias.length) return null

  const productosHref = catalogPath(catalogType, '/productos')

  return (
    <section className="bg-[var(--bg-base)] py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
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
              <span className="catalog-eyebrow tracking-[3px]">Explorar</span>
            </div>
            <h2 className="text-[1.75rem] font-thin uppercase leading-none tracking-[1.5px] text-[var(--text-primary)] sm:text-[2.125rem]">
              Categorías
            </h2>
            <p className="mt-3 max-w-lg text-[14px] catalog-lead leading-relaxed">
              Encuentra exactamente lo que tu cabello necesita
            </p>
          </div>

          <Link
            href={productosHref}
            className="group inline-flex shrink-0 items-center gap-2 self-start border-b border-[var(--border)] pb-1 text-[11px] font-light uppercase tracking-[2px] text-[var(--text-secondary)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            Ver más
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
          {categorias.map((cat, i) => (
            <CategoriaCard
              key={cat.id}
              cat={cat}
              index={i}
              productosHref={productosHref}
              catalogType={catalogType}
            />
          ))}
        </HorizontalCarousel>
      </div>
    </section>
  )
}

function CategoriaCard({
  cat,
  index,
  productosHref,
  catalogType = 'detal',
}: {
  cat: Categoria
  index: number
  productosHref: string
  catalogType?: CatalogType
}) {
  const [hovered, setHovered] = useState(false)
  const subcats = cat.subcategorias || []
  const conDescuento = categoriaTieneDescuentoActivo(cat, catalogType)
  const pctDescuento =
    catalogType === 'mayoreo' ? cat.descuento_porcentaje_mayoreo : cat.descuento_porcentaje

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.04, 0.28) }}
      className="h-full"
    >
      <Link
        href={`${productosHref}?categoria=${cat.slug}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative block aspect-[4/5] overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]"
      >
        {cat.imagen_url ? (
          <img
            src={cat.imagen_url}
            alt={cat.nombre}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--bg-muted)] to-[var(--gold-muted)]">
            <Tag
              size={28}
              className="text-[color-mix(in_srgb,var(--gold)_40%,transparent)]"
            />
          </div>
        )}

        {conDescuento && (
          <div className="absolute left-2 top-2 z-[1] bg-[var(--gold)] px-2 py-1 text-[9px] font-medium uppercase tracking-[1.5px] text-[var(--text-on-gold)]">
            -{pctDescuento}%
          </div>
        )}

        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background:
              'linear-gradient(to top, rgba(12,10,8,0.92) 0%, rgba(12,10,8,0.72) 28%, rgba(12,10,8,0.28) 52%, rgba(12,10,8,0.05) 78%, transparent 100%)',
            opacity: hovered ? 1 : 0.97,
          }}
        />

        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          {subcats.length > 0 && (
            <p className="mb-1 text-[8px] font-medium uppercase tracking-[2px] text-[#E8D4A0] [text-shadow:0_1px_3px_rgba(0,0,0,0.85)] sm:text-[9px]">
              {subcats.length} {subcats.length === 1 ? 'tipo' : 'tipos'}
            </p>
          )}
          <p
            className="text-[13px] font-medium uppercase leading-snug tracking-[1px] text-white transition-transform duration-300 group-hover:-translate-y-0.5 sm:text-[14px]"
            style={{
              color: '#FFFFFF',
              textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 2px 12px rgba(0,0,0,0.55)',
            }}
          >
            {cat.nombre}
          </p>

          <motion.div
            className="mt-2 flex items-center gap-1 text-[9px] font-medium uppercase tracking-[2px] text-[#F0E2B8] [text-shadow:0_1px_3px_rgba(0,0,0,0.85)] sm:mt-2.5 sm:text-[10px]"
            animate={{ opacity: hovered ? 1 : 0.9, x: hovered ? 2 : 0 }}
          >
            Explorar
            <ArrowUpRight size={11} />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  )
}
