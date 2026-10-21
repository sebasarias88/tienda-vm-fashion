import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

/**
 * Cloudflare R2 client (S3-compatible). SERVER ONLY — never import from client components.
 * Required env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 * R2_BUCKET, R2_PUBLIC_BASE_URL (e.g. https://img.tiendavmfashion.com).
 */

/** Immutable keys (timestamp + random) → cache for 1 year in browsers and CDN. */
export const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable'

/** Top-level key prefixes the app is allowed to write or delete. */
export const ALLOWED_KEY_PREFIXES = [
  'productos/',
  'categorias/',
  'banners/',
  'promociones/',
  'thumbs/',
] as const

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing env var ${name}`)
  return value
}

let client: S3Client | undefined

export function getR2Client(): S3Client {
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${requireEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
        secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
      },
    })
  }
  return client
}

export function getR2Bucket(): string {
  return requireEnv('R2_BUCKET')
}

export function getR2PublicBaseUrl(): string {
  return requireEnv('R2_PUBLIC_BASE_URL').replace(/\/$/, '')
}

export function publicUrlForKey(key: string): string {
  return `${getR2PublicBaseUrl()}/${key}`
}

/** Returns the object key if the URL belongs to our R2 public domain, otherwise null. */
export function keyFromPublicUrl(url: string): string | null {
  const base = `${getR2PublicBaseUrl()}/`
  if (!url.startsWith(base)) return null
  const key = decodeURIComponent(url.slice(base.length))
  if (!key || key.includes('..')) return null
  return isAllowedKey(key) ? key : null
}

export function isAllowedKey(key: string): boolean {
  return ALLOWED_KEY_PREFIXES.some(prefix => key.startsWith(prefix))
}

export async function putImageObject(params: {
  key: string
  body: Buffer | Uint8Array
  contentType: string
}): Promise<void> {
  if (!isAllowedKey(params.key)) throw new Error('Key not allowed')
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: IMMUTABLE_CACHE_CONTROL,
    }),
  )
}

export async function deleteImageObjects(keys: string[]): Promise<void> {
  const safeKeys = keys.filter(isAllowedKey)
  if (!safeKeys.length) return
  await getR2Client().send(
    new DeleteObjectsCommand({
      Bucket: getR2Bucket(),
      Delete: { Objects: safeKeys.map(Key => ({ Key })), Quiet: true },
    }),
  )
}
