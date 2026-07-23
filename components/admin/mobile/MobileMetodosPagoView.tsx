'use client'

import { CreditCard, Info, Plus } from 'lucide-react'
import { MetodoPagoConfig } from '@/types'
import Button from '@/components/ui/Button'
import AdminLoadError from '@/components/admin/AdminLoadError'
import MobileAdminToolbar from '@/components/admin/mobile/MobileAdminToolbar'
import MobileMetodoPagoCard from '@/components/admin/mobile/MobileMetodoPagoCard'
import {
  MobileEmptyState,
} from '@/components/admin/mobile/MobileAdminPrimitives'
import { FormSection, InfoBanner } from '@/components/admin/config/config-ui'

type CatalogoTipo = MetodoPagoConfig['catalogo']
type EstadoFiltro = 'todas' | 'activos' | 'inactivos'
type CatalogoFiltro = 'todos' | CatalogoTipo

const CATALOGO_LABELS: Record<CatalogoTipo, string> = {
  detal: 'Detal',
  mayoreo: 'Mayorista',
  ambos: 'Detal y Mayorista',
}

type Group = {
  catalogo: CatalogoTipo
  items: MetodoPagoConfig[]
}

type MobileMetodosPagoViewProps = {
  loading: boolean
  loadError: boolean
  groups: Group[]
  totalCount: number
  search: string
  onSearchChange: (value: string) => void
  filtroEstado: EstadoFiltro
  onFiltroEstadoChange: (id: EstadoFiltro) => void
  filtroCatalogo: CatalogoFiltro
  onFiltroCatalogoChange: (id: CatalogoFiltro) => void
  onRetry: () => void
  onCreate: () => void
  onEdit: (config: MetodoPagoConfig) => void
  onDelete: (config: MetodoPagoConfig) => void
  onToggleActivo: (config: MetodoPagoConfig) => void
}

export default function MobileMetodosPagoView({
  loading,
  loadError,
  groups,
  totalCount,
  search,
  onSearchChange,
  filtroEstado,
  onFiltroEstadoChange,
  filtroCatalogo,
  onFiltroCatalogoChange,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
  onToggleActivo,
}: MobileMetodosPagoViewProps) {
  const visibleCount = groups.reduce((acc, g) => acc + g.items.length, 0)

  return (
    <div className="mobile-admin-page mobile-config-page px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:hidden">
      <p className="mb-1 text-[12px] font-light leading-relaxed text-[var(--text-muted)]">
        Cargos adicionales por método y catálogo en el checkout
      </p>
      <p className="mb-4 text-[11px] text-[var(--text-subtle)]">
        El cargo se aplica al elegir el método de pago
      </p>

      <InfoBanner icon={Info} compact>
        Puedes usar porcentaje, monto fijo o ambos. Los métodos sin cargo también
        pueden listarse aquí para controlar en qué catálogo aparecen.
      </InfoBanner>

      <div className="mt-5">
        <MobileAdminToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar método de pago..."
          filters={[
            { id: 'todas' as const, label: 'Todos' },
            { id: 'activos' as const, label: 'Activos' },
            { id: 'inactivos' as const, label: 'Inactivos' },
          ]}
          activeFilter={filtroEstado}
          onFilterChange={onFiltroEstadoChange}
        />
      </div>

      <div className="mobile-admin-filters -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {(
          [
            { id: 'todos' as const, label: 'Catálogos' },
            { id: 'detal' as const, label: 'Detal' },
            { id: 'mayoreo' as const, label: 'Mayorista' },
            { id: 'ambos' as const, label: 'Ambos' },
          ] as const
        ).map(({ id, label }) => {
          const active = filtroCatalogo === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onFiltroCatalogoChange(id)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-[11px] uppercase tracking-[0.8px] ${
                active
                  ? 'border-[rgba(201,168,76,0.45)] bg-[rgba(201,168,76,0.14)] text-[var(--gold)]'
                  : 'border-[var(--border-input)] bg-[var(--bg-card)] text-[var(--text-muted)]'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <p className="mb-4 text-[11px] text-[var(--text-subtle)]">
        {visibleCount} método{visibleCount !== 1 ? 's' : ''}
        {search ? ` · "${search}"` : ''}
        {filtroEstado !== 'todas' ? ` · ${filtroEstado}` : ''}
        {filtroCatalogo !== 'todos'
          ? ` · ${CATALOGO_LABELS[filtroCatalogo]}`
          : ''}
      </p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[9.5rem] animate-pulse rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)]"
            />
          ))}
        </div>
      ) : loadError ? (
        <AdminLoadError
          onRetry={onRetry}
          title="No se pudieron cargar los métodos de pago"
        />
      ) : totalCount === 0 ? (
        <MobileEmptyState
          icon={CreditCard}
          title="Aún no hay métodos de pago"
          description="Crea el primero para definir cargos en el checkout"
          action={
            <Button onClick={onCreate} size="sm">
              <Plus size={13} />
              Crear método
            </Button>
          }
        />
      ) : visibleCount === 0 ? (
        <MobileEmptyState
          icon={CreditCard}
          title="Sin resultados"
          description="Prueba con otros filtros o términos de búsqueda"
        />
      ) : (
        <div className="mobile-admin-form space-y-6">
          {groups.map(({ catalogo, items }) => (
            <FormSection key={catalogo} title={`${CATALOGO_LABELS[catalogo]} · ${items.length}`}>
              <div className="space-y-2.5">
                {items.map(config => (
                  <MobileMetodoPagoCard
                    key={config.id}
                    config={config}
                    onEdit={() => onEdit(config)}
                    onDelete={() => onDelete(config)}
                    onToggleActivo={() => onToggleActivo(config)}
                  />
                ))}
              </div>
            </FormSection>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onCreate}
        className="mobile-admin-fab fixed z-40 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(201,168,76,0.45)] bg-[var(--gold-bright)] text-[var(--bg-base)] shadow-lg"
        aria-label="Nuevo método de pago"
      >
        <Plus size={22} strokeWidth={1.75} />
      </button>
    </div>
  )
}
