'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Banner } from '@/types'
import { catalogPath, type CatalogType } from '@/lib/catalog'

type CtaLink = {
  label: string
  href: string
}

type HeroBannerProps = {
  banners: Banner[]
  config: Record<string, string>
  catalogType?: CatalogType
  /** @deprecated La marca / CTA viven fuera del banner en el nuevo layout */
  primaryCta?: CtaLink
  eyebrow?: string
}

/**
 * Banner completo, nítido, sin overlays de texto.
 * El flujo editorial (colección, búsqueda, marcas) sigue debajo.
 */
export default function HeroBanner({
  banners,
  config,
  catalogType = 'detal',
}: HeroBannerProps) {
  const [current, setCurrent] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const bannersConImagen = banners.filter(b => b.imagen_url)
  const hasImages = bannersConImagen.length > 0
  const isMayoreo = catalogType === 'mayoreo'

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
    document.documentElement.setAttribute('data-hero-has-image', 'false')
    document.documentElement.setAttribute('data-hero-layout', 'image-only')
    return () => {
      document.documentElement.removeAttribute('data-hero-has-image')
      document.documentElement.removeAttribute('data-hero-layout')
    }
  }, [])

  const currentBanner = bannersConImagen[current]
  const bannerHref = currentBanner?.enlace_boton?.trim() || null

  const pickCopy = (value?: string | null) => {
    const text = value?.trim()
    if (!text || /ritual/i.test(text)) return ''
    return text.replace(/\bmayoreo\b/gi, 'mayorista')
  }
  const fallbackTitle =
    pickCopy(config['hero_titulo']) ||
    (isMayoreo ? 'Precios mayoristas' : 'Belleza y cuidado capilar')
  const fallbackSubtitle =
    pickCopy(config['hero_subtitulo']) ||
    (isMayoreo
      ? pickCopy(config['mayoreo_titulo']) ||
        'Precios especiales para revendedores. Consulta el monto mínimo de pedido.'
      : 'Productos profesionales de belleza y cuidado capilar. Envíos a toda Colombia.')

  return (
    <section
      className="relative w-full bg-[var(--bg-base)] pt-[calc(2.25rem+3.5rem+env(safe-area-inset-top,0px))] md:pt-[calc(2.25rem+4rem)]"
      data-hero-banner="true"
      data-hero-layout="image-only"
      data-hero-has-image="false"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/*
        Mobile: altura natural → se ve el banner completo (sin recorte).
        Desktop: marco fijo + object-cover para presencia editorial.
      */}
      <div className="relative w-full overflow-hidden bg-[var(--bg-muted)] md:h-[min(72svh,760px)] md:min-h-[320px]">
        <AnimatePresence mode="wait">
          {hasImages && currentBanner ? (
            <motion.div
              key={current}
              className="relative w-full md:absolute md:inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {bannerHref ? (
                <Link
                  href={
                    bannerHref.startsWith('http') || bannerHref.startsWith('/')
                      ? bannerHref
                      : catalogPath(catalogType, `/${bannerHref}`)
                  }
                  className="block w-full md:h-full"
                  aria-label={currentBanner.titulo || 'Ver promoción'}
                >
                  <img
                    src={currentBanner.imagen_url}
                    alt={currentBanner.titulo || 'Banner promocional'}
                    className="block h-auto w-full object-contain md:absolute md:inset-0 md:h-full md:object-cover md:object-center"
                  />
                </Link>
              ) : (
                <img
                  src={currentBanner.imagen_url}
                  alt={currentBanner.titulo || 'Banner promocional'}
                  className="block h-auto w-full object-contain md:absolute md:inset-0 md:h-full md:object-cover md:object-center"
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="fallback"
              className="relative flex min-h-[240px] w-full flex-col items-center justify-center px-6 py-16 text-center md:absolute md:inset-0 md:min-h-0 md:py-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-base)] via-[var(--bg-muted)] to-[var(--gold-muted)]" />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 60% 45%, var(--glow-gold) 0%, transparent 60%)',
                }}
              />
              <div className="relative z-10 max-w-xl">
                <h1
                  className="leading-[1.08] text-[var(--text-primary)]"
                  style={{
                    fontSize: 'clamp(1.85rem, 4.5vw, 3rem)',
                    fontWeight: 300,
                    letterSpacing: '-0.015em',
                  }}
                >
                  {fallbackTitle}
                </h1>
                <p className="mt-4 text-[15px] font-light leading-relaxed text-[var(--text-muted)]">
                  {fallbackSubtitle}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {bannersConImagen.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/40 bg-black/30 text-white backdrop-blur-sm transition-all hover:border-[var(--gold)] hover:text-[var(--gold-bright)] sm:left-4 sm:h-11 sm:w-11 md:left-5"
              aria-label="Banner anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/40 bg-black/30 text-white backdrop-blur-sm transition-all hover:border-[var(--gold)] hover:text-[var(--gold-bright)] sm:right-4 sm:h-11 sm:w-11 md:right-5"
              aria-label="Banner siguiente"
            >
              <ChevronRight size={18} />
            </button>

            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-5 md:bottom-6">
              {bannersConImagen.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Ir al banner ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? 'h-1.5 w-7 bg-[var(--gold)]'
                      : 'h-1.5 w-1.5 bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
