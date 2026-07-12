import { useState, type FormEvent } from 'react'
import type { AccessibilityNeed, Gate, RouteResult } from '../types'
import { getAccessibilityNeedOptions, getFacilities, resolveRoute } from '../utils/routingEngine'
import { formatCrowdLevel, formatDistance } from '../utils/formatters'

interface RoutePlannerProps {
  gates: Gate[]
}

/**
 * Structured "plan your route" tool. Unlike free-form chat, this collects
 * explicit context (current gate, destination, accessibility needs) and
 * resolves it through the deterministic routing engine — the facts are
 * computed here, not phrased by an LLM, so a route can never be invented.
 */
export function RoutePlanner({ gates }: RoutePlannerProps) {
  const facilities = getFacilities()
  const accessibilityOptions = getAccessibilityNeedOptions()

  const [fromGateId, setFromGateId] = useState(gates[0]?.id ?? '')
  const [toFacilityId, setToFacilityId] = useState(facilities[0]?.id ?? '')
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<AccessibilityNeed[]>([])
  const [minutesToKickoff, setMinutesToKickoff] = useState('')
  const [result, setResult] = useState<RouteResult | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const toggleNeed = (need: AccessibilityNeed) => {
    setAccessibilityNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const parsedMinutes = minutesToKickoff.trim() === '' ? undefined : Number(minutesToKickoff)
    const route = resolveRoute({
      fromGateId,
      toFacilityId,
      accessibilityNeeds,
      minutesToKickoff: parsedMinutes,
    })
    setResult(route)
    setHasSearched(true)
  }

  return (
    <section className="route-planner" aria-label="Plan your route">
      <h2>Plan your route</h2>

      <form onSubmit={handleSubmit} className="route-form">
        <label htmlFor="from-gate">Where are you now?</label>
        <select id="from-gate" value={fromGateId} onChange={(e) => setFromGateId(e.target.value)}>
          {gates.map((gate) => (
            <option key={gate.id} value={gate.id}>
              {gate.name}
            </option>
          ))}
        </select>

        <label htmlFor="to-facility">Where do you want to go?</label>
        <select
          id="to-facility"
          value={toFacilityId}
          onChange={(e) => setToFacilityId(e.target.value)}
        >
          {facilities.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.name}
            </option>
          ))}
        </select>

        <fieldset className="route-accessibility-needs">
          <legend>Accessibility needs</legend>
          {accessibilityOptions.map((option) => (
            <label key={option.value} className="route-checkbox-label">
              <input
                type="checkbox"
                checked={accessibilityNeeds.includes(option.value)}
                onChange={() => toggleNeed(option.value)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <label htmlFor="minutes-to-kickoff">Minutes to kick-off (optional)</label>
        <input
          id="minutes-to-kickoff"
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="e.g. 15"
          value={minutesToKickoff}
          onChange={(e) => setMinutesToKickoff(e.target.value)}
        />

        <button type="submit">Get directions</button>
      </form>

      {hasSearched && !result && (
        <p role="alert" className="route-error">
          Couldn't resolve that route — please check your selections.
        </p>
      )}

      {result && (
        <div className="route-result" aria-live="polite">
          {result.isUrgent && result.urgencyMessage && (
            <p role="alert" className="route-urgency-warning">
              ⚠️ {result.urgencyMessage}
            </p>
          )}
          <div className="route-badges">
            <span className="route-badge">{result.destinationName}</span>
            <span className="route-badge">Crowd: {formatCrowdLevel(result.crowdLevel)}</span>
            <span className="route-badge">
              {result.stepFree ? 'Step-free / Accessible' : 'Includes stairs'}
            </span>
            <span className="route-badge">{formatDistance(result.totalDistanceMeters)}</span>
          </div>

          <ol className="route-steps">
            {result.steps.map((step, index) => (
              <li key={`${step.segment}-${index}`}>{step.instruction}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
