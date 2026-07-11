import { memo } from 'react'
import { getSustainabilityTips, getTransportOptions } from '../utils/transportData'

const MODE_ICONS: Record<string, string> = {
  metro: '🚇',
  bus: '🚌',
  shuttle: '🚐',
  walking: '🚶',
}

/**
 * Surfaces transportation options and sustainability guidance for fans
 * heading to the venue. Kept as its own panel rather than folded into
 * GateFinder since "how do I get there" and "which gate do I use" are
 * distinct decisions a fan makes at different points in their journey.
 */
function TransportPanelComponent() {
  const transportOptions = getTransportOptions()
  const sustainabilityTips = getSustainabilityTips()

  return (
    <section className="transport-panel" aria-label="Transportation and sustainability">
      <h2>Getting there</h2>

      <ul className="transport-list">
        {transportOptions.map((option) => (
          <li key={option.id} className="transport-option">
            <span className="transport-icon" aria-hidden="true">
              {MODE_ICONS[option.mode]}
            </span>
            <div className="transport-details">
              <span className="transport-label">{option.label}</span>
              <span className="transport-eta">{option.etaMinutes} min</span>
            </div>
          </li>
        ))}
      </ul>

      <h3>Travel sustainably</h3>
      <ul className="sustainability-list">
        {sustainabilityTips.map((tip) => (
          <li key={tip.id} className="sustainability-tip">
            <strong>{tip.label}</strong>
            <p>{tip.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * Memoized since this panel renders entirely static data with no props —
 * it never needs to re-render once mounted.
 */
export const TransportPanel = memo(TransportPanelComponent)
