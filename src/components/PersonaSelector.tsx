import type { Persona } from '../types'

interface PersonaSelectorProps {
  onSelect: (persona: Persona) => void
}

const PERSONA_OPTIONS: { value: Persona; label: string; description: string }[] = [
  {
    value: 'fan',
    label: 'Fan',
    description: 'Find your gate, plan your route, and get answers from the AI assistant.',
  },
  {
    value: 'volunteer',
    label: 'Volunteer',
    description: 'Help fans navigate, see priority alerts, and access quick-reference phrases.',
  },
  {
    value: 'organizer',
    label: 'Organizer',
    description: 'Monitor venue-wide crowd conditions and get suggested operational actions.',
  },
  {
    value: 'venue-staff',
    label: 'Venue Staff',
    description: 'View full gate operations and facility status at a glance.',
  },
]

/**
 * Entry screen that routes the person to the correct dashboard for their
 * role. Each persona sees a distinct set of tools built for their actual
 * job, rather than one dashboard trying to serve everyone at once.
 */
export function PersonaSelector({ onSelect }: PersonaSelectorProps) {
  return (
    <section className="persona-selector" aria-label="Select your role">
      <h2>I am a...</h2>
      <div className="persona-options">
        {PERSONA_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className="persona-option"
            onClick={() => onSelect(option.value)}
          >
            <span className="persona-option-label">{option.label}</span>
            <span className="persona-option-description">{option.description}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
