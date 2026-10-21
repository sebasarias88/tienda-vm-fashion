import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { WHATSAPP_NUMERO_DEFAULT } from '@/lib/negocio'

/** Shown instead of the catalog while MAINTENANCE_MODE=true. No database access. */
export default function MaintenanceScreen() {
  const whatsappUrl = buildWhatsAppUrl(
    WHATSAPP_NUMERO_DEFAULT,
    'Hola, quiero hacer un pedido mientras actualizan el catálogo.',
  )

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] px-6 text-center">
      <Image src="/icon.png" alt="VM Fashion" width={112} height={112} priority className="mb-8" />

      <p className="mb-3 text-[11px] uppercase tracking-[4px] text-[var(--gold-bright)]">
        Volvemos pronto
      </p>
      <h1 className="max-w-md text-[1.75rem] font-thin leading-tight text-[var(--text-primary)]">
        Estamos actualizando nuestro catálogo
      </h1>
      <p className="mt-4 max-w-sm text-[15px] font-light leading-relaxed text-[var(--text-muted)]">
        Mientras tanto, te atendemos por WhatsApp: cuéntanos qué buscas y te enviamos fotos,
        precios y disponibilidad.
      </p>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 inline-flex items-center justify-center gap-2 rounded-[2px] bg-[var(--gold-bright)] px-8 py-3 text-[12px] font-medium uppercase tracking-[2px] text-[var(--text-on-gold)]"
      >
        <MessageCircle size={15} />
        Pedir por WhatsApp
      </a>
    </main>
  )
}
