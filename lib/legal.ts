import { CIUDAD_NEGOCIO, DIRECCION_NEGOCIO } from '@/lib/negocio'

/**
 * Identity of the data controller and seller, as given by the owner
 * (2026-11-23). Change it here and every legal page updates.
 */
export const LEGAL_OWNER = {
  name: 'Tienda VM Fashion',
  personType: 'persona natural',
  /** Tax ID / cédula as registered in the owner's RUT. */
  nit: '41.953.771',
  tradeName: 'Tienda VM Fashion',
  address: DIRECCION_NEGOCIO,
  city: `${CIUDAD_NEGOCIO}, Colombia`,
  email: 'tiendavm.fashion@gmail.com',
  phone: '318 586 7702',
} as const

/** "Name (persona natural)", adding the trade name only when it differs. */
export function legalOwnerLabel(): string {
  const o = LEGAL_OWNER
  const base = `${o.name} (${o.personType})`
  return o.tradeName === o.name ? base : `${base}, nombre comercial ${o.tradeName}`
}

/** Date shown as "última actualización" on the legal pages. */
export const LEGAL_UPDATED_AT = '20 de noviembre de 2026'

export const LEGAL_LINKS = [
  { href: '/terminos-y-condiciones', label: 'Términos y condiciones' },
  { href: '/politica-de-privacidad', label: 'Política de privacidad' },
  { href: '/politica-de-cookies', label: 'Política de cookies' },
] as const
