import type { AccessibilityFeature, Gate } from '../types'

interface AccessibilityPanelProps {
  gates: Gate[]
}

const ACCESSIBILITY_FEATURES: Omit<AccessibilityFeature, 'gateIds'>[] = [
  {
    id: 'step-free',
    label: 'Step-free access',
    description: 'Ramps and level entry paths with no stairs.',
  },
  {
    id: 'accessible-seating',
    label: 'Accessible seating nearby',
    description: 'Designated wheelchair and companion seating close to entrance.',
  },
  {
    id: 'sensory-room',
    label: 'Sensory-friendly room',
    description: 'Quiet, low-stimulation space for sensory breaks.',
  },
]

/**
 * Surfaces accessibility features mapped to the gates that currently offer
 * them. Built as its own panel (rather than folded into GateFinder) since
 * accessibility needs are often the primary filter for some fans, not a
 * secondary toggle — it deserves equal visual weight, not an afterthought.
 */
export function AccessibilityPanel({ gates }: AccessibilityPanelProps) {
  const accessibleGates = gates.filter((g) => g.wheelchairAccessible)

  return (
    <section className="accessibility-panel" aria-label="Accessibility information">
      <h2>Accessibility at this venue</h2>

      {accessibleGates.length > 0 ? (
        <p>
          {accessibleGates.length} of {gates.length} gates currently offer step-free,
          wheelchair-accessible entry.
        </p>
      ) : (
        <p role="status">Accessible gate data is loading.</p>
      )}

      <ul className="accessibility-feature-list">
        {ACCESSIBILITY_FEATURES.map((feature) => (
          <li key={feature.id} className="accessibility-feature">
            <h3>{feature.label}</h3>
            <p>{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
