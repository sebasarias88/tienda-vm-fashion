/**
 * Script one-off: lista objetos grandes en Storage y sugiere recompresión.
 *
 * Uso (requiere service role en .env.local):
 *   SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/audit-storage-images.ts
 *
 * No modifica archivos automáticamente — imprime reporte para revisión manual
 * o para alimentar un job de migración posterior.
 */
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../lib/env'

const MIN_BYTES = 500 * 1024
const BUCKETS = ['productos', 'banners'] as const

async function main() {
  const url = getSupabaseUrl()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    console.error('Falta SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey)
  let totalHeavy = 0
  let totalBytes = 0

  for (const bucket of BUCKETS) {
    console.log(`\n=== Bucket: ${bucket} ===`)
    const { data: files, error } = await supabase.storage.from(bucket).list('', {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'desc' },
    })

    if (error) {
      console.error(`Error listando ${bucket}:`, error.message)
      continue
    }

    for (const file of files || []) {
      if (!file.metadata?.size) continue
      const size = file.metadata.size as number
      if (size >= MIN_BYTES) {
        totalHeavy += 1
        totalBytes += size
        const mb = (size / (1024 * 1024)).toFixed(2)
        console.log(`  ${mb} MB  ${file.name}`)
      }
    }
  }

  console.log(`\nResumen: ${totalHeavy} archivos >= ${MIN_BYTES / 1024}KB`)
  console.log(`Peso combinado: ${(totalBytes / (1024 * 1024)).toFixed(1)} MB`)
  console.log(
    '\nSiguiente paso: re-subir vía admin (ya comprime) o script de migración con optimizeImage.',
  )
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
