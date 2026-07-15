import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VenueStaffDashboard } from '../src/components/VenueStaffDashboard'
import type { Gate } from '../src/types'

const mockGates: Gate[] = [
  {
    id: 'gate-a',
    name: 'Gate A — North Plaza',
    crowdLevel: 'moderate',
    crowdScore: 40,
    wheelchairAccessible: true,
    distanceMeters: 120,
    estimatedWaitMinutes: 8,
  },
  {
    id: 'gate-b',
    name: 'Gate B — East Concourse',
    crowdLevel: 'low',
    crowdScore: 10,
    wheelchairAccessible: false,
    distanceMeters: 340,
    estimatedWaitMinutes: 1,
  },
]

describe('VenueStaffDashboard', () => {
  it('renders the dashboard heading', () => {
    render(<VenueStaffDashboard gates={mockGates} />)
    expect(screen.getByText('Venue Staff Dashboard')).toBeInTheDocument()
  })

  it('renders the medical station quick-access section', () => {
    render(<VenueStaffDashboard gates={mockGates} />)
    expect(screen.getByText('Medical station')).toBeInTheDocument()
    expect(screen.getByText(/Medical Station/i)).toBeInTheDocument()
  })

  it('renders every gate in the operations table', () => {
    render(<VenueStaffDashboard gates={mockGates} />)
    expect(screen.getByText('Gate A — North Plaza')).toBeInTheDocument()
    expect(screen.getByText('Gate B — East Concourse')).toBeInTheDocument()
  })

  it('renders all registered facilities', () => {
    render(<VenueStaffDashboard gates={mockGates} />)
    expect(screen.getByText('Sensory Room')).toBeInTheDocument()
    expect(screen.getByText('Accessible Restroom')).toBeInTheDocument()
    expect(screen.getByText('Accessible Seating — Section 130')).toBeInTheDocument()
  })

  it('shows accessibility status for each gate', () => {
    render(<VenueStaffDashboard gates={mockGates} />)
    expect(screen.getAllByText('Yes').length).toBeGreaterThan(0)
    expect(screen.getAllByText('No').length).toBeGreaterThan(0)
  })
})
