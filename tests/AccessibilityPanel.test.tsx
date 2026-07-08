import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AccessibilityPanel } from '../src/components/AccessibilityPanel'
import type { Gate } from '../src/types'

const mockGates: Gate[] = [
  {
    id: 'g1',
    name: 'Gate A — North Plaza',
    crowdLevel: 'high',
    crowdScore: 70,
    wheelchairAccessible: true,
    distanceMeters: 120,
    estimatedWaitMinutes: 20,
  },
  {
    id: 'g2',
    name: 'Gate B — East Concourse',
    crowdLevel: 'low',
    crowdScore: 10,
    wheelchairAccessible: false,
    distanceMeters: 340,
    estimatedWaitMinutes: 1,
  },
]

describe('AccessibilityPanel', () => {
  it('renders the static accessibility feature list', () => {
    render(<AccessibilityPanel gates={mockGates} />)
    expect(screen.getByText('Step-free access')).toBeInTheDocument()
    expect(screen.getByText('Accessible seating nearby')).toBeInTheDocument()
    expect(screen.getByText('Sensory-friendly room')).toBeInTheDocument()
  })

  it('reports the correct count of accessible gates out of total', () => {
    render(<AccessibilityPanel gates={mockGates} />)
    expect(screen.getByText(/1 of 2 gates/i)).toBeInTheDocument()
  })

  it('shows a loading message when gate data is empty', () => {
    render(<AccessibilityPanel gates={[]} />)
    expect(screen.getByText(/accessible gate data is loading/i)).toBeInTheDocument()
  })

  it('handles the case where no gates are accessible', () => {
    const noneAccessible: Gate[] = [{ ...mockGates[1], wheelchairAccessible: false }]
    render(<AccessibilityPanel gates={noneAccessible} />)
    expect(screen.getByText(/accessible gate data is loading/i)).toBeInTheDocument()
  })
})
