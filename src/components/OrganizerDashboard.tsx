import { lazy, Suspense } from 'react'
import type { Gate } from '../types'
import { getSuggestedActions, getVenueOverview } from '../utils/operationsData'
import { formatCrowdLevel, formatWaitTime } from '../utils/formatters'
import { scoreToCrowdLevel } from '../utils/crowdSimulator'
import { getTransportOptions } from '../utils/transportData'

const ChatAssistant = lazy(() =>
  import('./ChatAssistant').then((m) => ({ default: m.ChatAssistant }))
)

interface OrganizerDashboardProps {
  gates: Gate[]
}

/**
 * Venue-wide view for an organizer: a single at-a-glance health summary
 * and deterministic suggested actions, both computed from the same live
 * crowd data fans and volunteers see — an organizer is never looking at
 * numbers that disagree with what's shown elsewhere in the app.
 */
export function OrganizerDashboard({ gates }: OrganizerDashboardProps) {
  const overview = getVenueOverview(gates)
  const suggestedActions = getSuggestedActions(gates)
  const transportOptions = getTransportOptions()

  return (
    <div className="persona-dashboard">
      <h2>Organizer Dashboard</h2>

      <Suspense fallback={<p className="chat-loading">Loading assistant…</p>}>
        <ChatAssistant
          gates={gates}
          transportOptions={transportOptions}
          persona="organizer"
          operations={{
            suggestedActions: suggestedActions.map((a) => a.message),
            averageWaitMinutes: overview?.averageWaitMinutes,
            averageCrowdLevel: overview
              ? formatCrowdLevel(scoreToCrowdLevel(overview.averageCrowdScore))
              : undefined,
          }}
        />
      </Suspense>

      {overview && (
        <section className="venue-overview" aria-label="Venue overview">
          <h3>Venue overview</h3>
          <div className="overview-stats">
            <div className="overview-stat">
              <span className="overview-stat-label">Average wait</span>
              <span className="overview-stat-value">
                {formatWaitTime(overview.averageWaitMinutes)}
              </span>
            </div>
            <div className="overview-stat">
              <span className="overview-stat-label">Average crowd</span>
              <span className="overview-stat-value">
                {formatCrowdLevel(scoreToCrowdLevel(overview.averageCrowdScore))}
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="suggested-actions" aria-label="Suggested actions">
        <h3>Suggested actions</h3>
        {suggestedActions.length === 0 ? (
          <p role="status">No action needed — all gates within normal capacity.</p>
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

      <section className="gate-summary-table" aria-label="All gates summary">
        <h3>All gates</h3>
        <table>
          <thead>
            <tr>
              <th scope="col">Gate</th>
              <th scope="col">Crowd</th>
              <th scope="col">Wait</th>
            </tr>
          </thead>
          <tbody>
            {gates.map((gate) => (
              <tr key={gate.id}>
                <td>{gate.name}</td>
                <td>{formatCrowdLevel(gate.crowdLevel)}</td>
                <td>{formatWaitTime(gate.estimatedWaitMinutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
