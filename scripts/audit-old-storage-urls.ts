/**
 * Audita columnas text/text[] del schema public buscando dominio viejo de Storage.
 * Uso: npx tsx --env-file=.env scripts/audit-old-storage-urls.ts
 */
// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../lib/env'

const OLD = 'pflyaurqruygfuqhsxud'

/** Columnas text/scalar conocidas + candidatas del schema de esta app. */
const TEXT_COLUMNS: { table: string; column: string; type: 'text' | 'text[]' }[] = [
  { table: 'productos', column: 'imagenes', type: 'text[]' },
  { table: 'productos', column: 'video_url', type: 'text' },
  { table: 'productos', column: 'descripcion', type: 'text' },
  { table: 'categorias', column: 'imagen_url', type: 'text' },
  { table: 'banners', column: 'imagen_url', type: 'text' },
  { table: 'banners', column: 'enlace_boton', type: 'text' },
  { table: 'promociones', column: 'imagen_url', type: 'text' },
  { table: 'promociones', column: 'enlace', type: 'text' },
  { table: 'configuracion', column: 'valor', type: 'text' },
  { table: 'configuracion', column: 'descripcion', type: 'text' },
  { table: 'producto_secciones', column: 'descripcion', type: 'text' },
  { table: 'metodo_pago_config', column: 'descripcion_cliente', type: 'text' },
]

async function countScalar(
  sb: ReturnType<typeof createClient>,
  table: string,
  column: string,
): Promise<{ count: number; samples: string[] }> {
  const { count, error } = await sb
    .from(table)
    .select('*', { count: 'exact', head: true })
    .ilike(column, `%${OLD}%`)

  if (error) throw new Error(`${table}.${column}: ${error.message}`)

  const samples: string[] = []
  if (count && count > 0) {
    const { data } = await sb
      .from(table)
      .select(column)
      .ilike(column, `%${OLD}%`)
      .limit(3)
    for (const row of (data as Record<string, string>[] | null) || []) {
      const v = (row as Record<string, string>)[column]
      if (typeof v === 'string') samples.push(v.slice(0, 120))
    }
  }

  return { count: count ?? 0, samples }
}

async function countArray(
  sb: ReturnType<typeof createClient>,
  table: string,
  column: string,
): Promise<{ count: number; samples: string[] }> {
  const { data, error } = await sb
    .from(table)
    .select(`id, ${column}`)
    .not(column, 'is', null)

  if (error) throw new Error(`${table}.${column}: ${error.message}`)

  let count = 0
  const samples: string[] = []

  for (const row of (data as Record<string, unknown>[] | null) || []) {
    const arr = (row as Record<string, unknown>)[column] as string[] | null
    if (!arr?.length) continue
    const hits = arr.filter(v => v.includes(OLD))
    if (hits.length) {
      count += 1
      if (samples.length < 3) samples.push(hits[0].slice(0, 120))
    }
  }

  return { count, samples }
}

async function main() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    console.error('Falta SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const sb = createClient(getSupabaseUrl(), key)
  console.log(`\nAuditoría dominio viejo: ${OLD}`)
  console.log(`Proyecto: ${getSupabaseUrl()}\n`)

  const affected: {
    table: string
    column: string
    type: string
    count: number
    samples: string[]
  }[] = []

  const skipped: string[] = []

  for (const { table, column, type } of TEXT_COLUMNS) {
    try {
      const result =
        type === 'text[]'
          ? await countArray(sb, table, column)
          : await countScalar(sb, table, column)

      if (result.count > 0) {
        affected.push({ table, column, type, ...result })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('does not exist') || msg.includes('Could not find')) {
        skipped.push(`${table}.${column} (${msg})`)
      } else {
        skipped.push(`${table}.${column} — ${msg}`)
      }
    }
  }

  if (skipped.length) {
    console.log('Columnas omitidas o no accesibles:')
    skipped.forEach(s => console.log(`  - ${s}`))
    console.log('')
  }

  if (!affected.length) {
    console.log('✅ No quedan filas con el dominio viejo en las columnas auditadas.\n')
    return
  }

  console.log('⚠️  Columnas con dominio viejo:\n')
  for (const a of affected) {
    console.log(`  ${a.table}.${a.column} (${a.type}) — ${a.count} fila(s)`)
    a.samples.forEach(s => console.log(`    → ${s}`))
  }
  console.log(`\nTotal: ${affected.length} columna(s) con datos pendientes.\n`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
