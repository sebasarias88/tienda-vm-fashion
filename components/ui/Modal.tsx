'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ReactNode, useEffect } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className={`fixed left-1/2 top-1/2 z-50 flex w-full max-h-[min(90vh,100dvh)] -translate-x-1/2 -translate-y-1/2 flex-col ${sizes[size]} bg-[#111111] border border-[rgba(184,146,42,0.3)] rounded-[2px] overflow-hidden`}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="flex flex-shrink-0 items-center justify-between border-b border-[rgba(184,146,42,0.22)] px-6 py-5">
                <h2 className="text-[13px] tracking-[2px] uppercase font-light text-[#1A1A1A]">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[rgba(240,235,228,0.52)] hover:text-[#1A1A1A] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5"
              data-lenis-prevent
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
