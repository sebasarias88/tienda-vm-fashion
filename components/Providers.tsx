'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, useTheme } from '@/components/ThemeProvider'

function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={10}
      containerClassName="app-toast-container"
      toastOptions={{
        className: 'app-toast',
        duration: 3800,
        style: {
          background: isDark ? 'var(--bg-card)' : '#FFFFFF',
          color: 'var(--text-primary)',
          border: isDark
            ? '1px solid rgba(201,168,76,0.28)'
            : '1px solid rgba(154,115,48,0.22)',
          borderRadius: '0.75rem',
          fontFamily: 'var(--font-outfit), Outfit, sans-serif',
          fontSize: '13px',
          fontWeight: '300',
          letterSpacing: '0.02em',
          lineHeight: '1.45',
          padding: '0.875rem 1rem',
          boxShadow: isDark
            ? '0 10px 36px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,168,76,0.06)'
            : '0 8px 28px rgba(26,22,18,0.1), 0 0 0 1px rgba(154,115,48,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        },
        success: {
          iconTheme: {
            primary: '#C9A84C',
            secondary: isDark ? 'var(--bg-card)' : '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#f87171',
            secondary: isDark ? 'var(--bg-card)' : '#FFFFFF',
          },
        },
      }}
    />
  )
}

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
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
  }, [])

  return (
    <ThemeProvider>
      {children}
      <ThemedToaster />
    </ThemeProvider>
  )
}
