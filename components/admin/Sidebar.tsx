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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--bg-card)] border-r border-[rgba(201,168,76,0.26)] flex flex-col z-20">

      {/* Logo */}
      <div className="px-6 py-7 border-b border-[rgba(201,168,76,0.22)]">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-[var(--gold)]" />
          <span className="text-[11px] tracking-[3px] uppercase text-[rgba(201,168,76,0.82)] font-light">
            Admin Panel
          </span>
        </div>
        <p className="gold-shimmer text-[16px] font-thin uppercase tracking-[2px]">
          VM Fashion
        </p>
      </div>

      {/* Links */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-[2px] text-[13px] tracking-[1.5px] uppercase font-light transition-all duration-200 ${
                active
                  ? 'bg-[rgba(201,168,76,0.14)] text-[var(--gold)] border border-[rgba(201,168,76,0.45)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--gold-bright)] hover:bg-[rgba(248,246,241,0.06)]'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Tema */}
      <div className="px-3 py-4 border-t border-[rgba(201,168,76,0.22)]">
        <div className="flex items-center justify-between gap-3 rounded-[2px] px-4 py-2">
          <span className="text-[10px] font-light uppercase tracking-[2px] text-[var(--text-subtle)]">
            Apariencia
          </span>
          <ThemeToggle showLabel />
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 py-5 border-t border-[rgba(201,168,76,0.22)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-[2px] text-[13px] tracking-[1.5px] uppercase font-light text-[var(--text-subtle)] hover:text-red-400 hover:bg-[rgba(255,0,0,0.04)] transition-all duration-200"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
