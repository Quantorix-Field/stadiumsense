import { useEffect, useRef, useState } from 'react'
import type { Gate } from '../types'
import { getCurrentGates } from '../utils/crowdSimulator'

const POLL_INTERVAL_MS = 15_000

interface UseCrowdDataResult {
  gates: Gate[]
  isLoading: boolean
  lastUpdated: number | null
}

/**
 * Polls the crowd simulation engine on a fixed interval and exposes the
 * latest gate states. Isolated in a hook so components stay presentation-only
 * and the polling strategy can change (e.g. to a websocket) without touching UI.
 */
export function useCrowdData(): UseCrowdDataResult {
  const [gates, setGates] = useState<Gate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const refresh = () => {
      setGates(getCurrentGates())
      setLastUpdated(Date.now())
      setIsLoading(false)
    }

    refresh()
    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return { gates, isLoading, lastUpdated }
}
