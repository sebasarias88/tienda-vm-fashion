'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MapPin, MessageCircle, Truck } from 'lucide-react'
import SectionGoldDivider from '@/components/catalog/SectionGoldDivider'

type Props = {
  texto: string
  whatsapp?: string
  nombreNegocio?: string
}

const DEFAULT_TEXTO =
  'Somos Tienda VM Fashion, tu aliado de belleza en Armenia, Quindío. Contamos con una amplia variedad de productos profesionales para el cuidado capilar y personal.'

const HIGHLIGHTS = [
  {
    icon: MapPin,
    title: 'Armenia, Quindío',
    description: 'Tienda física en el corazón del eje cafetero',
  },
  {
    icon: Truck,
    title: 'Envíos nacionales',
    description: 'Llevamos tus productos a toda Colombia',
  },
  {
    icon: MessageCircle,
    title: 'Atención directa',
    description: 'Escríbenos y te asesoramos con gusto',
  },
] as const

export default function NosotrosSection({
  texto,
  whatsapp = '573185867702',
  nombreNegocio = 'Tienda VM Fashion',
}: Props) {
  const whatsappUrl = `https://wa.me/${whatsapp.replace(/\D/g, '')}`

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
      <SectionGoldDivider />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 border-b border-[var(--border-subtle)] pb-8"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-8 bg-[var(--gold)]" />
          <span className="catalog-eyebrow tracking-[3px]">
            Nosotros
          </span>
        </div>

        <h2 className="max-w-2xl text-[1.75rem] font-thin uppercase leading-tight tracking-[1.5px] text-[var(--text-primary)] sm:text-[2.125rem]">
          Tu aliada de{' '}
          <span className="gold-shimmer">belleza</span>
        </h2>
        <p className="mt-3 max-w-lg text-[14px] catalog-lead leading-relaxed">
          {nombreNegocio} — productos profesionales con atención cercana
        </p>
      </motion.div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <p className="max-w-xl text-[15px] catalog-lead leading-[1.85] text-[var(--text-secondary)]">
            {texto || DEFAULT_TEXTO}
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="catalog-gold-cta group mt-8 inline-flex items-center gap-3 rounded-[2px] px-6 py-3.5 text-[11px] font-medium uppercase tracking-[2px]"
          >
            <MessageCircle size={15} />
            Contáctanos por WhatsApp
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:border-l lg:border-[var(--border-subtle)] lg:pl-12"
        >
          <ul className="divide-y divide-[var(--border-subtle)]">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }, i) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.12 + i * 0.06 }}
                className="flex gap-4 py-5 first:pt-0 last:pb-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] bg-[var(--gold-muted)]">
                  <Icon size={17} className="text-[var(--gold)]" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[13px] font-light uppercase tracking-[1.2px] text-[var(--text-primary)]">
                    {title}
                  </p>
                  <p className="mt-1.5 text-[13px] catalog-lead leading-relaxed">
                    {description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
