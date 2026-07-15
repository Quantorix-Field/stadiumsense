import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrganizerDashboard } from '../src/components/OrganizerDashboard'
import type { Gate } from '../src/types'

const mockGates: Gate[] = [
  {
    id: 'gate-a',
    name: 'Gate A — North Plaza',
    crowdLevel: 'critical',
    crowdScore: 90,
    wheelchairAccessible: true,
    distanceMeters: 120,
    estimatedWaitMinutes: 30,
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

describe('OrganizerDashboard', () => {
  it('renders the dashboard heading', () => {
    render(<OrganizerDashboard gates={mockGates} />)
    expect(screen.getByText('Organizer Dashboard')).toBeInTheDocument()
  })

  it('renders the venue overview stats', () => {
    render(<OrganizerDashboard gates={mockGates} />)
    expect(screen.getByText('Average wait')).toBeInTheDocument()
    expect(screen.getByText('Average crowd')).toBeInTheDocument()
  })

  it('shows a suggested action for the critical gate', () => {
    render(<OrganizerDashboard gates={mockGates} />)
    expect(screen.getByText(/critically crowded/i)).toBeInTheDocument()
  })

  it('shows a no-action message when all gates are quiet', () => {
    const quietGates = mockGates.map((g) => ({ ...g, crowdScore: 5 }))
    render(<OrganizerDashboard gates={quietGates} />)
    expect(screen.getByText(/no action needed/i)).toBeInTheDocument()
  })

  it('renders every gate in the summary table', () => {
    render(<OrganizerDashboard gates={mockGates} />)
    expect(screen.getByText('Gate A — North Plaza')).toBeInTheDocument()
    expect(screen.getByText('Gate B — East Concourse')).toBeInTheDocument()
  })
})
