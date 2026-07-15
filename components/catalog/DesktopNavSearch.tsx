'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import type { CatalogType } from '@/lib/catalog'
import type { Categoria } from '@/types'
import DesktopSearchOverlay from '@/components/catalog/DesktopSearchOverlay'

type Props = {
  catalogType?: CatalogType
  categorias?: Categoria[]
  /** Estilos cuando el nav va sobre foto oscura */
  light?: boolean
}

/**
 * Lupa del navbar desktop → abre overlay de búsqueda.
 */
export default function DesktopNavSearch({
  catalogType = 'detal',
  categorias = [],
  light = false,
}: Props) {
  const [open, setOpen] = useState(false)

  const iconClass = light
    ? 'border-[color-mix(in_srgb,var(--gold)_50%,transparent)] bg-white/15 text-[#F8F6F1] hover:border-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--text-on-gold)]'
    : 'border-[color-mix(in_srgb,var(--gold)_40%,var(--border))] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar productos"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex h-9 w-9 items-center justify-center border transition-colors ${iconClass}`}
        style={{ borderRadius: 2 }}
      >
        <Search size={15} strokeWidth={1.75} />
      </button>

      <DesktopSearchOverlay
        open={open}
        onClose={() => setOpen(false)}
        catalogType={catalogType}
        categorias={categorias}
      />
    </>
  )
}
