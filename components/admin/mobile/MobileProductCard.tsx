'use client'

import { CheckCircle2, ChevronRight, CornerDownRight, Edit2, Star, Tag, Trash2, XCircle } from 'lucide-react'
import { Producto } from '@/types'

type MobileProductCardProps = {
  producto: Producto
  formatPrecio: (precio: number) => string
  parentCategoria?: string | null
  onEdit: () => void
  onDelete: () => void
  onToggleDisponible: () => void
}

export default function MobileProductCard({
  producto,
  formatPrecio,
  parentCategoria,
  onEdit,
  onDelete,
  onToggleDisponible,
}: MobileProductCardProps) {
  const imagen = producto.imagenes?.[0]

  return (
    <article className="mobile-admin-product-card overflow-hidden rounded-xl border border-[rgba(201,168,76,0.22)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)]">
      <div className="flex gap-3 p-3">
        <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-lg border border-[rgba(201,168,76,0.18)] bg-[var(--bg-muted)]">
          {imagen ? (
            <img src={imagen} alt={producto.nombre} className="h-full w-full bg-white object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--text-faint)]">
              Sin foto
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[13px] font-light text-[var(--text-primary)]">{producto.nombre}</h3>
              {producto.sku ? (
                <p className="mt-0.5 truncate text-[10px] text-[var(--text-subtle)]">SKU · {producto.sku}</p>
              ) : null}
              {producto.marca ? (
                <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{producto.marca}</p>
              ) : null}
            </div>
            {producto.destacado ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.1)] px-2 py-0.5 text-[9px] uppercase tracking-[0.6px] text-[var(--gold)]">
                <Star size={9} className="fill-[var(--gold)]" />
                Top
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[12px] font-light text-[var(--gold-bright)]">{formatPrecio(producto.precio)}</p>
          {producto.precio_mayoreo != null ? (
            <p className="text-[10px] text-[var(--text-subtle)]">
              Mayorista · {formatPrecio(producto.precio_mayoreo)}
            </p>
          ) : null}
          {producto.categoria ? (
            <span
              className={`mt-1.5 inline-flex max-w-full items-center gap-1 rounded-full border py-0.5 pl-1.5 pr-2 text-[10px] ${
                parentCategoria
                  ? 'border-[rgba(96,165,250,0.25)] bg-[rgba(96,165,250,0.08)]'
                  : 'border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.08)]'
              }`}
            >
              {parentCategoria ? (
                <CornerDownRight size={10} className="shrink-0 text-blue-400" strokeWidth={1.75} />
              ) : (
                <Tag size={10} className="shrink-0 text-[var(--gold-bright)]" strokeWidth={1.75} />
              )}
              {parentCategoria && (
                <>
                  <span className="max-w-[80px] shrink-0 truncate text-[var(--text-faint)]">
                    {parentCategoria}
                  </span>
                  <ChevronRight size={9} className="shrink-0 text-[var(--text-faint)]" />
                </>
              )}
              <span className="truncate text-[var(--text-secondary)]">{producto.categoria.nombre}</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-[rgba(201,168,76,0.12)] px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleDisponible}
            className={`inline-flex min-h-[28px] items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.6px] ${
              producto.disponible
                ? 'border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.1)] text-[var(--gold-bright)]'
                : 'border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] text-red-400'
            }`}
          >
            {producto.disponible ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
            Stock
          </button>
          <span
            className={`inline-flex min-h-[28px] items-center rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.6px] ${
              producto.disponible_detal
                ? 'border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.1)] text-emerald-400'
                : 'border-[var(--border-subtle)] text-[var(--text-faint)]'
            }`}
          >
            Detal
          </span>
          <span
            className={`inline-flex min-h-[28px] items-center rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.6px] ${
              producto.disponible_mayoreo
                ? 'border-[rgba(96,165,250,0.35)] bg-[rgba(96,165,250,0.1)] text-blue-400'
                : 'border-[var(--border-subtle)] text-[var(--text-faint)]'
            }`}
          >
            Mayorista
          </span>
        </div>
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] active:bg-[rgba(201,168,76,0.1)] active:text-[var(--gold)]"
            aria-label="Editar"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] active:bg-[rgba(248,113,113,0.1)] active:text-red-400"
            aria-label="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}
