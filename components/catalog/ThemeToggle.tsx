'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

type ThemeToggleProps = {
  className?: string
  variant?: 'navbar' | 'mobile' | 'admin' | 'admin-desktop'
}

const variantClasses = {
  navbar: 'navbar-action-btn navbar-action-btn--icon',
  'admin-desktop': 'navbar-action-btn navbar-action-btn--icon',
  mobile:
    'mobile-catalog-icon-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] active:bg-[var(--bg-muted)] active:text-[var(--gold)]',
  admin:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] active:bg-[var(--bg-muted)] active:text-[var(--gold)]',
} as const

const iconSize: Record<keyof typeof variantClasses, number> = {
  navbar: 15,
  'admin-desktop': 15,
  mobile: 18,
  admin: 18,
}

export default function ThemeToggle({ className = '', variant = 'navbar' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'
  const baseClass = variantClasses[variant]
  const size = iconSize[variant]

  if (!mounted) {
    return (
      <div className={`${baseClass} opacity-60 ${className}`} aria-hidden />
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`${baseClass} ${className}`}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? <Sun size={size} strokeWidth={1.75} /> : <Moon size={size} strokeWidth={1.75} />}
    </button>
  )
}
