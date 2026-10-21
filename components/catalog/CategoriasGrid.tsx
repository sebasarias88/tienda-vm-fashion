'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Categoria } from '@/types'
import { catalogPath, type CatalogType } from '@/lib/catalog'
import { ArrowRight, ArrowUpRight, Tag } from 'lucide-react'
import { getPorcentajeDescuentoGrupoCategoria } from '@/lib/descuentos'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'
import CatalogImage from '@/components/catalog/CatalogImage'

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
  const pctDescuento = getPorcentajeDescuentoGrupoCategoria(cat, catalogType)
  const conDescuento = pctDescuento != null

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
        aria-label={`${cat.nombre}${subcats.length ? `, ${subcats.length} ${subcats.length === 1 ? 'tipo' : 'tipos'}` : ''}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)] md:rounded-none md:border-[var(--border)]"
      >
        {cat.imagen_url ? (
          <>
            {/* The artwork already shows the category name: show it whole, no dark overlay. */}
            <div className="relative aspect-square w-full overflow-hidden">
              <CatalogImage
                variant="thumb"
                src={cat.imagen_url}
                alt={cat.nombre}
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 20vw"
                quality={70}
              />
              {conDescuento && pctDescuento != null && (
                <div className="absolute left-2 top-2 z-[1] bg-[var(--gold)] px-2 py-1 text-[9px] font-medium uppercase tracking-[1.5px] text-[var(--text-on-gold)]">
                  -{pctDescuento}%
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] px-3 py-2.5 sm:px-4 sm:py-3">
              <span className="text-[9px] font-medium uppercase tracking-[2px] text-[var(--gold)] sm:text-[10px]">
                {subcats.length > 0
                  ? `${subcats.length} ${subcats.length === 1 ? 'tipo' : 'tipos'}`
                  : 'Ver productos'}
              </span>
              <motion.span
                className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-[2px] text-[var(--text-secondary)] transition-colors group-hover:text-[var(--gold)] sm:text-[10px]"
                animate={{ x: hovered ? 2 : 0 }}
              >
                Explorar
                <ArrowUpRight size={11} />
              </motion.span>
            </div>
          </>
        ) : (
          <div className="relative aspect-[4/5] w-full">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--bg-muted)] to-[var(--gold-muted)]">
              <Tag size={28} className="text-[color-mix(in_srgb,var(--gold)_40%,transparent)]" />
            </div>
            {conDescuento && pctDescuento != null && (
              <div className="absolute left-2 top-2 z-[1] bg-[var(--gold)] px-2 py-1 text-[9px] font-medium uppercase tracking-[1.5px] text-[var(--text-on-gold)]">
                -{pctDescuento}%
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
              {subcats.length > 0 && (
                <p className="mb-1 text-[8px] font-medium uppercase tracking-[2px] text-[var(--gold)] sm:text-[9px]">
                  {subcats.length} {subcats.length === 1 ? 'tipo' : 'tipos'}
                </p>
              )}
              {/* No artwork: the name must be visible */}
              <p className="text-[13px] font-medium uppercase leading-snug tracking-[1px] text-[var(--text-primary)] sm:text-[14px]">
                {cat.nombre}
              </p>
              <span className="mt-2 flex items-center gap-1 text-[9px] font-medium uppercase tracking-[2px] text-[var(--text-secondary)] sm:text-[10px]">
                Explorar
                <ArrowUpRight size={11} />
              </span>
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  )
}
