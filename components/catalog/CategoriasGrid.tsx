'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Categoria } from '@/types'
import { catalogPath, type CatalogType } from '@/lib/catalog'
import { ArrowUpRight, Tag } from 'lucide-react'
import { categoriaTieneDescuentoActivo } from '@/lib/descuentos'

/** Máximo en home: 1 destacada + 4 pequeñas */
const MAX_VISIBLE = 5

export default function CategoriasGrid({
  categorias,
  catalogType = 'detal',
}: {
  categorias: Categoria[]
  catalogType?: CatalogType
}) {
  if (!categorias.length) return null

  const productosHref = catalogPath(catalogType, '/productos')
  const visibles = categorias.slice(0, MAX_VISIBLE)
  const hayMas = categorias.length > MAX_VISIBLE
  const mostrarDestacada = visibles.length >= 3

  return (
    <section className="mx-auto flex min-h-[100svh] max-w-7xl flex-col px-5 py-6 sm:px-6 sm:py-8 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-4 flex shrink-0 items-end justify-between gap-4 sm:mb-5"
      >
        <div>
          <p className="mb-1.5 catalog-eyebrow tracking-[3px]">Explorar</p>
          <h2 className="text-[1.5rem] font-thin uppercase tracking-[1.5px] text-[var(--text-primary)] sm:text-[1.875rem]">
            Categorías
          </h2>
          <p className="mt-1.5 max-w-md text-[13px] catalog-lead sm:text-[14px]">
            Encuentra exactamente lo que tu cabello y tu ritual necesitan
          </p>
        </div>
        <Link
          href={productosHref}
          className="hidden items-center gap-1.5 text-[11px] font-light uppercase tracking-[2px] text-[var(--text-subtle)] transition-colors hover:text-[var(--gold)] sm:inline-flex"
        >
          {hayMas ? 'Ver más' : 'Ver catálogo'}
          <ArrowUpRight size={13} />
        </Link>
      </motion.div>

      <div
        className={`grid min-h-0 flex-1 gap-2.5 sm:gap-3 ${
          mostrarDestacada
            ? 'grid-cols-2 grid-rows-[1.15fr_1fr_1fr] md:grid-cols-4 md:grid-rows-2'
            : 'auto-rows-fr grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}
      >
        {visibles.map((cat, i) => (
          <CategoriaCard
            key={cat.id}
            cat={cat}
            index={i}
            productosHref={productosHref}
            catalogType={catalogType}
            featured={mostrarDestacada && i === 0}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-4 flex shrink-0 justify-center sm:mt-5"
      >
        <Link
          href={productosHref}
          className="group inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--bg-card)] px-5 py-2.5 text-[10px] font-medium uppercase tracking-[2px] text-[var(--text-primary)] shadow-[var(--shadow-soft)] transition-all hover:border-[color-mix(in_srgb,var(--gold)_40%,var(--border))] hover:text-[var(--gold)] sm:px-6 sm:py-3 sm:text-[11px]"
        >
          {hayMas
            ? `Ver más categorías (${categorias.length - MAX_VISIBLE}+)`
            : 'Ver catálogo completo'}
          <ArrowUpRight
            size={13}
            className="text-[var(--gold)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </motion.div>
    </section>
  )
}

function CategoriaCard({
  cat,
  index,
  productosHref,
  catalogType = 'detal',
  featured,
}: {
  cat: Categoria
  index: number
  productosHref: string
  catalogType?: CatalogType
  featured?: boolean
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
      transition={{ delay: Math.min(index * 0.05, 0.35) }}
      className={`min-h-0 ${
        featured ? 'col-span-2 row-span-1 md:col-span-2 md:row-span-2' : ''
      }`}
    >
      <Link
        href={`${productosHref}?categoria=${cat.slug}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative block h-full min-h-0 overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]"
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
              size={featured ? 36 : 24}
              className="text-[color-mix(in_srgb,var(--gold)_40%,transparent)]"
            />
          </div>
        )}

        {conDescuento && (
          <div className="absolute left-2 top-2 z-[1] bg-[var(--gold)] px-2 py-1 text-[9px] font-medium uppercase tracking-[1.5px] text-[var(--text-on-gold)]">
            -{pctDescuento}%
          </div>
        )}

        {/* Scrim oscuro sólido en la zona de texto para contraste sobre fondos claros */}
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
            className={`font-medium uppercase leading-snug tracking-[1px] text-white transition-transform duration-300 group-hover:-translate-y-0.5 ${
              featured ? 'text-[15px] sm:text-[20px]' : 'text-[12px] sm:text-[13px]'
            }`}
            style={{
              color: '#FFFFFF',
              textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 2px 12px rgba(0,0,0,0.55)',
            }}
          >
            {cat.nombre}
          </p>

          {featured && subcats.length > 0 && (
            <div className="mt-2 hidden flex-wrap gap-1.5 md:flex">
              {subcats.slice(0, 4).map((sub: Categoria) => (
                <span
                  key={sub.id}
                  className="border border-white/25 bg-black/35 px-2 py-0.5 text-[9px] font-light uppercase tracking-[1px] text-white/90 backdrop-blur-[2px]"
                >
                  {sub.nombre}
                </span>
              ))}
            </div>
          )}

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
