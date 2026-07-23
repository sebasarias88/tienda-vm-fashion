'use client'

import { Fragment } from 'react'

const DEFAULT_MESSAGES = [
  'Envíos a todo Colombia',
  'Asesoría personalizada por WhatsApp',
  'Marcas en tendencia',
  'Pedidos fáciles desde el catálogo',
  'Compra fácil con Addi y Sistecrédito',
  'Catálogo detal',
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

  // Texto legible para crawlers / lectores (con espacios y puntuación)
  const seoText = `${items.join('. ')}.`

  return (
    <div
      className="fixed inset-x-0 top-0 z-40 h-9 overflow-hidden bg-[#B8922A] text-white"
      role="region"
      aria-label="Anuncios"
    >
      {/* Una sola frase bien puntuada: evita que Google pegue los textos del marquee */}
      <p className="sr-only">{seoText}</p>

      <div className="announcement-marquee flex h-full w-max items-center gap-4 px-4" aria-hidden="true">
        {track.map((text, i) => (
          <Fragment key={`${text}-${i}`}>
            <span className="shrink-0 text-[10px] font-light uppercase leading-none tracking-[2px] sm:text-[11px]">
              {text}
            </span>
            <span className="shrink-0 text-[10px] font-light leading-none text-white/55 sm:text-[11px]">
              {' · '}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
