import type { CrowdLevel } from '../types'

/**
 * Maps a crowd level to a human-readable label used across gate cards
 * and the AI assistant's spoken recommendations.
 */
export function formatCrowdLevel(level: CrowdLevel): string {
  const labels: Record<CrowdLevel, string> = {
    low: 'Low crowd',
    moderate: 'Moderate crowd',
    high: 'Busy',
    critical: 'Very busy',
  }
  return labels[level]
}

/**
 * Maps a crowd level to a color token consumed by CrowdMeter and GateFinder.
 * Kept centralized so a palette change never requires touching component code.
 */
export function crowdLevelColor(level: CrowdLevel): string {
  const colors: Record<CrowdLevel, string> = {
    low: '#1b9e5c',
    moderate: '#c98a12',
    high: '#d9622b',
    critical: '#c0392b',
  }
  return colors[level]
}

/**
 * Formats a distance in meters into a friendly string, switching to
 * kilometers past 1000m for readability.
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${meters} m`
}

/**
 * Formats an estimated wait time, collapsing near-zero waits to "No wait"
 * rather than showing "0 min", which reads as broken rather than good news.
 */
export function formatWaitTime(minutes: number): string {
  if (minutes <= 1) return 'No wait'
  return `${minutes} min wait`
}

/**
 * Formats a Unix timestamp into a short local time string for chat messages.
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
