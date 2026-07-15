import type { Gate } from '../types'
import { getFacilities } from '../utils/routingEngine'
import { formatCrowdLevel, formatDistance, formatWaitTime } from '../utils/formatters'

interface VenueStaffDashboardProps {
  gates: Gate[]
}

const SEGMENT_LABELS: Record<string, string> = {
  N: 'North',
  NE: 'North-East',
  E: 'East',
  SE: 'South-East',
  S: 'South',
  SW: 'South-West',
  W: 'West',
  NW: 'North-West',
}

/**
 * Full operational view for venue staff: every gate's live status and
 * every registered facility with its concourse segment, so staff can
 * quickly locate and reason about resources without navigating the
 * fan-facing panels one at a time.
 */
export function VenueStaffDashboard({ gates }: VenueStaffDashboardProps) {
  const facilities = getFacilities()
  const medicalStation = facilities.find((f) => f.category === 'medical-station')

  return (
    <div className="persona-dashboard">
      <h2>Venue Staff Dashboard</h2>

      {medicalStation && (
        <section className="medical-quick-access" aria-label="Nearest medical station">
          <h3>Medical station</h3>
          <p>
            {medicalStation.name} — {SEGMENT_LABELS[medicalStation.segment]} concourse
          </p>
        </section>
      )}

      <section className="gate-operations-table" aria-label="Gate operations">
        <h3>Gate operations</h3>
        <table>
          <thead>
            <tr>
              <th scope="col">Gate</th>
              <th scope="col">Crowd</th>
              <th scope="col">Wait</th>
              <th scope="col">Distance</th>
              <th scope="col">Accessible</th>
            </tr>
          </thead>
          <tbody>
            {gates.map((gate) => (
              <tr key={gate.id}>
                <td>{gate.name}</td>
                <td>{formatCrowdLevel(gate.crowdLevel)}</td>
                <td>{formatWaitTime(gate.estimatedWaitMinutes)}</td>
                <td>{formatDistance(gate.distanceMeters)}</td>
                <td>{gate.wheelchairAccessible ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="facility-status-list" aria-label="Facility status">
        <h3>Facilities</h3>
        <ul className="facility-list">
          {facilities.map((facility) => (
            <li key={facility.id} className="facility-item">
              <span className="facility-name">{facility.name}</span>
              <span className="facility-segment">{SEGMENT_LABELS[facility.segment]} concourse</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
