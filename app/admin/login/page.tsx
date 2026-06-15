'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react'
import ThemeToggle from '@/components/catalog/ThemeToggle'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      const msg =
        authError.message === 'Email not confirmed'
          ? 'Confirma tu correo en Supabase antes de ingresar'
          : authError.message === 'Invalid login credentials'
            ? 'Correo o contraseña incorrectos'
            : authError.message
      setError(msg)
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-4">

      <div className="absolute right-4 top-4 z-10 mobile-safe-top">
        <ThemeToggle variant="mobile" />
      </div>

      {/* Glow de fondo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle,var(--glow-gold-strong)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-sm relative">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-8 bg-[var(--gold)] opacity-60" />
            <Sparkles size={14} className="text-[var(--gold)]" />
            <div className="h-px w-8 bg-[var(--gold)] opacity-60" />
          </div>
          <h1 className="text-3xl tracking-[4px] uppercase font-thin text-[var(--text-primary)] mb-2">
            VM Fashion
          </h1>
          <p className="text-[12px] tracking-[2.5px] uppercase text-[var(--text-subtle)] font-light">
            Panel de administración
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-[11px] tracking-[2px] uppercase text-[var(--text-muted)] font-light mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@vmfashion.com"
              className="admin-input w-full rounded-xl border px-4 py-3 text-[13px] font-light transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] tracking-[2px] uppercase text-[var(--text-muted)] font-light mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="admin-input w-full rounded-xl border px-4 py-3 pr-12 text-[13px] font-light transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--gold)] transition-colors"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[11px] text-red-400 tracking-[0.5px] font-light">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="admin-gold-cta mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[12px] font-medium uppercase tracking-[3px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[12px] tracking-[1px] text-[var(--text-subtle)] font-light mt-8">
          Tienda VM Fashion © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
