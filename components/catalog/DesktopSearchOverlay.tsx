'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Search, Tag, TrendingUp, X } from 'lucide-react'
import { catalogPath, type CatalogType } from '@/lib/catalog'
import { useGuardedRouter } from '@/lib/useGuardedRouter'
import { SEARCH_SUGGESTIONS } from '@/lib/search-suggestions'
import type { Categoria } from '@/types'

type Props = {
  open: boolean
  onClose: () => void
  catalogType?: CatalogType
  categorias?: Categoria[]
}

/**
 * Overlay de búsqueda desktop: campo amplio + categorías + sugerencias.
 */
export default function DesktopSearchOverlay({
  open,
  onClose,
  catalogType = 'detal',
  categorias = [],
}: Props) {
  const router = useGuardedRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const [query, setQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const productosPath = catalogPath(catalogType, '/productos')
  const categoriasRapidas = categorias.slice(0, 6)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const goSearch = (q: string) => {
    const trimmed = q.trim()
    onClose()
    router.push(
      trimmed
        ? `${productosPath}?q=${encodeURIComponent(trimmed)}`
        : productosPath,
    )
  }

  const goCategoria = (slug: string) => {
    onClose()
    router.push(`${productosPath}?categoria=${encodeURIComponent(slug)}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goSearch(query)
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center px-6 pt-[min(18vh,9rem)] pb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <button
            type="button"
            aria-label="Cerrar búsqueda"
            className="absolute inset-0 bg-[rgba(18,16,14,0.48)] backdrop-blur-[6px]"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[0_24px_80px_rgba(34,34,34,0.18)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
              <div>
                <p id={titleId} className="catalog-eyebrow tracking-[3px]">
                  Buscar
                </p>
                <p className="mt-1 text-[13px] font-light text-[var(--text-muted)]">
                  Encuentra productos y categorías
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="inline-flex h-9 w-9 items-center justify-center border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                style={{ borderRadius: 2 }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-6">
              <form onSubmit={handleSubmit}>
                <div className="relative flex items-center border-b-2 border-[var(--border-input)] transition-colors focus-within:border-[var(--gold)]">
                  <Search
                    size={18}
                    className="pointer-events-none shrink-0 text-[var(--text-subtle)]"
                  />
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Shampoo, mascarillas, tintes…"
                    aria-label="Buscar productos"
                    className="min-w-0 flex-1 bg-transparent py-4 pl-3 pr-2 text-[17px] font-light text-[var(--text-primary)] outline-none placeholder:text-[var(--placeholder)]"
                    autoComplete="off"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('')
                        inputRef.current?.focus()
                      }}
                      aria-label="Limpiar"
                      className="mr-2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      <X size={15} />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="catalog-gold-cta ml-1 inline-flex h-10 w-10 shrink-0 items-center justify-center"
                    style={{ borderRadius: 2 }}
                    aria-label="Buscar"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>

              {categoriasRapidas.length > 0 && (
                <div className="mt-8">
                  <div className="mb-3 flex items-center gap-2">
                    <Tag size={13} className="text-[var(--gold)]" />
                    <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--text-subtle)]">
                      Categorías
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categoriasRapidas.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => goCategoria(cat.slug)}
                        className="border border-[var(--border)] bg-[var(--bg-base)] px-3.5 py-2 text-[11px] font-light uppercase tracking-[1.2px] text-[var(--text-secondary)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                      >
                        {cat.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp size={13} className="text-[var(--gold)]" />
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--text-subtle)]">
                    Populares
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SEARCH_SUGGESTIONS.map(term => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => goSearch(term)}
                      className="border border-[var(--border)] bg-[var(--bg-base)] px-3.5 py-2 text-[12px] font-light text-[var(--text-secondary)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
