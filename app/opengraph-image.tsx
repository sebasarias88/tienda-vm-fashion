import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'Tienda VM Fashion — Belleza y cuidado capilar'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Share preview (WhatsApp, Facebook, Instagram DMs…) with the real store logo. */
export default async function OpenGraphImage() {
  const logo = await readFile(path.join(process.cwd(), 'assets', 'og-logo.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #0f0e0c 0%, #1a1814 45%, #2a2418 100%)',
          color: '#f8f6f1',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <img src={logoSrc} width={190} height={190} alt="" style={{ marginBottom: 28 }} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 48,
              height: 2,
              background: '#e8c96a',
            }}
          />
          <span
            style={{
              fontSize: 18,
              letterSpacing: 8,
              textTransform: 'uppercase',
              color: '#c9a84c',
            }}
          >
            Armenia · Carrera 15 #19-25 Local 8
          </span>
          <div
            style={{
              width: 48,
              height: 2,
              background: '#e8c96a',
            }}
          />
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 300,
            letterSpacing: 6,
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1.1,
            background: 'linear-gradient(90deg, #c9a84c, #f0dfa0, #c9a84c)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          VM Fashion
        </div>
        <p
          style={{
            marginTop: 28,
            fontSize: 26,
            fontWeight: 300,
            color: 'rgba(248,246,241,0.78)',
            textAlign: 'center',
            maxWidth: 760,
            lineHeight: 1.4,
          }}
        >
          Belleza y cuidado capilar · Envíos a toda Colombia
        </p>
      </div>
    ),
    { ...size },
  )
}
