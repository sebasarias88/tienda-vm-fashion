'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Eye, EyeOff, Film, Link2, Loader2, Plus, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ProductoVideo } from '@/types'
import VideoEmbed, { detectarVideoTipo } from '@/components/catalog/VideoEmbed'
import { uploadCatalogVideo, type VideoUploadProgress } from '@/lib/catalogVideos'
import { MAX_PRODUCT_VIDEOS } from '@/lib/productVideos'

type ProductVideosFieldProps = {
  videos: ProductoVideo[]
  onChange: (videos: ProductoVideo[]) => void
  onUploadingChange?: (uploading: boolean) => void
  poster?: string | null
}

const STAGE_LABEL: Record<VideoUploadProgress['stage'], string> = {
  analyzing: 'Analizando video…',
  converting: 'Optimizando video',
  uploading: 'Subiendo video',
}

const TIPO_LABEL: Record<ProductoVideo['tipo'], string> = {
  archivo: 'Video subido',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  instagram: 'Instagram',
  url: 'Enlace',
}

/**
 * Up to 5 videos per product: upload files (optimized to MP4 on R2) and/or paste
 * TikTok / YouTube / Instagram links. Order = order shown in the store.
 */
export default function ProductVideosField({
  videos,
  onChange,
  onUploadingChange,
  poster,
}: ProductVideosFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<VideoUploadProgress | null>(null)
  const [linkDraft, setLinkDraft] = useState('')
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const uploading = progress !== null
  const full = videos.length >= MAX_PRODUCT_VIDEOS

  // Always work on the latest list (an upload can take a while).
  const videosRef = useRef(videos)
  useEffect(() => {
    videosRef.current = videos
  }, [videos])

  const addVideo = (video: ProductoVideo) => {
    const current = videosRef.current
    if (current.length >= MAX_PRODUCT_VIDEOS) {
      toast.error(`Máximo ${MAX_PRODUCT_VIDEOS} videos por producto`)
      return
    }
    if (current.some(v => v.url === video.url)) {
      toast.error('Ese video ya está agregado')
      return
    }
    onChange([...current, video])
    setPreviewIndex(current.length)
  }

  const handleFile = async (file: File) => {
    setProgress({ stage: 'analyzing', percent: 0 })
    onUploadingChange?.(true)
    try {
      const result = await uploadCatalogVideo(file, setProgress)
      addVideo({ url: result.url, tipo: 'archivo' })
      const sizeMb = (result.sizeBytes / (1024 * 1024)).toFixed(1)
      toast.success(`Video listo (${sizeMb} MB). Guarda el producto para aplicarlo.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo subir el video')
    } finally {
      setProgress(null)
      onUploadingChange?.(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleAddLink = () => {
    const url = linkDraft.trim()
    if (!url) return
    try {
      new URL(url)
    } catch {
      toast.error('Pega un enlace válido (https://…)')
      return
    }
    addVideo({ url, tipo: detectarVideoTipo(url) })
    setLinkDraft('')
  }

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= videos.length) return
    const next = [...videos]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
    setPreviewIndex(null)
  }

  const remove = (index: number) => {
    onChange(videos.filter((_, i) => i !== index))
    setPreviewIndex(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <label className="admin-form-label">Videos del producto (opcional)</label>
        <span className="text-[11px] text-[var(--text-subtle)]">
          {videos.length}/{MAX_PRODUCT_VIDEOS}
        </span>
      </div>

      {videos.length > 0 && (
        <ul className="space-y-2">
          {videos.map((video, index) => (
            <li
              key={`${video.url}-${index}`}
              className="overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--gold)_15%,var(--border))] md:rounded-[2px]"
            >
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--gold)_12%,transparent)] text-[var(--gold)]">
                  {video.tipo === 'archivo' ? <Film size={13} /> : <Link2 size={13} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-[var(--text-primary)]">
                    Video {index + 1} · {TIPO_LABEL[video.tipo]}
                  </p>
                  <p className="truncate text-[11px] text-[var(--text-subtle)]">{video.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewIndex(previewIndex === index ? null : index)}
                  className="rounded-md p-1.5 text-[var(--text-muted)] hover:text-[var(--gold)]"
                  aria-label={previewIndex === index ? 'Ocultar vista previa' : 'Ver vista previa'}
                >
                  {previewIndex === index ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-md p-1.5 text-[var(--text-muted)] hover:text-[var(--gold)] disabled:opacity-30"
                  aria-label="Subir en el orden"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === videos.length - 1}
                  className="rounded-md p-1.5 text-[var(--text-muted)] hover:text-[var(--gold)] disabled:opacity-30"
                  aria-label="Bajar en el orden"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded-md p-1.5 text-[var(--text-faint)] hover:text-red-400"
                  aria-label={`Quitar video ${index + 1}`}
                >
                  <X size={14} />
                </button>
              </div>
              {previewIndex === index && (
                <div className="border-t border-[color-mix(in_srgb,var(--gold)_8%,var(--border))] bg-[rgba(0,0,0,0.3)]">
                  <VideoEmbed url={video.url} tipo={video.tipo} poster={poster} compact />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="admin-upload-zone min-h-[7rem] w-full disabled:cursor-wait"
          >
            {uploading ? (
              <div className="w-full max-w-xs space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-[var(--text-muted)]">
                  <Loader2 size={16} className="animate-spin text-[var(--gold-bright)]" />
                  <span className="text-[11px] tracking-[0.04em]">
                    {STAGE_LABEL[progress.stage]}
                    {progress.stage !== 'analyzing' ? ` ${progress.percent}%` : ''}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className="h-full bg-[var(--gold-bright)] transition-[width] duration-300"
                    style={{ width: `${progress.stage === 'analyzing' ? 5 : progress.percent}%` }}
                  />
                </div>
                <p className="admin-upload-zone__meta">No cierres esta ventana hasta que termine</p>
              </div>
            ) : (
              <>
                <Upload size={20} className="mb-2 text-[rgba(201,168,76,0.72)]" />
                <p className="admin-upload-zone__title">
                  <span className="text-[var(--gold-bright)]">
                    {videos.length ? 'Subir otro video' : 'Subir un video'}
                  </span>{' '}
                  desde tu celular o computador
                </p>
                <p className="admin-upload-zone__meta">
                  MP4, MOV (iPhone) o WEBM — máx. 3 minutos · Se optimiza automáticamente
                </p>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-[10px] uppercase tracking-[1.5px] text-[var(--text-faint)]">
              o agrega un link
            </span>
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              disabled={uploading}
              value={linkDraft}
              onChange={e => setLinkDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddLink()
                }
              }}
              placeholder="https://www.tiktok.com/@usuario/video/..."
              className="admin-input min-w-0 flex-1 rounded-xl border px-4 py-3 text-[13px] transition-[border-color,box-shadow,background-color] duration-200 md:rounded-[2px]"
            />
            <button
              type="button"
              onClick={handleAddLink}
              disabled={uploading || !linkDraft.trim()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--border)] px-4 text-[11px] font-medium uppercase tracking-[1.2px] text-[var(--gold)] transition-colors hover:border-[var(--gold)] disabled:opacity-40 md:rounded-[2px]"
            >
              <Plus size={13} />
              Agregar
            </button>
          </div>
        </>
      )}

      <p className="admin-form-hint">
        Hasta {MAX_PRODUCT_VIDEOS} videos: súbelos directamente o pega links de TikTok, YouTube o
        Instagram. Se muestran en este orden después de las fotos del producto.
      </p>
    </div>
  )
}
