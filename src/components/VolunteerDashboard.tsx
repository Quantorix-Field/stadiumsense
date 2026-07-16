import { lazy, Suspense } from 'react'
import type { Gate } from '../types'
import { getQuickPhrases, getSuggestedActions } from '../utils/operationsData'
import { RoutePlanner } from './RoutePlanner'
import { getTransportOptions } from '../utils/transportData'

const ChatAssistant = lazy(() =>
  import('./ChatAssistant').then((m) => ({ default: m.ChatAssistant }))
)
interface VolunteerDashboardProps {
  gates: Gate[]
}

/**
 * Tools built for a volunteer helping fans on the ground: the same routing
 * engine reframed as "assist a fan," a live list of gates that need
 * attention, and quick-reference phrases for fans who don't share a
 * language with the volunteer.
 */
export function VolunteerDashboard({ gates }: VolunteerDashboardProps) {
  const suggestedActions = getSuggestedActions(gates)
  const quickPhrases = getQuickPhrases()
  const transportOptions = getTransportOptions()

  return (
    <div className="persona-dashboard">
      <h2>Volunteer Dashboard</h2>

      <Suspense fallback={<p className="chat-loading">Loading assistant…</p>}>
        <ChatAssistant
          gates={gates}
          transportOptions={transportOptions}
          persona="volunteer"
          operations={{
            suggestedActions: suggestedActions.map((a) => a.message),
          }}
        />
      </Suspense>

      <section className="priority-alerts" aria-label="Priority alerts">
        <h3>Priority alerts</h3>
        {suggestedActions.length === 0 ? (
          <p role="status">No gates currently need attention.</p>
        ) : (
          <ul className="alert-list">
            {suggestedActions.map((action) => (
              <li key={action.id} className={`alert-item alert-${action.severity}`}>
                {action.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Assist a fan">
        <h3>Assist a fan</h3>
        <RoutePlanner gates={gates} />
      </section>

      <section className="quick-phrases" aria-label="Quick reference phrases">
        <h3>Quick phrases</h3>
        <ul className="phrase-list">
          {quickPhrases.map((phrase) => (
            <li key={phrase.id} className="phrase-item">
              <strong>{phrase.english}</strong>
              <div className="phrase-translations">
                {Object.entries(phrase.translations)
                  .filter(([lang]) => lang !== 'en')
                  .map(([lang, text]) => (
                    <span key={lang} className="phrase-translation">
                      {text}
                    </span>
                  ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
