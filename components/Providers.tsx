'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, useTheme } from '@/components/ThemeProvider'

function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: isDark ? '#111111' : '#FFFFFF',
          color: isDark ? '#f0ebe4' : '#1A1612',
          border: isDark
            ? '0.5px solid rgba(201,168,76,0.42)'
            : '0.5px solid rgba(154,115,48,0.32)',
          borderRadius: '2px',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '12px',
          fontWeight: '300',
          letterSpacing: '0.5px',
          padding: '12px 16px',
          boxShadow: isDark
            ? '0 12px 40px rgba(0,0,0,0.5)'
            : '0 8px 32px rgba(26,22,18,0.1)',
        },
        success: {
          iconTheme: {
            primary: '#C9A84C',
            secondary: isDark ? '#111111' : '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#f87171',
            secondary: isDark ? '#111111' : '#FFFFFF',
          },
        },
      }}
    />
  )
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    if (isAdmin) return

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      allowNestedScroll: true,
    })

    ;(window as Window & { __lenis?: Lenis }).__lenis = lenis

    let frameId = 0
    function raf(time: number) {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }
    frameId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frameId)
      delete (window as Window & { __lenis?: Lenis }).__lenis
      lenis.destroy()
    }
  }, [isAdmin])

  return (
    <ThemeProvider>
      {children}
      <ThemedToaster />
    </ThemeProvider>
  )
}
