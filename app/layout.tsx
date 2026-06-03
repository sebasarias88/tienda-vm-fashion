import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'Tienda VM Fashion',
  description: 'Productos de belleza y cuidado capilar en Armenia, Quindío. Envíos a toda Colombia.',
  keywords: 'belleza, cuidado capilar, shampoo, mascarillas, Armenia, Quindío',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={outfit.variable}>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
