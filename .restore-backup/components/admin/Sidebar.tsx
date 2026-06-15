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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#111111] border-r border-[rgba(184,146,42,0.26)] flex flex-col z-20">

      {/* Logo */}
      <div className="px-6 py-7 border-b border-[rgba(184,146,42,0.22)]">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-gold" style={{ color: '#B8922A' }} />
          <span className="text-[11px] tracking-[3px] uppercase text-[rgba(184,146,42,0.82)] font-light">
            Admin Panel
          </span>
        </div>
        <p className="text-[16px] tracking-[2px] uppercase font-light text-[#1A1A1A]">
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
                  ? 'bg-[rgba(184,146,42,0.14)] text-[#C9A84C] border border-[rgba(184,146,42,0.45)]'
                  : 'text-[rgba(240,235,228,0.78)] hover:text-[#1A1A1A] hover:bg-[rgba(240,235,228,0.06)]'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-5 border-t border-[rgba(184,146,42,0.22)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-[2px] text-[13px] tracking-[1.5px] uppercase font-light text-[rgba(240,235,228,0.58)] hover:text-red-400 hover:bg-[rgba(255,0,0,0.04)] transition-all duration-200"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
