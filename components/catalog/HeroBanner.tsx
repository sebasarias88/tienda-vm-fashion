'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight, Search, X } from 'lucide-react'
import { Banner } from '@/types'
import { catalogPath, type CatalogType } from '@/lib/catalog'
import { useGuardedRouter } from '@/lib/useGuardedRouter'
import { CIUDAD_NEGOCIO } from '@/lib/negocio'

type CtaLink = {
  label: string
  href: string
}

type HeroBannerProps = {
  banners: Banner[]
  config: Record<string, string>
  catalogType?: CatalogType
  primaryCta?: CtaLink
  eyebrow?: string
}

type SparklePos = {
  top: string
  left?: string
  right?: string
  size: number
  delay: number
}

const SPARKLES: SparklePos[] = [
  { top: '15%', left: '5%', size: 20, delay: 0 },
  { top: '10%', right: '8%', size: 28, delay: 1.5 },
  { top: '70%', right: '5%', size: 16, delay: 0.8 },
  { top: '55%', left: '12%', size: 14, delay: 2.2 },
  { top: '35%', right: '18%', size: 12, delay: 0.4 },
]

export default function HeroBanner({
  banners,
  config,
  catalogType = 'detal',
  primaryCta,
  eyebrow = 'Belleza & Cuidado Capilar',
}: HeroBannerProps) {
  const router = useGuardedRouter()
  const [current, setCurrent] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [query, setQuery] = useState('')

  const bannersConImagen = banners.filter(b => b.imagen_url)
  const hasImages = bannersConImagen.length > 0
  const isMayoreo = catalogType === 'mayoreo'

  const defaultPrimary: CtaLink = primaryCta ?? {
    label: 'Explorar catálogo',
    href: catalogPath(catalogType, '/productos'),
  }

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % Math.max(bannersConImagen.length, 1))
  }, [bannersConImagen.length])

  const prev = () => {
    setCurrent(c =>
      (c - 1 + Math.max(bannersConImagen.length, 1)) % Math.max(bannersConImagen.length, 1),
    )
  }

  useEffect(() => {
    if (!isPlaying || bannersConImagen.length <= 1) return
    const timer = setInterval(next, 5500)
    return () => clearInterval(timer)
  }, [isPlaying, next, bannersConImagen.length])

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-hero-has-image',
      hasImages ? 'true' : 'false',
    )
    return () => {
      document.documentElement.removeAttribute('data-hero-has-image')
    }
  }, [hasImages])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(
      `${catalogPath(catalogType, '/productos')}?q=${encodeURIComponent(q)}`,
    )
  }

  const currentBanner = bannersConImagen[current]
  const titulo =
    currentBanner?.titulo ||
    config['hero_titulo'] ||
    (isMayoreo ? 'Precios mayoristas' : 'Tu ritual de belleza ideal')
  const subtitulo =
    currentBanner?.subtitulo ||
    config['hero_subtitulo'] ||
    (isMayoreo
      ? config['mayoreo_titulo'] ||
        'Precios especiales para revendedores. Consulta el monto mínimo de pedido.'
      : 'Productos profesionales de belleza y cuidado capilar. Envíos a toda Colombia.')

  const ctaHref =
    currentBanner?.texto_boton && currentBanner?.enlace_boton
      ? currentBanner.enlace_boton
      : defaultPrimary.href
  const ctaLabel =
    currentBanner?.texto_boton && currentBanner?.enlace_boton
      ? currentBanner.texto_boton
      : defaultPrimary.label

  return (
    <section
      className="relative flex h-[100svh] min-h-[100svh] w-full flex-col overflow-hidden bg-[var(--bg-base)]"
      data-hero-banner="true"
      data-hero-has-image={hasImages ? 'true' : 'false'}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      <AnimatePresence mode="wait">
        {hasImages && currentBanner ? (
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={currentBanner.imagen_url}
              alt={currentBanner.titulo || 'Banner'}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(13,13,13,0.82)] via-[rgba(13,13,13,0.45)] to-[rgba(13,13,13,0.18)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,13,13,0.65)] via-transparent to-transparent" />
          </motion.div>
        ) : (
          <motion.div
            key="fallback"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-base)] via-[var(--bg-muted)] to-[var(--gold-muted)]" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 70% 50%, var(--glow-gold) 0%, transparent 60%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brillos / sparkles */}
      {SPARKLES.map((s, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute z-[5]"
          style={{ top: s.top, left: s.left, right: s.right }}
          animate={{
            opacity: [0, 0.85, 0.4, 0.95, 0],
            scale: [0.8, 1.15, 0.9, 1.2, 0.8],
          }}
          transition={{ duration: 3 + i * 0.35, repeat: Infinity, delay: s.delay }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 40 40">
            <defs>
              <linearGradient id={`hero-sg${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--gold-bright)" />
                <stop offset="50%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="var(--gold)" />
              </linearGradient>
            </defs>
            <path
              d="M20,2 L21.5,18.5 L38,20 L21.5,21.5 L20,38 L18.5,21.5 L2,20 L18.5,18.5 Z"
              fill={`url(#hero-sg${i})`}
            />
          </svg>
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-20 lg:pt-36">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${current}`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <div className="mb-5 flex items-center gap-3">
              <motion.div
                className="h-px bg-[var(--gold)]"
                initial={{ width: 0 }}
                animate={{ width: 32 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />
              <span className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--gold)]">
                {eyebrow}
              </span>
            </div>

            <h1
              className="leading-[1.08]"
              style={{
                fontSize: 'clamp(2.25rem, 5.5vw, 3.75rem)',
                fontWeight: 300,
                letterSpacing: '-0.015em',
                color: hasImages ? '#FFFFFF' : 'var(--text-primary)',
                textShadow: hasImages
                  ? '0 1px 3px rgba(0,0,0,0.95), 0 2px 18px rgba(0,0,0,0.55)'
                  : undefined,
              }}
            >
              {titulo.includes('belleza') || titulo.includes('Belleza') ? (
                <>
                  {titulo.split(/(belleza|Belleza)/i).map((part, i) =>
                    /belleza/i.test(part) ? (
                      <span key={i} className="gold-shimmer" style={{ fontWeight: 300 }}>
                        {part}
                      </span>
                    ) : (
                      <span key={i}>{part}</span>
                    ),
                  )}
                </>
              ) : (
                titulo
              )}
            </h1>

            {subtitulo && (
              <p
                className={`mt-5 max-w-lg text-[15px] font-light leading-[1.75] sm:text-[16px] ${
                  hasImages
                    ? 'text-[rgba(248,246,241,0.72)]'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                {subtitulo}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
              <Link
                href={ctaHref}
                className="group inline-flex items-center justify-center gap-2 bg-[var(--gold)] px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-on-gold)] transition-colors hover:bg-[var(--gold-bright)]"
              >
                {ctaLabel}
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            <form
              onSubmit={handleSearch}
              onFocus={() => setIsPlaying(false)}
              onBlur={() => setIsPlaying(true)}
              className="mt-8 max-w-md"
            >
              <div
                className={`relative flex items-center border-b-2 transition-colors focus-within:border-[var(--gold)] ${
                  hasImages
                    ? 'border-[rgba(248,246,241,0.35)]'
                    : 'border-[var(--border-input)]'
                }`}
              >
                <Search
                  size={15}
                  className={`pointer-events-none shrink-0 ${
                    hasImages ? 'text-[rgba(248,246,241,0.55)]' : 'text-[var(--text-subtle)]'
                  }`}
                />
                <input
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar shampoo, mascarillas, tintes..."
                  aria-label="Buscar productos"
                  className={`min-w-0 flex-1 bg-transparent py-3.5 pl-3 pr-2 text-[14px] font-light outline-none ${
                    hasImages
                      ? 'text-[#F8F6F1] placeholder:text-[rgba(248,246,241,0.45)]'
                      : 'text-[var(--text-primary)] placeholder:text-[var(--placeholder)]'
                  }`}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Limpiar búsqueda"
                    className={`mr-1 p-1 transition-colors ${
                      hasImages
                        ? 'text-[rgba(248,246,241,0.55)] hover:text-[#F8F6F1]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="submit"
                  className="shrink-0 px-1 py-3.5 text-[10px] font-medium uppercase tracking-[1.5px] text-[var(--gold)] transition-colors hover:text-[var(--gold-bright)]"
                >
                  Buscar
                </button>
              </div>
            </form>

            <p
              className={`mt-6 text-[11px] font-light uppercase tracking-[1.5px] ${
                hasImages
                  ? 'text-[rgba(248,246,241,0.65)]'
                  : 'text-[var(--text-subtle)]'
              }`}
            >
              {CIUDAD_NEGOCIO} — Envíos a toda Colombia
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {bannersConImagen.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className={`absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border backdrop-blur-sm transition-all sm:left-5 md:flex ${
              hasImages
                ? 'border-[color-mix(in_srgb,var(--gold)_30%,transparent)] bg-[rgba(18,16,14,0.45)] text-[#F8F6F1] hover:border-[var(--gold)] hover:text-[var(--gold-bright)]'
                : 'border-[color-mix(in_srgb,var(--gold)_25%,transparent)] bg-[var(--bg-glass)] text-[var(--text-muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]'
            }`}
            aria-label="Banner anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={next}
            className={`absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border backdrop-blur-sm transition-all sm:right-5 md:flex ${
              hasImages
                ? 'border-[color-mix(in_srgb,var(--gold)_30%,transparent)] bg-[rgba(18,16,14,0.45)] text-[#F8F6F1] hover:border-[var(--gold)] hover:text-[var(--gold-bright)]'
                : 'border-[color-mix(in_srgb,var(--gold)_25%,transparent)] bg-[var(--bg-glass)] text-[var(--text-muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]'
            }`}
            aria-label="Banner siguiente"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {bannersConImagen.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Ir al banner ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'h-1.5 w-7 bg-[var(--gold)]'
                    : hasImages
                      ? 'h-1.5 w-1.5 bg-[rgba(248,246,241,0.35)] hover:bg-[rgba(248,246,241,0.55)]'
                      : 'h-1.5 w-1.5 bg-[color-mix(in_srgb,var(--gold)_35%,transparent)]'
                }`}
              />
            ))}
          </div>
        </>
      )}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-[var(--bg-base)] via-[color-mix(in_srgb,var(--bg-base)_45%,transparent)] to-transparent" />
    </section>
  )
}
