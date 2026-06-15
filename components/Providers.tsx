'use client'

import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { Toaster, ToastPosition } from 'react-hot-toast'
import { ThemeProvider, useTheme } from '@/components/ThemeProvider'

function useIsMobileToast() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return isMobile
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const isMobile = useIsMobileToast()

  const position: ToastPosition = isMobile ? 'top-center' : 'top-right'
  const containerClassName = isMobile
    ? 'app-toast-container app-toast-container--mobile'
    : 'app-toast-container app-toast-container--desktop'

  const shared = {
    duration: 3800,
    className: isMobile ? 'app-toast app-toast--mobile' : 'app-toast app-toast--desktop',
    success: {
      iconTheme: {
        primary: '#C9A84C',
        secondary: isDark ? '#1a1a1a' : '#FFFFFF',
      },
    },
    error: {
      iconTheme: {
        primary: '#f87171',
        secondary: isDark ? '#1a1a1a' : '#FFFFFF',
      },
    },
  }

  const mobileStyle = {
    background: isDark ? 'var(--bg-card)' : '#FFFFFF',
    color: 'var(--text-primary)',
    border: isDark
      ? '1px solid rgba(201,168,76,0.28)'
      : '1px solid rgba(154,115,48,0.22)',
    borderRadius: '0.75rem',
    fontFamily: 'var(--font-outfit), Outfit, sans-serif',
    fontSize: '13px',
    fontWeight: '400',
    letterSpacing: '0.02em',
    lineHeight: '1.45',
    padding: '0.875rem 1rem',
    boxShadow: isDark
      ? '0 10px 36px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,168,76,0.06)'
      : '0 8px 28px rgba(26,22,18,0.1), 0 0 0 1px rgba(154,115,48,0.06)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  }

  const desktopStyle = {
    background: isDark ? '#161616' : '#FFFFFF',
    color: isDark ? '#F5F2EC' : '#1E1E1E',
    border: '1px solid rgba(201, 168, 76, 0.42)',
    borderRadius: '2px',
    fontFamily: 'var(--font-outfit), Outfit, sans-serif',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0.03em',
    lineHeight: '1.5',
    padding: '0.8125rem 1rem',
    minWidth: '17.5rem',
    maxWidth: '22rem',
    boxShadow: isDark
      ? '0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
      : '0 14px 36px rgba(34,34,34,0.14), 0 0 0 1px rgba(201,168,76,0.12)',
  }

  return (
    <Toaster
      position={position}
      reverseOrder={false}
      gutter={isMobile ? 10 : 12}
      containerClassName={containerClassName}
      toastOptions={{
        ...shared,
        style: isMobile ? mobileStyle : desktopStyle,
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
