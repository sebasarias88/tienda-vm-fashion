import type { MetadataRoute } from 'next'

/**
 * Web App Manifest: name, icons and colors used when the store is added
 * to the home screen on Android/iPhone ("install as app").
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tienda VM Fashion',
    short_name: 'VM Fashion',
    description: 'Belleza y cuidado capilar en Armenia, Quindío. Envíos a todo Colombia.',
    lang: 'es-CO',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f0e0c',
    theme_color: '#0f0e0c',
    categories: ['shopping', 'beauty'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
