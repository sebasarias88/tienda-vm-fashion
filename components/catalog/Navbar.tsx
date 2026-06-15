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

type NavbarProps = {
  nombreNegocio: string
  categorias: Categoria[]
  catalogType?: CatalogType
}

export default function Navbar({
  nombreNegocio,
  categorias,
  catalogType = 'detal',
}: NavbarProps) {
  const pathname = usePathname()
  const cantidad = useCarrito(s => s.cantidad())
  const [scrolled, setScrolled] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const isMayoreo = catalogType === 'mayoreo'
  const homeHref = catalogPath(catalogType, '/')
  const productosHref = catalogPath(catalogType, '/productos')

  const isNavActive = (href: string) => {
    if (href === homeHref) {
      return pathname === href || pathname === `${href}/`
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

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
      <motion.header
        className={`fixed left-0 right-0 z-30 transition-all duration-500 ${
          isMayoreo ? 'top-9' : 'top-0'
        } ${
          scrolled
            ? 'bg-[var(--navbar-bg)] backdrop-blur-md border-b border-[var(--border)]'
            : 'bg-transparent'
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <Link href={homeHref}>
              <motion.div
                whileHover={{ opacity: 0.8 }}
                className="flex items-center gap-2"
              >
                <span className="gold-shimmer text-[15px] font-thin uppercase tracking-[4px]">
                  {nombreNegocio}
                </span>
                {isMayoreo && (
                  <span className="rounded-[2px] border border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.12)] px-1.5 py-0.5 text-[8px] font-light uppercase tracking-[1.5px] text-[var(--gold)]">
                    Mayoreo
                  </span>
                )}
              </motion.div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-[12px] tracking-[2.5px] uppercase font-light transition-colors duration-200 ${
                    isNavActive(href)
                      ? 'text-[var(--gold)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setCartOpen(true)}
                className="gold-border-glow relative flex items-center gap-2 rounded-[2px] border border-[rgba(201,168,76,0.5)] px-4 py-2 text-[12px] font-light uppercase tracking-[2px] text-[var(--gold)] transition-all hover:bg-[var(--gold-muted)]"
              >
                <LuxuryCartIcon size={16} />
                <span className="hidden sm:inline">Carrito</span>
                {mounted && cantidad > 0 && (
                  <span className="w-4 h-4 bg-[var(--gold)] text-[var(--bg-base)] rounded-full text-[9px] font-medium flex items-center justify-center">
                    {cantidad}
                  </span>
                )}
              </motion.button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
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
              className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--navbar-bg)] overflow-hidden"
            >
              <div className="px-6 py-4 space-y-1">
                {mobileLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="block py-3 text-[11px] tracking-[2px] uppercase font-light text-[var(--text-muted)] hover:text-[var(--gold)] border-b border-[var(--border-subtle)] transition-colors last:border-0"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        catalogType={catalogType}
      />
    </>
  )
}
