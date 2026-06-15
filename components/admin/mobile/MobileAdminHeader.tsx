'use client'

import { Menu } from 'lucide-react'
import { ReactNode } from 'react'

type MobileAdminHeaderProps = {
  title: string
  subtitle?: string
  onMenuOpen: () => void
  action?: ReactNode
}

export default function MobileAdminHeader({
  title,
  subtitle,
  onMenuOpen,
  action,
}: MobileAdminHeaderProps) {
  return (
    <header className="mobile-admin-header fixed left-0 right-0 top-0 z-50 border-b border-[rgba(201,168,76,0.18)] bg-[var(--bg-card)]/95 backdrop-blur-md">
      <div className="mobile-admin-bar">
        <div className="mobile-admin-bar-row">
          <button
          type="button"
          onClick={onMenuOpen}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] active:bg-[var(--bg-muted)] active:text-[var(--gold)]"
          aria-label="Abrir menú"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[13px] font-light uppercase tracking-[2px] text-[var(--text-primary)]">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-[11px] font-light text-[var(--text-muted)]">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
    </header>
  )
}
