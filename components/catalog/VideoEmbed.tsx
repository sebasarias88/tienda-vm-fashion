'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, ExternalLink } from 'lucide-react'
import type { VideoTipo } from '@/types'

type VideoEmbedProps = {
  url: string
  tipo: VideoTipo
  /** Vista previa admin (altura reducida) */
  compact?: boolean
  /** Llena el contenedor padre (p. ej. aspect-[3/4] de la galería) */
  fill?: boolean
}

/** Ancho nativo del embed TikTok v2 */
const TIKTOK_EMBED_W = 325
/** Alto total del iframe (player + footer) */
const TIKTOK_EMBED_H = 740
/** Alto del área de video (sin footer) — desktop */
const TIKTOK_PLAYER_H_DESKTOP = 575
/**
 * Mobile: un pelín por encima del player puro (controles),
 * pero sin llegar al footer CTA “Ver ahora” de TikTok.
 */
const TIKTOK_PLAYER_H_MOBILE = 568

const IFRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'

function getTikTokVideoId(url: string): string | null {
  const match = url.match(/video\/(\d+)/)
  return match ? match[1] : null
}

function getYouTubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\n?#/]+)/,
  )
  return match ? match[1] : null
}

function getInstagramPostId(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([^/?]+)/)
  return match ? match[1] : null
}

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return isMobile
}

function ExternalVideoLink({
  url,
  label,
  compact,
  fill,
}: {
  url: string
  label: string
  compact?: boolean
  fill?: boolean
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 bg-[var(--bg-surface)] ${
        fill ? 'absolute inset-0' : compact ? 'py-8' : 'py-12'
      }`}
    >
      <Play size={compact ? 20 : 24} className="text-[color-mix(in_srgb,var(--gold)_40%,transparent)]" />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-[2px] border border-[color-mix(in_srgb,var(--gold)_30%,var(--border))] px-5 py-3 text-[11px] font-light uppercase tracking-[2px] text-[var(--gold)] transition-all hover:bg-[color-mix(in_srgb,var(--gold)_6%,transparent)]"
      >
        <Play size={13} />
        {label}
      </a>
    </div>
  )
}

/** Desktop — lógica original que ya funcionaba bien (no tocar) */
function TikTokFillEmbedDesktop({
  videoId,
  onError,
}: {
  videoId: string
  onError: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const { clientWidth: w, clientHeight: h } = el
      if (!w || !h) return
      setScale(Math.min(h / TIKTOK_PLAYER_H_DESKTOP, w / TIKTOK_EMBED_W))
    }

    update()
    const raf = requestAnimationFrame(update)
    const t = window.setTimeout(update, 50)
    const t2 = window.setTimeout(update, 300)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
      window.clearTimeout(t2)
      ro.disconnect()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-white"
      style={{
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        isolation: 'isolate',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
      }}
    >
      <iframe
        src={`https://www.tiktok.com/embed/v2/${videoId}?autoplay=0`}
        title="Video TikTok"
        allow={IFRAME_ALLOW}
        onError={onError}
        width={TIKTOK_EMBED_W}
        height={TIKTOK_EMBED_H}
        className="absolute left-1/2 top-0 border-0"
        style={{
          width: TIKTOK_EMBED_W,
          height: TIKTOK_EMBED_H,
          maxWidth: 'none',
          transform: `translate3d(-50%, 0, 0) scale(${scale})`,
          transformOrigin: 'top center',
          willChange: 'transform',
        }}
      />
    </div>
  )
}

/**
 * Mobile — a la medida de la card 3:4.
 * Anclado arriba (como web) para no cortar el inicio del video.
 */
function TikTokFillEmbedMobile({
  videoId,
  onError,
}: {
  videoId: string
  onError: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const { clientWidth: w, clientHeight: h } = el
      if (!w || !h) return
      // Contain a la card; prioridad al alto para no zoom excesivo
      setScale(Math.min(w / TIKTOK_EMBED_W, h / TIKTOK_PLAYER_H_MOBILE))
    }

    update()
    const raf = requestAnimationFrame(update)
    const t = window.setTimeout(update, 50)
    const t2 = window.setTimeout(update, 300)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('orientationchange', update)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
      window.clearTimeout(t2)
      ro.disconnect()
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-white"
      style={{
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        isolation: 'isolate',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
      }}
    >
      <iframe
        src={`https://www.tiktok.com/embed/v2/${videoId}?autoplay=0`}
        title="Video TikTok"
        allow={`${IFRAME_ALLOW}; autoplay`}
        allowFullScreen
        onError={onError}
        width={TIKTOK_EMBED_W}
        height={TIKTOK_EMBED_H}
        className="absolute left-1/2 top-0 border-0"
        style={{
          width: TIKTOK_EMBED_W,
          height: TIKTOK_EMBED_H,
          maxWidth: 'none',
          transform: `translate3d(-50%, 0, 0) scale(${scale})`,
          transformOrigin: 'top center',
          willChange: 'transform',
        }}
      />
    </div>
  )
}

