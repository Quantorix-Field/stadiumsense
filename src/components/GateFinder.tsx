import { memo, useMemo, useState } from 'react'
import type { Gate } from '../types'
import { getRecommendedGates } from '../utils/crowdSimulator'
import { formatDistance, formatWaitTime } from '../utils/formatters'
import { CrowdMeter } from './CrowdMeter'

interface GateFinderProps {
  gates: Gate[]
  isLoading: boolean
}

/**
 * Ranks and lists stadium gates by crowd level and distance, with an
 * accessibility-only filter. Ranking logic itself lives in crowdSimulator
 * so it stays unit-testable independent of any rendering concerns.
 */
function GateFinderComponent({ gates, isLoading }: GateFinderProps) {
  const [accessibleOnly, setAccessibleOnly] = useState(false)

  const rankedGates = useMemo(
    () => getRecommendedGates(gates, accessibleOnly),
    [gates, accessibleOnly]
  )

  if (isLoading) {
    return (
      <section className="gate-finder" aria-busy="true">
        <p>Loading live gate conditions…</p>
      </section>
    )
  }

  return (
    <section className="gate-finder" aria-label="Gate recommendations">
      <div className="gate-finder-header">
        <h2>Recommended gates</h2>
        <label className="gate-finder-filter">
          <input
            type="checkbox"
            checked={accessibleOnly}
            onChange={(e) => setAccessibleOnly(e.target.checked)}
          />
          Wheelchair-accessible only
        </label>
      </div>

      {rankedGates.length === 0 && (
        <p role="status">No gates match this filter right now.</p>
      )}

      <ul className="gate-list">
        {rankedGates.map((gate, index) => (
          <li key={gate.id} className="gate-card">
            <div className="gate-card-header">
              <span className="gate-rank" aria-hidden="true">
                #{index + 1}
              </span>
              <h3>{gate.name}</h3>
              {gate.wheelchairAccessible && (
                <span className="gate-badge" aria-label="Wheelchair accessible">
                  ♿
                </span>
              )}
            </div>
            <CrowdMeter level={gate.crowdLevel} score={gate.crowdScore} />
            <div className="gate-card-meta">
              <span>{formatDistance(gate.distanceMeters)} away</span>
              <span>{formatWaitTime(gate.estimatedWaitMinutes)}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * Memoized since GateFinder re-ranks and re-renders its full gate list
 * on every parent update — memoization skips that work when the gates
 * array reference and isLoading flag haven't actually changed.
 */
export const GateFinder = memo(GateFinderComponent)
