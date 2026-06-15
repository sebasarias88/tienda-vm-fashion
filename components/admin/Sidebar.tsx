'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard,
  Package,
  Tag,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react'
import ThemeToggle from '@/components/catalog/ThemeToggle'

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/categorias', label: 'Categorías', icon: Tag },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="admin-sidebar fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col border-r border-[rgba(201,168,76,0.26)] bg-[var(--bg-card)] md:flex">

      {/* Logo + tema */}
      <div className="border-b border-[rgba(201,168,76,0.22)] px-5 py-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <Sparkles size={13} className="shrink-0 text-[var(--gold)]" />
              <span className="text-[10px] uppercase tracking-[3px] text-[rgba(201,168,76,0.82)]">
                Admin Panel
              </span>
            </div>
            <p className="gold-shimmer truncate text-[15px] uppercase tracking-[2px]">
              VM Fashion
            </p>
          </div>
          <ThemeToggle variant="admin-desktop" className="shrink-0" />
        </div>
      </div>

      {/* Links */}
      <nav className="flex flex-1 flex-col px-3 py-5">
        <div className="space-y-0.5">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-[2px] px-4 py-3 text-[13px] uppercase tracking-[1.5px] transition-all duration-200 ${
                  active
                    ? 'border border-[rgba(201,168,76,0.45)] bg-[rgba(201,168,76,0.14)] text-[var(--gold)]'
                    : 'text-[var(--text-muted)] hover:bg-[rgba(248,246,241,0.06)] hover:text-[var(--gold-bright)]'
                }`}
              >
                <Icon size={15} strokeWidth={active ? 2 : 1.75} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-[rgba(201,168,76,0.22)] px-3 py-5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-[2px] px-4 py-3 text-[13px] uppercase tracking-[1.5px] text-[var(--text-subtle)] transition-all duration-200 hover:bg-[rgba(255,0,0,0.04)] hover:text-red-400"
        >
          <LogOut size={15} strokeWidth={1.75} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
