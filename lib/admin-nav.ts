import { LayoutDashboard, Package, Tag, Settings, type LucideIcon } from 'lucide-react'

export type AdminNavLink = {
  href: string
  label: string
  icon: LucideIcon
}

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/categorias', label: 'Categorías', icon: Tag },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

export function adminPageTitle(pathname: string): string {
  if (pathname.startsWith('/admin/productos')) return 'Productos'
  if (pathname.startsWith('/admin/categorias')) return 'Categorías'
  if (pathname.startsWith('/admin/configuracion')) return 'Configuración'
  return 'Dashboard'
}
