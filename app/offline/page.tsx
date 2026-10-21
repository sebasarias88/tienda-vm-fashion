import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Sin conexión',
  robots: { index: false, follow: false },
}

/**
 * Fully static page (no database) precached by the service worker.
 * Works without JavaScript: "Reintentar" is a plain link.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] px-6 text-center">
      <Image src="/icon.png" alt="VM Fashion" width={112} height={112} priority className="mb-8" />

      <p className="mb-3 text-[11px] uppercase tracking-[4px] text-[var(--gold-bright)]">
        Sin conexión
      </p>
      <h1 className="max-w-md text-[1.75rem] font-thin leading-tight text-[var(--text-primary)]">
        Parece que no tienes internet
      </h1>
      <p className="mt-4 max-w-sm text-[15px] font-light leading-relaxed text-[var(--text-muted)]">
        Revisa tu conexión de datos o Wi‑Fi. Las páginas que ya visitaste siguen disponibles, y tu
        carrito está guardado en este dispositivo.
      </p>

      {/* Plain <a> on purpose: must work offline without JavaScript (full reload). */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        className="mt-10 inline-flex items-center justify-center rounded-[2px] bg-[var(--gold-bright)] px-8 py-3 text-[12px] font-medium uppercase tracking-[2px] text-[var(--text-on-gold)]"
      >
        Reintentar
      </a>
    </main>
  )
}
