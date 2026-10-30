'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * Tracks in-flight requests by key (usually a row id) so quick toggles can show
 * a spinner and ignore repeated taps until the first request finishes.
 */
export function usePendingKeys() {
  const pendingRef = useRef(new Set<string>())
  const [pending, setPending] = useState<ReadonlySet<string>>(() => new Set())

  const run = useCallback(async (key: string, action: () => Promise<unknown>) => {
    if (pendingRef.current.has(key)) return
    pendingRef.current.add(key)
    setPending(new Set(pendingRef.current))
    try {
      await action()
    } finally {
      pendingRef.current.delete(key)
      setPending(new Set(pendingRef.current))
    }
  }, [])

  const isPending = useCallback((key: string) => pending.has(key), [pending])

  return { run, isPending }
}
