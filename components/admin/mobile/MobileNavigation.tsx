'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Sparkles, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { ADMIN_NAV_LINKS } from '@/lib/admin-nav'

type MobileNavigationProps = {
  open: boolean
  onClose: () => void
}

export default function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onClose()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="mobile-admin-nav fixed left-0 top-0 z-[70] flex h-[100dvh] w-[min(100%,18.5rem)] flex-col border-r border-[rgba(201,168,76,0.22)] bg-[var(--bg-card)] md:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
          >
            <div className="mobile-admin-bar border-b border-[rgba(201,168,76,0.22)]">
              <div className="mobile-admin-bar-row items-start justify-between">
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <Sparkles size={13} className="text-[var(--gold)]" />
                  <span className="text-[10px] uppercase tracking-[2.5px] text-[rgba(201,168,76,0.82)]">
                    Admin
                  </span>
                </div>
                <p className="gold-shimmer text-[15px] font-thin uppercase tracking-[2px]">VM Fashion</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] active:bg-[var(--bg-muted)]"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {ADMIN_NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`mb-1 flex min-h-[48px] items-center gap-3 rounded-xl px-4 text-[12px] uppercase tracking-[1.2px] ${
                      active
                        ? 'border border-[rgba(201,168,76,0.45)] bg-[rgba(201,168,76,0.14)] text-[var(--gold)]'
                        : 'text-[var(--text-muted)] active:bg-[var(--bg-muted)]'
                    }`}
                  >
                    <Icon size={16} strokeWidth={1.5} />
                    {label}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-[rgba(201,168,76,0.22)] px-4 py-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-2 text-[12px] uppercase tracking-[1.2px] text-[var(--text-subtle)] active:text-red-400"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
