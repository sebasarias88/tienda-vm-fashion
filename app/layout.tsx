import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import ScrollToTop from '@/components/ScrollToTop'
import ConnectionStatus from '@/components/ConnectionStatus'
import { getSiteUrl } from '@/lib/seo'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Catálogo detal — Tienda VM Fashion',
    template: '%s | Tienda VM Fashion',
  },
  description:
    'Catálogo detal de belleza y cuidado capilar en Carrera 15 #19-25 Local 8, Armenia, Quindío. Envíos a toda Colombia.',
  keywords: [
    'belleza',
    'cuidado capilar',
    'cosmética',
    'catálogo detal',
    'VM Fashion',
    'Armenia',
    'Quindío',
    'Colombia',
  ],
  applicationName: 'Tienda VM Fashion',
  authors: [{ name: 'Tienda VM Fashion' }],
  creator: 'Tienda VM Fashion',
  publisher: 'Tienda VM Fashion',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Tienda VM Fashion',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={outfit.variable}>
      <body className="min-h-screen antialiased">
        <ScrollToTop />
        <ConnectionStatus />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
