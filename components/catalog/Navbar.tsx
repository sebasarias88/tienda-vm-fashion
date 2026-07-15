'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCarrito } from '@/lib/store'
import { Categoria } from '@/types'
import { catalogPath, type CatalogType } from '@/lib/catalog'
import { Menu, X } from 'lucide-react'
import CartDrawer from '@/components/catalog/CartDrawer'
import LuxuryCartIcon from '@/components/catalog/LuxuryCartIcon'
import MobileHeader from '@/components/catalog/mobile/MobileHeader'

type NavbarProps = {
  nombreNegocio: string
  categorias: Categoria[]
  catalogType?: CatalogType
  hasAnnouncement?: boolean
}

export default function Navbar({
  nombreNegocio,
  categorias,
  catalogType = 'detal',
  hasAnnouncement,
}: NavbarProps) {
  const pathname = usePathname()
  const cantidad = useCarrito(s => s.cantidad())
  const [scrolled, setScrolled] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const isMayoreo = catalogType === 'mayoreo'
  const offsetTop = hasAnnouncement ?? isMayoreo
  const homeHref = catalogPath(catalogType, '/')
  const productosHref = catalogPath(catalogType, '/productos')

  const isHome =
    pathname === homeHref ||
    pathname === `${homeHref}/` ||
    pathname === '/' ||
    (isMayoreo &&
      (pathname === '/mayorista' ||
        pathname === '/mayorista/' ||
        pathname === '/mayoreo' ||
        pathname === '/mayoreo/'))

  // En inicio (sin scroll) siempre modo claro sobre el hero para legibilidad
  const overHero = isHome && !scrolled

  const isNavActive = (href: string) => {
    if (href === homeHref) {
      return pathname === href || pathname === `${href}/` || pathname === '/'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { href: homeHref, label: 'Inicio' },
    { href: productosHref, label: 'Catálogo' },
  ]

  const mobileLinks = [
    ...navLinks,
    ...categorias.slice(0, 5).map(c => ({
      href: `${productosHref}?categoria=${c.slug}`,
      label: c.nombre,
    })),
  ]

  return (
    <>
      <div className="md:hidden">
        <MobileHeader
          nombreNegocio={nombreNegocio}
          categorias={categorias}
          catalogType={catalogType}
          scrolled={scrolled}
          hasAnnouncement={offsetTop}
        />
      </div>

      <motion.header
        className={`fixed left-0 right-0 z-30 hidden transition-all duration-400 md:block ${
          offsetTop ? 'top-9' : 'top-0'
        } ${
          scrolled
            ? 'border-b border-[var(--border)] bg-[var(--navbar-bg)] backdrop-blur-md'
            : overHero
              ? 'bg-gradient-to-b from-black/45 via-black/20 to-transparent'
              : 'bg-transparent'
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href={homeHref} className="min-w-0">
              <span
                className={`block truncate text-[15px] font-medium uppercase tracking-[4px] transition-colors ${
                  overHero
                    ? 'text-[#F8F6F1]'
                    : 'gold-shimmer'
                }`}
              >
                {nombreNegocio}
              </span>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map(({ href, label }) => {
                const active = isNavActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`text-[12px] font-medium uppercase tracking-[2.5px] transition-colors duration-200 ${
                      active
                        ? 'text-[var(--gold-bright)]'
                        : overHero
                          ? 'text-[rgba(248,246,241,0.88)] hover:text-[#F8F6F1]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-2.5">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCartOpen(true)}
                aria-label={`Carrito${mounted && cantidad > 0 ? `, ${cantidad} artículos` : ''}`}
                className={`inline-flex h-9 items-center gap-2 border px-3.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors ${
                  overHero
                    ? 'border-[color-mix(in_srgb,var(--gold)_50%,transparent)] bg-white/15 text-[#F8F6F1] backdrop-blur-sm hover:border-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--text-on-gold)]'
                    : 'border-[color-mix(in_srgb,var(--gold)_40%,var(--border))] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--text-on-gold)]'
                }`}
                style={{ borderRadius: 2 }}
              >
                <LuxuryCartIcon size={15} />
                <span>Carrito</span>
                {mounted && cantidad > 0 && (
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center px-1.5 text-[10px] font-semibold tabular-nums ${
                      overHero
                        ? 'bg-[var(--gold-bright)] text-[var(--text-on-gold)]'
                        : 'bg-[var(--gold)] text-[var(--text-on-gold)]'
                    }`}
                    style={{ borderRadius: 2 }}
                    aria-hidden
                  >
                    {cantidad > 99 ? '99+' : cantidad}
                  </span>
                )}
              </motion.button>

              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] md:hidden"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--navbar-bg)] md:hidden"
            >
              <div className="space-y-1 px-6 py-4">
                {mobileLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="block border-b border-[var(--border-subtle)] py-3 text-[11px] font-light uppercase tracking-[2px] text-[var(--text-muted)] transition-colors last:border-0 hover:text-[var(--gold)]"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <div className="hidden md:block">
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          catalogType={catalogType}
        />
      </div>
    </>
  )
}
