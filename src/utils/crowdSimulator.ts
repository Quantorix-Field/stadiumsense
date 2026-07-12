import type { Gate, CrowdLevel } from '../types'

/**
 * Fixed gate registry for a standard FIFA World Cup 2026 stadium layout.
 * Real deployments would swap this for a live venue-management feed;
 * the interface below stays identical either way.
 */
const GATE_REGISTRY: Omit<Gate, 'crowdLevel' | 'crowdScore' | 'estimatedWaitMinutes'>[] = [
  { id: 'gate-a', name: 'Gate A — North Plaza', wheelchairAccessible: true, distanceMeters: 120 },
  {
    id: 'gate-b',
    name: 'Gate B — East Concourse',
    wheelchairAccessible: true,
    distanceMeters: 340,
  },
  {
    id: 'gate-c',
    name: 'Gate C — South Terrace',
    wheelchairAccessible: false,
    distanceMeters: 210,
  },
  { id: 'gate-d', name: 'Gate D — West Pavilion', wheelchairAccessible: true, distanceMeters: 480 },
  { id: 'gate-e', name: 'Gate E — VIP Entrance', wheelchairAccessible: true, distanceMeters: 90 },
]

/**
 * Converts a 0-100 crowd score into a discrete level used for UI color-coding
 * and AI-assistant reasoning ("avoid high/critical gates").
 */
export function scoreToCrowdLevel(score: number): CrowdLevel {
  if (score < 30) return 'low'
  if (score < 60) return 'moderate'
  if (score < 85) return 'high'
  return 'critical'
}

/**
 * Estimates wait time from crowd score using a simple non-linear curve —
 * congestion compounds rather than scaling linearly past ~70.
 */
export function estimateWaitMinutes(score: number): number {
  if (score < 30) return Math.round(score * 0.1)
  if (score < 70) return Math.round(3 + (score - 30) * 0.25)
  return Math.round(13 + (score - 70) * 0.9)
}

/**
 * Deterministic pseudo-random generator seeded by the current 5-minute window,
 * so all users see the same "live" crowd state without needing a backend push.
 * Swappable for a real telemetry feed without touching any consumer code.
 */
function seededScore(seed: string, windowIndex: number): number {
  const combined = `${seed}-${windowIndex}`
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 100
}

/**
 * Returns current gate states. Called by useCrowdData on a polling interval
 * to simulate live updates without any network dependency.
 */
export function getCurrentGates(): Gate[] {
  const windowIndex = Math.floor(Date.now() / (5 * 60 * 1000))

  return GATE_REGISTRY.map((gate) => {
    const crowdScore = seededScore(gate.id, windowIndex)
    return {
      ...gate,
      crowdScore,
      crowdLevel: scoreToCrowdLevel(crowdScore),
      estimatedWaitMinutes: estimateWaitMinutes(crowdScore),
    }
  })
}

/**
 * Ranks gates by a combined score of crowd level and distance, optionally
 * filtered to only wheelchair-accessible entrances.
 */
export function getRecommendedGates(gates: Gate[], requireAccessible = false): Gate[] {
  const candidates = requireAccessible ? gates.filter((g) => g.wheelchairAccessible) : gates

  return [...candidates].sort((a, b) => {
    const weightA = a.crowdScore * 0.7 + (a.distanceMeters / 10) * 0.3
    const weightB = b.crowdScore * 0.7 + (b.distanceMeters / 10) * 0.3
    return weightA - weightB
  })
}
