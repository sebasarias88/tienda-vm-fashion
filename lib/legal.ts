import { CIUDAD_NEGOCIO, DIRECCION_NEGOCIO } from '@/lib/negocio'

/**
 * Identity of the data controller and seller, taken from the owner's RUT
 * (DIAN, updated 2026-03-21). The address is the store's, not the home
 * address on the RUT. Change it here and every legal page updates.
 */
export const LEGAL_OWNER = {
  name: 'Viviana Marcela Arias González',
  personType: 'persona natural',
  nit: '41.953.771-9',
  tradeName: 'Tienda VM Fashion',
  address: DIRECCION_NEGOCIO,
  city: `${CIUDAD_NEGOCIO}, Colombia`,
  email: 'tiendavm.fashion@gmail.com',
  phone: '318 586 7702',
} as const

/** "Name (persona natural)", adding the trade name only when it differs. */
export function legalOwnerLabel(): string {
  const { name, personType, tradeName }: Record<string, string> = LEGAL_OWNER
  const base = `${name} (${personType})`
  return tradeName === name ? base : `${base}, nombre comercial ${tradeName}`
}

/** Date shown as "última actualización" on the legal pages. */
export const LEGAL_UPDATED_AT = '20 de noviembre de 2026'

export const LEGAL_LINKS = [
  { href: '/terminos-y-condiciones', label: 'Términos y condiciones' },
  { href: '/politica-de-privacidad', label: 'Política de privacidad' },
  { href: '/politica-de-cookies', label: 'Política de cookies' },
] as const
