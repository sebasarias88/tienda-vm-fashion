'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { Toaster } from 'react-hot-toast'

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

    let frameId = 0
    function raf(time: number) {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }
    frameId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frameId)
      lenis.destroy()
    }
  }, [isAdmin])

  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111111',
            color: '#f0ebe4',
            border: '0.5px solid rgba(201,168,76,0.42)',
            borderRadius: '2px',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '12px',
            fontWeight: '300',
            letterSpacing: '0.5px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#C9A84C', secondary: '#111111' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#111111' },
          },
        }}
      />
    </>
  )
}
