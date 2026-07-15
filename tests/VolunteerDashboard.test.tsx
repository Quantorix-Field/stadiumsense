import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VolunteerDashboard } from '../src/components/VolunteerDashboard'
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

describe('VolunteerDashboard', () => {
  it('renders the dashboard heading', () => {
    render(<VolunteerDashboard gates={mockGates} />)
    expect(screen.getByText('Volunteer Dashboard')).toBeInTheDocument()
  })

  it('shows a priority alert for the critical gate', () => {
    render(<VolunteerDashboard gates={mockGates} />)
    expect(screen.getByText(/critically crowded/i)).toBeInTheDocument()
  })

  it('shows a no-alerts message when all gates are quiet', () => {
    const quietGates = mockGates.map((g) => ({ ...g, crowdScore: 5 }))
    render(<VolunteerDashboard gates={quietGates} />)
    expect(screen.getByText(/no gates currently need attention/i)).toBeInTheDocument()
  })

  it('renders the assist-a-fan route planner', () => {
    render(<VolunteerDashboard gates={mockGates} />)
    expect(screen.getByText('Plan your route')).toBeInTheDocument()
  })

  it('renders all four quick phrases', () => {
    render(<VolunteerDashboard gates={mockGates} />)
    expect(screen.getByText('Please follow me.')).toBeInTheDocument()
    expect(screen.getByText('This way to the exit.')).toBeInTheDocument()
    expect(screen.getByText('Do you need help?')).toBeInTheDocument()
    expect(screen.getByText('Please wait here.')).toBeInTheDocument()
  })
})
