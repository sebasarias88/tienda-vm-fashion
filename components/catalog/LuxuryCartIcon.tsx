'use client'

import { useId } from 'react'
import { motion } from 'framer-motion'

type LuxuryCartIconProps = {
  size?: number
}

export default function LuxuryCartIcon({ size = 20 }: LuxuryCartIconProps) {
  const gradId = `cartGold-${useId().replace(/:/g, '')}`

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      aria-hidden
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E6C76A" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#C9A030" />
          </linearGradient>
        </defs>
        {/* Black circle base */}
        <circle
          cx="12"
          cy="12"
          r="10.5"
          fill="#0D0D0D"
          stroke="rgba(212,175,55,0.22)"
          strokeWidth="0.5"
        />
        {/* Sparkle accents */}
        <path
          d="M18.5 5.5 L18.8 6.3 L19.6 6.6 L18.8 6.9 L18.5 7.7 L18.2 6.9 L17.4 6.6 L18.2 6.3 Z"
          fill="#E6C76A"
          opacity="0.85"
        />
        <path
          d="M6 7 L6.2 7.5 L6.7 7.7 L6.2 7.9 L6 8.4 L5.8 7.9 L5.3 7.7 L5.8 7.5 Z"
          fill="#FFFFFF"
          opacity="0.6"
        />
        {/* Shopping bag — gold gradient */}
        <path
          d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
          stroke={`url(#${gradId})`}
          strokeWidth="1.5"
          fill="none"
        />
        <line x1="3" y1="6" x2="21" y2="6" stroke={`url(#${gradId})`} strokeWidth="1.5" />
        <path
          d="M16 10a4 4 0 01-8 0"
          stroke={`url(#${gradId})`}
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </motion.div>
  )
}
