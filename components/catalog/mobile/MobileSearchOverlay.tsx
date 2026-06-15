'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react'
import { catalogPath, type CatalogType } from '@/lib/catalog'
import MobileBottomSheet from '@/components/catalog/mobile/MobileBottomSheet'

const SUGGESTIONS = ['Shampoo', 'Mascarilla', 'Tinte', 'Brocha', 'Keratina']

type MobileSearchOverlayProps = {
  open: boolean
  onClose: () => void
  catalogType?: CatalogType
  initialQuery?: string
}

export default function MobileSearchOverlay({
  open,
  onClose,
  catalogType = 'detal',
  initialQuery = '',
}: MobileSearchOverlayProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(initialQuery)
  const productosPath = catalogPath(catalogType, '/productos')

  useEffect(() => {
    if (open) {
      setQuery(initialQuery)
      const t = setTimeout(() => inputRef.current?.focus(), 200)
      return () => clearTimeout(t)
    }
  }, [open, initialQuery])

  const goSearch = (q: string) => {
    const trimmed = q.trim()
    onClose()
    if (trimmed) {
      router.push(`${productosPath}?q=${encodeURIComponent(trimmed)}`)
    } else {
      router.push(productosPath)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goSearch(query)
  }

  return (
    <MobileBottomSheet
      open={open}
      onClose={onClose}
      title="Buscar"
      subtitle="Encuentra productos de belleza"
      height="auto"
      showClose={false}
    >
      <div className="px-5 pb-6 pt-1">
        <form onSubmit={handleSubmit} className="relative mb-5">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
          />
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            enterKeyHint="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Nombre, SKU o categoría…"
            className="h-[52px] w-full rounded-xl border border-[var(--border-input)] bg-[var(--bg-muted)] pl-11 pr-[4.25rem] text-[15px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--placeholder)] focus:border-[var(--gold)] focus:bg-[var(--bg-card)]"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mobile-catalog-icon-btn absolute right-14 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)]"
              aria-label="Limpiar"
            >
              <X size={16} />
            </button>
          ) : null}
          <button
            type="submit"
            className="catalog-gold-cta absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg"
            aria-label="Buscar"
          >
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-[var(--gold)]" />
          <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--text-subtle)]">
            Populares
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(term => (
            <button
              key={term}
              type="button"
              onClick={() => goSearch(term)}
              className="rounded-xl border border-[var(--border-input)] bg-[var(--bg-card)] px-4 py-2 text-[12px] font-medium text-[var(--text-secondary)] active:border-[var(--gold)] active:bg-[var(--gold-muted)] active:text-[var(--gold)]"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </MobileBottomSheet>
  )
}
