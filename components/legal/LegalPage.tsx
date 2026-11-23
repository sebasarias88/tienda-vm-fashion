import type { ReactNode } from 'react'
import { LEGAL_UPDATED_AT } from '@/lib/legal'

/** Shared layout for the legal pages: readable width, clear headings. */
export default function LegalPage({
  title,
  intro,
  children,
}: {
  title: string
  intro: ReactNode
  children: ReactNode
}) {
  return (
    <article className="legal-page mx-auto max-w-3xl px-5 pb-12 pt-32 sm:px-6 sm:pt-40 lg:pb-16">
      <header className="mb-10 border-b border-[var(--border-subtle)] pb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-8 bg-[var(--gold)] opacity-40" />
          <span className="catalog-eyebrow tracking-[3px]">Información legal</span>
        </div>
        <h1 className="text-[1.6rem] font-thin uppercase leading-tight tracking-[1.5px] text-[var(--text-primary)] sm:text-[2rem]">
          {title}
        </h1>
        <p className="mt-3 text-[12px] font-light uppercase tracking-[1.5px] text-[var(--text-subtle)]">
          Última actualización: {LEGAL_UPDATED_AT}
        </p>
        <div className="mt-6 text-[14px] font-light leading-relaxed text-[var(--text-secondary)]">
          {intro}
        </div>
      </header>
      <div className="space-y-9 text-[14px] font-light leading-relaxed text-[var(--text-secondary)] [&_a]:text-[var(--gold)] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-3 [&_h2]:text-[15px] [&_h2]:font-medium [&_h2]:uppercase [&_h2]:tracking-[1.5px] [&_h2]:text-[var(--text-primary)] [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_p+p]:mt-3 [&_strong]:font-medium [&_strong]:text-[var(--text-primary)] [&_ul]:mt-3 [&_ul]:space-y-1.5">
        {children}
      </div>
    </article>
  )
}
