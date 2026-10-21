'use client'

import { useRef, useState } from 'react'
import { Film, Loader2, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { VideoTipo } from '@/types'
import VideoEmbed, { detectarVideoTipo } from '@/components/catalog/VideoEmbed'
import { uploadCatalogVideo, type VideoUploadProgress } from '@/lib/catalogVideos'

type ProductVideoFieldProps = {
  videoUrl: string
  videoTipo: '' | VideoTipo
  onChange: (url: string, tipo: '' | VideoTipo) => void
  onUploadingChange?: (uploading: boolean) => void
  poster?: string | null
}

const STAGE_LABEL: Record<VideoUploadProgress['stage'], string> = {
  analyzing: 'Analizando video…',
  converting: 'Optimizando video',
  uploading: 'Subiendo video',
}

/**
 * Product video: upload a file from the phone/computer (optimized to MP4 and stored in R2)
 * or paste a TikTok / YouTube / Instagram link.
 */
export default function ProductVideoField({
  videoUrl,
  videoTipo,
  onChange,
  onUploadingChange,
  poster,
}: ProductVideoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<VideoUploadProgress | null>(null)
  const uploading = progress !== null

  const handleFile = async (file: File) => {
    setProgress({ stage: 'analyzing', percent: 0 })
    onUploadingChange?.(true)
    try {
      const result = await uploadCatalogVideo(file, setProgress)
      onChange(result.url, 'archivo')
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

  return (
    <div className="space-y-3">
      <label className="admin-form-label">Video del producto (opcional)</label>

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
              <span className="text-[var(--gold-bright)]">Subir un video</span> desde tu celular o computador
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
        <span className="text-[10px] uppercase tracking-[1.5px] text-[var(--text-faint)]">o pega un link</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <div className="relative">
        <input
          type="url"
          disabled={uploading}
          value={videoTipo === 'archivo' ? '' : videoUrl}
          onChange={e => {
            const url = e.target.value
            onChange(url, url.trim() ? detectarVideoTipo(url.trim()) : '')
          }}
          placeholder="https://www.tiktok.com/@usuario/video/..."
          className="admin-input w-full rounded-xl border px-4 py-3 pr-24 text-[13px] transition-[border-color,box-shadow,background-color] duration-200 md:rounded-[2px]"
        />
        {videoTipo && videoTipo !== 'archivo' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[2px] border border-[color-mix(in_srgb,var(--gold)_20%,var(--border))] bg-[color-mix(in_srgb,var(--gold)_10%,transparent)] px-2 py-1 text-[9px] font-medium uppercase tracking-[1.5px] text-[var(--gold)]">
            {videoTipo}
          </span>
        )}
      </div>

      <p className="admin-form-hint">
        Sube el video directamente, o pega el link de TikTok, YouTube o Instagram. Se mostrará al
        final de las imágenes del producto.
      </p>

      {videoUrl && videoTipo && (
        <div className="overflow-hidden rounded-[2px] border border-[color-mix(in_srgb,var(--gold)_15%,var(--border))] bg-[rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--gold)_8%,var(--border))] px-3 py-2">
            <span className="flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[1px] text-[var(--text-subtle)]">
              {videoTipo === 'archivo' && <Film size={11} />}
              Vista previa
            </span>
            <button
              type="button"
              onClick={() => onChange('', '')}
              className="text-[var(--text-faint)] transition-colors hover:text-red-400"
              aria-label="Quitar video"
            >
              <X size={12} />
            </button>
          </div>
          <VideoEmbed url={videoUrl} tipo={videoTipo} poster={poster} compact />
        </div>
      )}
    </div>
  )
}
