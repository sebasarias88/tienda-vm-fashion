'use client'

import { Fragment } from 'react'

const DEFAULT_MESSAGES = [
  'Envíos a todo Colombia',
  'Asesoría personalizada por WhatsApp',
  'Marcas en tendencia',
  'Pedidos fáciles desde el catálogo',
  'Compra fácil con Addi y Sistecrédito',
  'Tu ritual de belleza empieza aquí',
]

type AnnouncementBarProps = {
  messages?: string[]
}

export default function AnnouncementBar({
  messages = DEFAULT_MESSAGES,
}: AnnouncementBarProps) {
  const items = messages.filter(Boolean)
  if (!items.length) return null

  // Duplicamos para el loop infinito del marquee
  const track = [...items, ...items]

  return (
    <div
      className="fixed inset-x-0 top-0 z-40 h-9 overflow-hidden bg-[#B8922A] text-white"
      role="region"
      aria-label="Anuncios"
    >
      <div className="announcement-marquee flex h-full w-max items-center gap-4 px-4">
        {track.map((text, i) => (
          <Fragment key={`${text}-${i}`}>
            <span className="shrink-0 text-[10px] font-light uppercase leading-none tracking-[2px] sm:text-[11px]">
              {text}
            </span>
            <span
              className="inline-flex h-[1em] w-[1em] shrink-0 items-center justify-center"
              aria-hidden
            >
              <span className="block h-1 w-1 rounded-full bg-white/70" />
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
