import { CIUDAD_NEGOCIO, DIRECCION_NEGOCIO } from '@/lib/negocio'

/**
 * Identity of the data controller and seller, taken from the owner's RUT.
 * Change it here and every legal page updates.
 *
 * TODO(legal): fill name, personType, nit and email with Vivi's RUT data
 * before merging to main. `LEGAL_OWNER_PENDING` lists what is still missing.
 */
export const LEGAL_OWNER = {
  name: '[NOMBRE COMPLETO O RAZÓN SOCIAL]',
  personType: 'persona natural',
  nit: '[NIT O CÉDULA]',
  tradeName: 'Tienda VM Fashion',
  address: DIRECCION_NEGOCIO,
  city: `${CIUDAD_NEGOCIO}, Colombia`,
  email: '[CORREO DE CONTACTO]',
  phone: '318 586 7702',
} as const

/** Fields still holding a placeholder (checked in development only). */
export const LEGAL_OWNER_PENDING = Object.entries(LEGAL_OWNER)
  .filter(([, value]) => value.startsWith('['))
  .map(([key]) => key)

/** Date shown as "última actualización" on the legal pages. */
export const LEGAL_UPDATED_AT = '20 de noviembre de 2026'

export const LEGAL_LINKS = [
  { href: '/terminos-y-condiciones', label: 'Términos y condiciones' },
  { href: '/politica-de-privacidad', label: 'Política de privacidad' },
  { href: '/politica-de-cookies', label: 'Política de cookies' },
] as const
