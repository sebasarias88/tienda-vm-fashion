'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  className?: string
  fullWidth?: boolean
}

const variants = {
  primary: 'ui-btn--primary',
  outline: 'ui-btn--outline',
  ghost: 'ui-btn--ghost',
  danger: 'bg-transparent text-red-400 border border-[rgba(248,113,113,0.3)] hover:bg-[rgba(248,113,113,0.06)]',
}

const sizes = {
  sm: 'px-3 py-2 text-[10px] tracking-[2px]',
  md: 'px-5 py-3 text-[11px] tracking-[2.5px]',
  lg: 'px-8 py-4 text-[12px] tracking-[3px]',
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      whileTap={{ scale: 0.98 }}
      className={`
        ui-btn relative inline-flex items-center justify-center gap-2
        rounded-xl font-light uppercase transition-all duration-200 md:rounded-[2px]
        cursor-pointer disabled:cursor-not-allowed
        ${loading ? 'cursor-wait' : 'disabled:opacity-40'}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {/*
        The label stays in place (invisible) while loading so the button keeps
        its exact size; the spinner sits on top of it.
      */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center" role="status">
          <Loader2 size={14} className="animate-spin" aria-hidden />
          <span className="sr-only">Cargando…</span>
        </span>
      )}
      <span className={`inline-flex items-center gap-2 ${loading ? 'invisible' : ''}`}>
        {children}
      </span>
    </motion.button>
  )
}
