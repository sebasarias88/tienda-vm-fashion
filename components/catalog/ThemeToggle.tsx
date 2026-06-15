'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

type ThemeToggleProps = {
  className?: string
  showLabel?: boolean
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  if (!mounted) {
    return (
      <div
        className={`navbar-action-btn navbar-action-btn--icon opacity-60 ${className}`}
        aria-hidden
      />
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`navbar-action-btn ${showLabel ? 'navbar-action-btn--labeled' : 'navbar-action-btn--icon'} ${className}`}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? <Sun size={15} strokeWidth={1.75} /> : <Moon size={15} strokeWidth={1.75} />}
      {showLabel && (
        <span className="text-[10px] font-medium uppercase tracking-[1.5px]">
          {isDark ? 'Claro' : 'Oscuro'}
        </span>
      )}
    </button>
  )
}
