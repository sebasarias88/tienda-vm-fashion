/**
 * Backfill: recomprime imágenes históricas en Storage (productos, categorías, banners, promos).
 *
 * Uso:
 *   npx tsx scripts/backfill-images.ts --dry-run   # solo reporte, sin escribir
 *   npx tsx scripts/backfill-images.ts             # ejecuta migración
 *
 * Requiere SUPABASE_SERVICE_ROLE_KEY en .env
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../lib/env'
import {
  BACKFILL_MIN_BYTES,
  isAlreadyOptimized,
  optimizeImageBuffer,
} from '../lib/optimizeImageServer'

const LOG_EVERY = 20
const DRY_RUN = process.argv.includes('--dry-run')

type StorageRef = { bucket: string; path: string }

type ImageTask = {
  source: 'producto' | 'categoria' | 'banner' | 'promocion'
  recordId: string
  field: 'imagenes' | 'imagen_url'
  imageIndex?: number
  url: string
  storage: StorageRef
}

type Stats = {
  scanned: number
  alreadyOk: number
  toOptimize: number
  optimized: number
  failed: number
  urlsUpdated: number
}

const stats: Stats = {
  scanned: 0,
  alreadyOk: 0,
  toOptimize: 0,
  optimized: 0,
  failed: 0,
  urlsUpdated: 0,
}

function parseStorageUrl(url: string): StorageRef | null {
  const marker = '/storage/v1/object/public/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const rest = url.slice(idx + marker.length)
  const slash = rest.indexOf('/')
  if (slash <= 0) return null
  return {
    bucket: rest.slice(0, slash),
    path: decodeURIComponent(rest.slice(slash + 1)),
  }
}

function webpPathFor(originalPath: string): string {
  const base = originalPath.replace(/\.[^.]+$/, '')
  return `${base}.webp`
}

async function getObjectSize(
  supabase: SupabaseClient,
  ref: StorageRef,
): Promise<number | null> {
  const folder = ref.path.includes('/')
    ? ref.path.slice(0, ref.path.lastIndexOf('/'))
    : ''
  const name = ref.path.includes('/')
    ? ref.path.slice(ref.path.lastIndexOf('/') + 1)
    : ref.path

  const { data, error } = await supabase.storage.from(ref.bucket).list(folder, {
    limit: 1000,
    search: name,
  })

  if (error) return null
  const file = (data || []).find(f => f.name === name)
  return file?.metadata?.size ?? null
}

async function classifyTask(
  supabase: SupabaseClient,
  task: ImageTask,
): Promise<'skip' | 'optimize'> {
  stats.scanned += 1
  const size = await getObjectSize(supabase, task.storage)
  if (size != null && isAlreadyOptimized(size, task.storage.path)) {
    stats.alreadyOk += 1
    return 'skip'
  }
  stats.toOptimize += 1
  return 'optimize'
}

async function processTask(
  supabase: SupabaseClient,
  task: ImageTask,
): Promise<void> {
  const action = await classifyTask(supabase, task)
  if (action === 'skip') return

  if (DRY_RUN) return

  try {
    const { data: blob, error: downloadError } = await supabase.storage
      .from(task.storage.bucket)
      .download(task.storage.path)

    if (downloadError || !blob) {
      throw new Error(downloadError?.message || 'download failed')
    }

    const input = Buffer.from(await blob.arrayBuffer())
    const optimized = await optimizeImageBuffer(input)

    const isWebp = task.storage.path.toLowerCase().endsWith('.webp')
    const targetPath = isWebp ? task.storage.path : webpPathFor(task.storage.path)

    const { error: uploadError } = await supabase.storage
      .from(task.storage.bucket)
      .upload(targetPath, optimized, {
        upsert: true,
        contentType: 'image/webp',
      })

    if (uploadError) throw new Error(uploadError.message)

    const { data: publicUrlData } = supabase.storage
      .from(task.storage.bucket)
      .getPublicUrl(targetPath)

    const newUrl = publicUrlData.publicUrl

    if (task.field === 'imagenes' && task.imageIndex != null) {
      const { data: row, error: fetchError } = await supabase
        .from('productos')
        .select('imagenes')
        .eq('id', task.recordId)
        .single()

      if (fetchError || !row) throw new Error(fetchError?.message || 'producto not found')

      const imagenes = [...((row.imagenes as string[]) || [])]
      imagenes[task.imageIndex] = newUrl

      const { error: updateError } = await supabase
        .from('productos')
        .update({ imagenes })
        .eq('id', task.recordId)

      if (updateError) throw new Error(updateError.message)
      stats.urlsUpdated += 1
    } else {
      const table =
        task.source === 'categoria'
          ? 'categorias'
          : task.source === 'banner'
            ? 'banners'
            : 'promociones'

      const { error: updateError } = await supabase
        .from(table)
        .update({ imagen_url: newUrl })
        .eq('id', task.recordId)

      if (updateError) throw new Error(updateError.message)
      stats.urlsUpdated += 1
    }

    if (!isWebp && targetPath !== task.storage.path) {
      await supabase.storage.from(task.storage.bucket).remove([task.storage.path])
    }

    stats.optimized += 1
  } catch (err) {
    stats.failed += 1
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`  FAIL [${task.source} ${task.recordId}] ${task.storage.path}: ${msg}`)
  }
}

async function collectProductoTasks(supabase: SupabaseClient): Promise<ImageTask[]> {
  const tasks: ImageTask[] = []
  const pageSize = 100
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('productos')
      .select('id, imagenes')
      .not('imagenes', 'is', null)
      .range(from, from + pageSize - 1)

    if (error) throw new Error(`productos: ${error.message}`)
    const rows = data || []
    if (!rows.length) break

    for (const row of rows) {
      const imagenes = (row.imagenes as string[] | null) || []
      imagenes.forEach((url, imageIndex) => {
        if (!url?.trim()) return
        const storage = parseStorageUrl(url)
        if (!storage) return
        tasks.push({
          source: 'producto',
          recordId: row.id,
          field: 'imagenes',
          imageIndex,
          url,
          storage,
        })
      })
    }

    if (rows.length < pageSize) break
    from += pageSize
  }

  return tasks
}

async function collectSingleImageTasks(
  supabase: SupabaseClient,
  table: 'categorias' | 'banners' | 'promociones',
  source: ImageTask['source'],
): Promise<ImageTask[]> {
  const { data, error } = await supabase
    .from(table)
    .select('id, imagen_url')
    .not('imagen_url', 'is', null)

  if (error) throw new Error(`${table}: ${error.message}`)

  const tasks: ImageTask[] = []
  for (const row of data || []) {
    const url = row.imagen_url as string
    if (!url?.trim()) continue
    const storage = parseStorageUrl(url)
    if (!storage) continue
    tasks.push({
      source,
      recordId: row.id,
      field: 'imagen_url',
      url,
      storage,
    })
  }
  return tasks
}

async function main() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    console.error('Falta SUPABASE_SERVICE_ROLE_KEY en el entorno')
    process.exit(1)
  }

  const supabase = createClient(getSupabaseUrl(), serviceKey)
  const mode = DRY_RUN ? 'DRY-RUN (sin escribir)' : 'EJECUCIÓN'

  console.log(`\n=== Backfill de imágenes — ${mode} ===\n`)
  console.log(`Umbral: >${BACKFILL_MIN_BYTES / 1024}KB o no-WebP → optimizar\n`)

  const [productoTasks, categoriaTasks, bannerTasks, promoTasks] = await Promise.all([
    collectProductoTasks(supabase),
    collectSingleImageTasks(supabase, 'categorias', 'categoria'),
    collectSingleImageTasks(supabase, 'banners', 'banner'),
    collectSingleImageTasks(supabase, 'promociones', 'promocion'),
  ])

  const allTasks = [...productoTasks, ...categoriaTasks, ...bannerTasks, ...promoTasks]

  console.log('Inventario de URLs en base de datos:')
  console.log(`  Productos:    ${productoTasks.length} imágenes (${new Set(productoTasks.map(t => t.recordId)).size} productos)`)
  console.log(`  Categorías:   ${categoriaTasks.length}`)
  console.log(`  Banners:      ${bannerTasks.length}`)
  console.log(`  Promociones:  ${promoTasks.length}`)
  console.log(`  Total URLs:   ${allTasks.length}\n`)

  if (!allTasks.length) {
    console.log('Nada que procesar.')
    return
  }

  let processedProducts = 0
  const productIdsSeen = new Set<string>()

  for (let i = 0; i < allTasks.length; i++) {
    const task = allTasks[i]
    await processTask(supabase, task)

    if (task.source === 'producto') {
      if (!productIdsSeen.has(task.recordId)) {
        productIdsSeen.add(task.recordId)
        processedProducts += 1
        if (processedProducts % LOG_EVERY === 0) {
          console.log(`  … ${processedProducts} productos revisados`)
        }
      }
    }
  }

  console.log('\n=== Resumen ===')
  console.log(`  Escaneadas:      ${stats.scanned}`)
  console.log(`  Ya optimizadas:  ${stats.alreadyOk}`)
  console.log(`  A optimizar:     ${stats.toOptimize}`)
  if (!DRY_RUN) {
    console.log(`  Optimizadas:     ${stats.optimized}`)
    console.log(`  URLs actualizadas: ${stats.urlsUpdated}`)
    console.log(`  Fallidas:        ${stats.failed}`)
  } else {
    console.log('\n  (Dry-run: no se escribió nada en Storage ni en la DB)')
    console.log('  Para ejecutar: npx tsx scripts/backfill-images.ts')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
