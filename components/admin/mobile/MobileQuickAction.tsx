'use client'

import Link from 'next/link'
import { ArrowRight, LucideIcon } from 'lucide-react'

type MobileQuickActionProps = {
  href: string
  label: string
  description: string
  icon: LucideIcon
}

export default function MobileQuickAction({
  href,
  label,
  description,
  icon: Icon,
}: MobileQuickActionProps) {
  return (
    <Link
      href={href}
      className="mobile-admin-quick-action flex min-h-[56px] items-center gap-3 border-b border-[rgba(201,168,76,0.1)] px-4 py-3 last:border-b-0 active:bg-[rgba(201,168,76,0.06)]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(201,168,76,0.22)] bg-[rgba(201,168,76,0.08)]">
        <Icon size={17} className="text-[var(--gold)]" strokeWidth={1.5} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium uppercase tracking-[0.8px] text-[var(--text-primary)]">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[11px] font-light text-[var(--text-subtle)]">{description}</p>
      </div>
      <ArrowRight size={15} className="shrink-0 text-[var(--text-faint)]" />
    </Link>
  )
}
