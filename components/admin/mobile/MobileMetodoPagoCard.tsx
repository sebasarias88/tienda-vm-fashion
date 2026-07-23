'use client'

import {
  CheckCircle2,
  CreditCard,
  Edit2,
  Percent,
  Trash2,
  XCircle,
} from 'lucide-react'
import { MetodoPagoConfig } from '@/types'

const CATALOGO_LABELS: Record<MetodoPagoConfig['catalogo'], string> = {
  detal: 'Detal',
  mayoreo: 'Mayorista',
  ambos: 'Ambos',
}

type MobileMetodoPagoCardProps = {
  config: MetodoPagoConfig
  onEdit: () => void
  onDelete: () => void
  onToggleActivo: () => void
}

export default function MobileMetodoPagoCard({
  config,
  onEdit,
  onDelete,
  onToggleActivo,
}: MobileMetodoPagoCardProps) {
  const tienePorcentaje = config.porcentaje_adicional > 0
  const tieneFijo = config.monto_adicional_fijo > 0
  const sinCargo = !tienePorcentaje && !tieneFijo

  return (
    <article className="mobile-admin-metodo-pago-card overflow-hidden rounded-xl border border-[rgba(201,168,76,0.22)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)]">
      <div className="flex gap-3 p-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.08)] text-[var(--gold)]">
          <CreditCard size={20} strokeWidth={1.5} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[14px] font-light text-[var(--text-primary)]">
                {config.nombre}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-[rgba(201,168,76,0.28)] bg-[rgba(201,168,76,0.1)] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.7px] text-[var(--gold)]">
                  {CATALOGO_LABELS[config.catalogo]}
                </span>
                <span className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-1.5 py-0.5 text-[9px] tabular-nums text-[var(--text-muted)]">
                  #{config.orden}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {tienePorcentaje ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.12)] px-2 py-1 text-[11px] font-medium text-[var(--gold)]">
                <Percent size={11} strokeWidth={2} />
                +{config.porcentaje_adicional}%
              </span>
            ) : null}
            {tieneFijo ? (
              <span className="inline-flex items-center rounded-lg border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.08)] px-2 py-1 text-[11px] font-light text-[rgba(201,168,76,0.85)]">
                +${Number(config.monto_adicional_fijo).toLocaleString('es-CO')}
              </span>
            ) : null}
            {sinCargo ? (
              <span className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-2 py-1 text-[11px] text-[var(--text-faint)]">
                Sin cargo
              </span>
            ) : null}
          </div>

          {config.descripcion_cliente ? (
            <p className="mt-2 line-clamp-2 text-[11px] font-light leading-relaxed text-[var(--text-subtle)]">
              {config.descripcion_cliente}
            </p>
          ) : (
            <p className="mt-2 text-[11px] font-light italic text-[var(--text-faint)]">
              Sin descripción para el cliente
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[rgba(201,168,76,0.12)] px-3 py-2.5">
        <button
          type="button"
          onClick={onToggleActivo}
          className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-2.5 text-[10px] uppercase tracking-[0.8px] ${
            config.activo ? 'text-emerald-400' : 'text-[var(--text-muted)]'
          }`}
        >
          {config.activo ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {config.activo ? 'Activo' : 'Inactivo'}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] active:bg-[rgba(201,168,76,0.1)] active:text-[var(--gold)]"
            aria-label={`Editar ${config.nombre}`}
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] active:bg-[rgba(248,113,113,0.1)] active:text-red-400"
            aria-label={`Eliminar ${config.nombre}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}
