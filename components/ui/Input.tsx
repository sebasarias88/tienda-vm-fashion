'use client'

import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  hint?: string
}

const baseInput = `
  admin-input w-full rounded-[2px] border px-4 py-3 text-[13px] font-light
  transition-colors duration-200 disabled:opacity-40
`

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[10px] font-light uppercase tracking-[2px] text-[var(--text-muted)]">
          {label}
        </label>
      )}
      <input className={`${baseInput} ${className}`} {...props} />
      {hint && !error && (
        <p className="text-[10px] font-light tracking-[0.3px] text-[var(--text-subtle)]">{hint}</p>
      )}
      {error && (
        <p className="text-[10px] font-light tracking-[0.3px] text-red-400">{error}</p>
      )}
    </div>
  )
}

export function Textarea({ label, error, hint, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[10px] font-light uppercase tracking-[2px] text-[var(--text-muted)]">
          {label}
        </label>
      )}
      <textarea
        rows={4}
        className={`${baseInput} resize-none ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="text-[10px] font-light tracking-[0.3px] text-[var(--text-subtle)]">{hint}</p>
      )}
      {error && (
        <p className="text-[10px] font-light tracking-[0.3px] text-red-400">{error}</p>
      )}
    </div>
  )
}
