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
  w-full bg-[var(--bg-card)] border border-[rgba(240,235,228,0.22)]
  rounded-[2px] px-4 py-3 text-[13px] font-light text-[#f0ebe4]
  placeholder:text-[rgba(240,235,228,0.48)]
  focus:outline-none focus:border-[rgba(201,168,76,0.65)]
  transition-colors duration-200
  disabled:opacity-40
`

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[10px] tracking-[2px] uppercase text-[rgba(240,235,228,0.65)] font-light">
          {label}
        </label>
      )}
      <input className={`${baseInput} ${className}`} {...props} />
      {hint && !error && (
        <p className="text-[10px] text-[rgba(240,235,228,0.58)] font-light tracking-[0.3px]">{hint}</p>
      )}
      {error && (
        <p className="text-[10px] text-red-400 font-light tracking-[0.3px]">{error}</p>
      )}
    </div>
  )
}

export function Textarea({ label, error, hint, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[10px] tracking-[2px] uppercase text-[rgba(240,235,228,0.65)] font-light">
          {label}
        </label>
      )}
      <textarea
        rows={4}
        className={`${baseInput} resize-none ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="text-[10px] text-[rgba(240,235,228,0.58)] font-light tracking-[0.3px]">{hint}</p>
      )}
      {error && (
        <p className="text-[10px] text-red-400 font-light tracking-[0.3px]">{error}</p>
      )}
    </div>
  )
}