function TikTokFillEmbed({
  videoId,
  onError,
}: {
  videoId: string
  onError: () => void
}) {
  const isMobile = useIsMobileViewport()

  if (isMobile) {
    return <TikTokFillEmbedMobile videoId={videoId} onError={onError} />
  }

  return <TikTokFillEmbedDesktop videoId={videoId} onError={onError} />
}

export default function VideoEmbed({
  url,
  tipo,
  compact = false,
  fill = false,
}: VideoEmbedProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 bg-[var(--bg-surface)] ${
          fill ? 'absolute inset-0' : compact ? 'py-8' : 'py-16'
        }`}
      >
        <p className="text-[11px] font-light text-[var(--text-subtle)]">
          No se pudo cargar el video
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-[2px] border border-[color-mix(in_srgb,var(--gold)_30%,var(--border))] px-3 py-2 text-[10px] font-light uppercase tracking-[1.5px] text-[var(--gold)] transition-colors hover:bg-[color-mix(in_srgb,var(--gold)_6%,transparent)]"
        >
          <ExternalLink size={11} />
          Ver video original
        </a>
      </div>
    )
  }

  if (tipo === 'tiktok') {
    const videoId = getTikTokVideoId(url)

    if (!videoId) {
      return (
        <ExternalVideoLink url={url} label="Ver en TikTok" compact={compact} fill={fill} />
      )
    }

    if (fill) {
      return <TikTokFillEmbed videoId={videoId} onError={() => setError(true)} />
    }

    const tikTokHeight = compact ? '400px' : '640px'

    return (
      <div className="relative mx-auto w-full max-w-[325px] overflow-hidden bg-white">
        <div
          className="relative w-full overflow-hidden"
          style={{ height: compact ? '340px' : '560px' }}
        >
          <iframe
            src={`https://www.tiktok.com/embed/v2/${videoId}?autoplay=0`}
            style={{
              width: '100%',
              height: tikTokHeight,
              border: 'none',
              display: 'block',
            }}
            allow={IFRAME_ALLOW}
            onError={() => setError(true)}
            title="Video TikTok"
          />
        </div>
      </div>
    )
  }

  if (tipo === 'youtube') {
    const videoId = getYouTubeVideoId(url)
    if (!videoId) {
      return <ExternalVideoLink url={url} label="Ver en YouTube" compact={compact} fill={fill} />
    }

    if (fill) {
      return (
        <div className="absolute inset-0 overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            className="absolute inset-0 h-full w-full border-0"
            allow={IFRAME_ALLOW}
            onError={() => setError(true)}
            title="Video YouTube"
          />
        </div>
      )
    }

    return (
      <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%', height: 0 }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow={IFRAME_ALLOW}
          onError={() => setError(true)}
          title="Video YouTube"
        />
      </div>
    )
  }

  if (tipo === 'instagram') {
    const postId = getInstagramPostId(url)
    if (!postId) {
      return <ExternalVideoLink url={url} label="Ver en Instagram" compact={compact} fill={fill} />
    }

    if (fill) {
      return (
        <div className="absolute inset-0 overflow-hidden bg-white">
          <iframe
            src={`https://www.instagram.com/p/${postId}/embed/`}
            className="absolute left-1/2 top-0 border-0"
            style={{
              width: '100%',
              maxWidth: '540px',
              height: 'calc(100% + 8rem)',
              transform: 'translateX(-50%) scale(1.08)',
              transformOrigin: 'top center',
            }}
            allow={IFRAME_ALLOW}
            onError={() => setError(true)}
            title="Video Instagram"
          />
        </div>
      )
    }

    const height = compact ? '280px' : '560px'
    return (
      <div className="relative mx-auto w-full max-w-[420px] overflow-hidden bg-white" style={{ height }}>
        <iframe
          src={`https://www.instagram.com/p/${postId}/embed/`}
          style={{
            width: '100%',
            height: `calc(${height} + 5rem)`,
            border: 'none',
            overflow: 'hidden',
          }}
          allow={IFRAME_ALLOW}
          onError={() => setError(true)}
          title="Video Instagram"
        />
      </div>
    )
  }

  return <ExternalVideoLink url={url} label="Ver video" compact={compact} fill={fill} />
}

export function detectarVideoTipo(url: string): VideoTipo {
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('instagram.com')) return 'instagram'
  return 'url'
}
