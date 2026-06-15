'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { Categoria } from '@/types'
import { catalogPath, type CatalogType } from '@/lib/catalog'
import MobileDrawer from '@/components/catalog/mobile/MobileDrawer'
import ThemeToggle from '@/components/catalog/ThemeToggle'

type MobileNavDrawerProps = {
  open: boolean
  onClose: () => void
  nombreNegocio: string
  categorias: Categoria[]
  catalogType?: CatalogType
}

export default function MobileNavDrawer({
  open,
  onClose,
  nombreNegocio,
  categorias,
  catalogType = 'detal',
}: MobileNavDrawerProps) {
  const pathname = usePathname()
  const homeHref = catalogPath(catalogType, '/')
  const productosHref = catalogPath(catalogType, '/productos')
  const isMayoreo = catalogType === 'mayoreo'

  const isNavActive = (href: string) => {
    if (href === homeHref) {
      return pathname === href || pathname === `${href}/`
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const navLinks = [
    { href: homeHref, label: 'Inicio' },
    { href: productosHref, label: 'Catálogo' },
  ]

  return (
    <MobileDrawer
      open={open}
      onClose={onClose}
      side="left"
      footer={
        <div className="flex items-center justify-between px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
          <span className="text-[10px] font-medium uppercase tracking-[1.5px] text-[var(--text-faint)]">
            Tema
          </span>
          <ThemeToggle variant="admin" />
        </div>
      }
      header={
        <div className="min-w-0 pr-2">
          <div className="mb-1.5 flex items-center gap-2">
            <Sparkles size={14} className="shrink-0 text-[var(--gold)]" />
            <span className="text-[10px] font-medium uppercase tracking-[2.5px] text-[var(--text-subtle)]">
              Navegación
            </span>
          </div>
          <p className="gold-shimmer truncate text-[15px] font-thin uppercase tracking-[3px]">
            {nombreNegocio}
          </p>
          {isMayoreo && (
            <span className="mt-2 inline-flex rounded-xl border border-[var(--border)] bg-[var(--gold-muted)] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[1.5px] text-[var(--gold)]">
              Mayoreo
            </span>
          )}
        </div>
      }
    >
      <div className="flex h-full flex-col">
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`mb-1 flex min-h-[48px] items-center rounded-xl px-4 text-[12px] font-medium uppercase tracking-[2px] transition-colors ${
                isNavActive(href)
                  ? 'bg-[var(--gold-muted)] text-[var(--gold)]'
                  : 'text-[var(--text-secondary)] active:bg-[var(--bg-muted)]'
              }`}
            >
              {label}
            </Link>
          ))}

          {categorias.length > 0 && (
            <>
              <p className="mb-2 mt-6 px-3 text-[10px] font-medium uppercase tracking-[2px] text-[var(--text-faint)]">
                Categorías
              </p>
              {categorias.map(cat => (
                <Link
                  key={cat.id}
                  href={`${productosHref}?categoria=${cat.slug}`}
                  onClick={onClose}
                  className="mb-1 flex min-h-[48px] items-center rounded-xl px-4 text-[12px] font-light uppercase tracking-[1.5px] text-[var(--text-muted)] transition-colors active:bg-[var(--bg-muted)] active:text-[var(--gold)]"
                >
                  {cat.nombre}
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>
    </MobileDrawer>
  )
}
