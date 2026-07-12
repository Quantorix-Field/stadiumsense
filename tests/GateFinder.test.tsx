import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GateFinder } from '../src/components/GateFinder'
import type { Gate } from '../src/types'

const mockGates: Gate[] = [
  {
    id: 'g1',
    name: 'Gate A — North Plaza',
    crowdLevel: 'high',
    crowdScore: 70,
    wheelchairAccessible: false,
    distanceMeters: 120,
    estimatedWaitMinutes: 20,
  },
  {
    id: 'g2',
    name: 'Gate B — East Concourse',
    crowdLevel: 'low',
    crowdScore: 10,
    wheelchairAccessible: true,
    distanceMeters: 340,
    estimatedWaitMinutes: 1,
  },
]

describe('GateFinder', () => {
  it('shows a loading message while data is loading', () => {
    render(<GateFinder gates={[]} isLoading={true} />)
    expect(screen.getByText(/loading live gate conditions/i)).toBeInTheDocument()
  })

  it('renders all gates once loaded', () => {
    render(<GateFinder gates={mockGates} isLoading={false} />)
    expect(screen.getByText('Gate A — North Plaza')).toBeInTheDocument()
    expect(screen.getByText('Gate B — East Concourse')).toBeInTheDocument()
  })

  it('ranks gates with lower crowd and distance first', () => {
    render(<GateFinder gates={mockGates} isLoading={false} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Gate B — East Concourse')
  })

  it('filters to accessible-only gates when the checkbox is toggled', () => {
    render(<GateFinder gates={mockGates} isLoading={false} />)
    const checkbox = screen.getByRole('checkbox', { name: /wheelchair-accessible only/i })

    fireEvent.click(checkbox)

    expect(screen.queryByText('Gate A — North Plaza')).not.toBeInTheDocument()
    expect(screen.getByText('Gate B — East Concourse')).toBeInTheDocument()
  })

  it('shows a message when no gates match the filter', () => {
    const noAccessibleGates: Gate[] = [{ ...mockGates[0], wheelchairAccessible: false }]
    render(<GateFinder gates={noAccessibleGates} isLoading={false} />)
    const checkbox = screen.getByRole('checkbox', { name: /wheelchair-accessible only/i })

    fireEvent.click(checkbox)

    expect(screen.getByText(/no gates match this filter/i)).toBeInTheDocument()
  })
})
