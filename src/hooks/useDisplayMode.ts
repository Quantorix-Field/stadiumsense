import { useState } from 'react'
import type { DisplayMode } from '../types'

interface UseDisplayModeResult {
  mode: DisplayMode
  toggle: () => void
  isHighVisibility: boolean
}

/**
 * Tracks whether the fan has enabled high-visibility / screen-reader mode —
 * larger text, higher contrast, and more explicit status text for assistive
 * technology. Kept as a hook (rather than a CSS media query) since it's an
 * explicit user choice, not a system preference, matching how a fan would
 * expect a stadium kiosk or personal device to behave consistently.
 */
export function useDisplayMode(): UseDisplayModeResult {
  const [mode, setMode] = useState<DisplayMode>('standard')

  const toggle = () => {
    setMode((prev) => (prev === 'standard' ? 'high-visibility' : 'standard'))
  }

  return { mode, toggle, isHighVisibility: mode === 'high-visibility' }
}
