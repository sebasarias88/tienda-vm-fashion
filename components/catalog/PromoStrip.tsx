'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Promocion } from '@/types'
import SectionGoldDivider from '@/components/catalog/SectionGoldDivider'

function isPromoActive(promo: Promocion) {
  const now = new Date()
  if (promo.fecha_inicio && new Date(promo.fecha_inicio) > now) return false
  if (promo.fecha_fin && new Date(promo.fecha_fin) < now) return false
  return true
}

export default function PromoStrip({ promociones }: { promociones: Promocion[] }) {
  if (!promociones.length) return null

  const activas = promociones.filter(isPromoActive)
  if (!activas.length) return null

  const featured = activas.slice(0, 3)
  const rest = activas.slice(3)

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
      <SectionGoldDivider />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 flex items-end justify-between gap-4"
      >
        <div>
          <p className="mb-2 catalog-eyebrow tracking-[3px]">Ofertas</p>
          <h2 className="text-[1.75rem] font-thin uppercase tracking-[1.5px] text-[var(--text-primary)] sm:text-[2rem]">
            Promociones{' '}
            <span className="text-[var(--gold)]">del momento</span>
          </h2>
          <p className="mt-2 max-w-md text-[14px] catalog-lead">
            Aprovecha descuentos y lanzamientos pensados para tu ritual de belleza
          </p>
        </div>
      </motion.div>

      <div
        className={`grid gap-4 ${
          featured.length === 1
            ? 'grid-cols-1'
            : featured.length === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {featured.map((promo, i) => {
          const inner = (
            <>
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-muted)] sm:aspect-[5/3]">
                {promo.imagen_url ? (
                  <img
                    src={promo.imagen_url}
                    alt={promo.titulo}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-end bg-gradient-to-br from-[var(--gold-muted)] via-[var(--bg-muted)] to-[var(--bg-surface)] p-6">
                    <div className="h-16 w-16 rounded-full border border-[color-mix(in_srgb,var(--gold)_35%,transparent)] opacity-40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,10,8,0.92)] via-[rgba(12,10,8,0.45)] to-transparent" />

                {promo.badge_texto && (
                  <span
                    className="absolute left-4 top-4 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[2px] text-white"
                    style={{ backgroundColor: promo.badge_color || 'var(--gold)' }}
                  >
                    {promo.badge_texto}
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p
                    className="text-[17px] font-medium uppercase tracking-[1px] sm:text-[18px]"
                    style={{
                      color: '#FFFFFF',
                      textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 2px 12px rgba(0,0,0,0.55)',
                    }}
                  >
                    {promo.titulo}
                  </p>
                  {promo.descripcion && (
                    <p
                      className="mt-1.5 line-clamp-2 text-[13px] font-light leading-relaxed"
                      style={{
                        color: 'rgba(255,255,255,0.88)',
                        textShadow: '0 1px 3px rgba(0,0,0,0.85)',
                      }}
                    >
                      {promo.descripcion}
                    </p>
                  )}
                  {promo.enlace && (
                    <span
                      className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[2px]"
                      style={{
                        color: '#F0E2B8',
                        textShadow: '0 1px 3px rgba(0,0,0,0.85)',
                      }}
                    >
                      Ver oferta
                      <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  )}
                </div>
              </div>
            </>
          )

          return (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={i === 0 && featured.length === 3 ? 'sm:col-span-2 lg:col-span-1' : ''}
            >
              {promo.enlace ? (
                <Link
                  href={promo.enlace}
                  className="group block overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
                >
                  {inner}
                </Link>
              ) : (
                <div className="group overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
                  {inner}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {rest.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {rest.map(promo => {
            const chip = (
              <span className="inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-[12px] font-light text-[var(--text-primary)] transition-colors hover:border-[color-mix(in_srgb,var(--gold)_40%,var(--border))] hover:text-[var(--gold)]">
                {promo.badge_texto && (
                  <span
                    className="text-[9px] font-medium uppercase tracking-[1.5px]"
                    style={{ color: promo.badge_color }}
                  >
                    {promo.badge_texto}
                  </span>
                )}
                {promo.titulo}
              </span>
            )
            return promo.enlace ? (
              <Link key={promo.id} href={promo.enlace}>
                {chip}
              </Link>
            ) : (
              <span key={promo.id}>{chip}</span>
            )
          })}
        </div>
      )}
    </section>
  )
}
