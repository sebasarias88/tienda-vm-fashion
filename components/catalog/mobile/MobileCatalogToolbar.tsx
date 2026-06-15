'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'

type MobileCatalogToolbarProps = {
  inputValue: string
  onInputChange: (value: string) => void
  onSearch: () => void
  onClearSearch: () => void
  onOpenFilters: () => void
  activeFiltersCount: number
}

export default function MobileCatalogToolbar({
  inputValue,
  onInputChange,
  onSearch,
  onClearSearch,
  onOpenFilters,
  activeFiltersCount,
}: MobileCatalogToolbarProps) {
  const hasFilters = activeFiltersCount > 0

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        onSearch()
      }}
      className="mobile-catalog-toolbar flex items-center gap-2.5"
    >
      <div className="mobile-catalog-search relative min-w-0 flex-1">
        <label className="sr-only" htmlFor="mobile-catalog-search">
          Buscar productos
        </label>
        <div className="mobile-catalog-search-field flex h-[50px] items-center gap-1 rounded-xl px-1">
          <Search
            size={17}
            strokeWidth={1.75}
            className="pointer-events-none ml-3 shrink-0 text-[var(--text-subtle)]"
            aria-hidden
          />
          <input
            id="mobile-catalog-search"
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={inputValue}
            onChange={e => onInputChange(e.target.value)}
            placeholder="Buscar productos…"
            className="min-w-0 flex-1 bg-transparent py-0 pl-1 pr-2 text-[15px] font-normal text-[var(--text-primary)] outline-none placeholder:text-[var(--placeholder)]"
          />
          {inputValue ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="mobile-catalog-icon-btn mobile-catalog-search-clear mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] active:scale-95"
              aria-label="Limpiar búsqueda"
            >
              <X size={15} strokeWidth={2} />
            </button>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenFilters}
        aria-label={`Filtros${hasFilters ? `, ${activeFiltersCount} activos` : ''}`}
        className={`mobile-catalog-filters relative flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl active:scale-[0.97] ${
          hasFilters ? 'mobile-catalog-filters--active' : ''
        }`}
      >
        <SlidersHorizontal size={18} strokeWidth={1.75} />
        {hasFilters ? (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full  bg-[var(--gold)] px-1 text-[9px] font-bold leading-none text-[var(--text-on-gold)]"
            aria-hidden
          >
            {activeFiltersCount}
          </span>
        ) : null}
      </button>
    </form>
  )
}
