'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { adminPageTitle } from '@/lib/admin-nav'
import MobileAdminHeader from '@/components/admin/mobile/MobileAdminHeader'
import MobileNavigation from '@/components/admin/mobile/MobileNavigation'
import ThemeToggle from '@/components/catalog/ThemeToggle'

export default function MobileAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)

  return (
    <>
      <div className="md:hidden">
        <MobileAdminHeader
          title={adminPageTitle(pathname)}
          onMenuOpen={() => setNavOpen(true)}
          action={<ThemeToggle variant="admin" />}
        />
        <MobileNavigation open={navOpen} onClose={() => setNavOpen(false)} />
      </div>
      {children}
    </>
  )
}
