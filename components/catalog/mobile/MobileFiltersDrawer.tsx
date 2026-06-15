'use client'

import { useEffect, useMemo, useState } from 'react'
import { Categoria } from '@/types'
import MobileBottomSheet from '@/components/catalog/mobile/MobileBottomSheet'
import MobileFilterDropdown, { FilterOption } from '@/components/catalog/mobile/MobileFilterDropdown'

type Orden = 'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre'
type OpenDropdown = 'orden' | 'categoria' | null

type MobileFiltersDrawerProps = {
  open: boolean
  onClose: () => void
  categorias: Categoria[]
  categoriaActiva: string
  onCategoriaChange: (slug: string) => void
  subcategorias: Categoria[]
  orden: Orden
  onOrdenChange: (orden: Orden) => void
  onLimpiar: () => void
  resultCount: number
}

const ordenOptions: FilterOption[] = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio-asc', label: 'Menor precio' },
  { value: 'precio-desc', label: 'Mayor precio' },
  { value: 'nombre', label: 'Nombre A-Z' },
]

function buildCategoriaOptions(categorias: Categoria[]): FilterOption[] {
  const options: FilterOption[] = [{ value: '', label: 'Todas las categorías' }]

  for (const cat of categorias) {
    options.push({ value: cat.slug, label: cat.nombre })
    cat.subcategorias?.forEach(sub => {
      options.push({
        value: sub.slug,
        label: sub.nombre,
        hint: cat.nombre,
      })
    })
  }

  return options
}

export default function MobileFiltersDrawer({
  open,
  onClose,
  categorias,
  categoriaActiva,
  onCategoriaChange,
  orden,
  onOrdenChange,
  onLimpiar,
  resultCount,
}: MobileFiltersDrawerProps) {
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null)
  const tieneFiltros = Boolean(categoriaActiva) || orden !== 'relevancia'

  const categoriaOptions = useMemo(
    () => buildCategoriaOptions(categorias),
    [categorias],
  )

  useEffect(() => {
    if (!open) setOpenDropdown(null)
  }, [open])

  const footer = (
    <div className="mobile-filters-footer flex gap-3">
      {tieneFiltros ? (
        <button
          type="button"
          onClick={onLimpiar}
          className="mobile-filters-clear min-h-[50px] flex-1 rounded-xl text-[13px] font-medium"
        >
          Limpiar
        </button>
      ) : null}
      <button
        type="button"
        onClick={onClose}
        className="catalog-gold-cta min-h-[50px] flex-[1.35] rounded-xl text-[13px] font-semibold"
      >
        Ver resultados
      </button>
    </div>
  )

  return (
    <MobileBottomSheet
      open={open}
      onClose={onClose}
      title="Filtros"
      subtitle={`${resultCount} producto${resultCount !== 1 ? 's' : ''}`}
      height={openDropdown === 'categoria' ? 'tall' : 'auto'}
      footer={footer}
    >
      <div
        className={`mobile-filters-compact px-5 pt-2 ${
          openDropdown === 'categoria' ? 'mobile-filters-compact--open pb-6' : 'pb-4'
        }`}
      >
        <MobileFilterDropdown
          label="Ordenar"
          value={orden}
          options={ordenOptions}
          onChange={v => onOrdenChange(v as Orden)}
          open={openDropdown === 'orden'}
          onOpenChange={next => setOpenDropdown(next ? 'orden' : null)}
          listClassName="max-h-none"
        />

        <MobileFilterDropdown
          label="Categoría"
          value={categoriaActiva}
          options={categoriaOptions}
          onChange={onCategoriaChange}
          open={openDropdown === 'categoria'}
          onOpenChange={next => setOpenDropdown(next ? 'categoria' : null)}
          searchable
          searchPlaceholder="Buscar categoría…"
          listClassName="max-h-[min(42dvh,260px)]"
        />
      </div>
    </MobileBottomSheet>
  )
}
