import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RoutePlanner } from '../src/components/RoutePlanner'
import type { Gate } from '../src/types'

const mockGates: Gate[] = [
  {
    id: 'gate-c',
    name: 'Gate C — South Terrace',
    crowdLevel: 'low',
    crowdScore: 10,
    wheelchairAccessible: false,
    distanceMeters: 210,
    estimatedWaitMinutes: 2,
  },
  {
    id: 'gate-a',
    name: 'Gate A — North Plaza',
    crowdLevel: 'moderate',
    crowdScore: 40,
    wheelchairAccessible: true,
    distanceMeters: 120,
    estimatedWaitMinutes: 8,
  },
]

describe('RoutePlanner', () => {
  it('renders the plan your route heading', () => {
    render(<RoutePlanner gates={mockGates} />)
    expect(screen.getByText('Plan your route')).toBeInTheDocument()
  })

  it('renders gate options in the "from" dropdown', () => {
    render(<RoutePlanner gates={mockGates} />)
    expect(screen.getByText('Gate C — South Terrace')).toBeInTheDocument()
    expect(screen.getByText('Gate A — North Plaza')).toBeInTheDocument()
  })

  it('renders facility options in the "to" dropdown', () => {
    render(<RoutePlanner gates={mockGates} />)
    expect(screen.getByText('Sensory Room')).toBeInTheDocument()
  })

  it('renders all three accessibility need checkboxes', () => {
    render(<RoutePlanner gates={mockGates} />)
    expect(screen.getByLabelText(/wheelchair \/ step-free/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/low vision \/ screen reader/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/deaf \/ hard of hearing/i)).toBeInTheDocument()
  })

  it('shows a route result after submitting the form', () => {
    render(<RoutePlanner gates={mockGates} />)
    fireEvent.click(screen.getByRole('button', { name: /get directions/i }))
    expect(screen.getAllByText('Sensory Room').length).toBeGreaterThan(0)
  })

  it('toggles an accessibility need checkbox on click', () => {
    render(<RoutePlanner gates={mockGates} />)
    const checkbox = screen.getByLabelText(/wheelchair \/ step-free/i) as HTMLInputElement
    expect(checkbox.checked).toBe(false)
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
  })

  it('shows an error message when no gates are available', () => {
    render(<RoutePlanner gates={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /get directions/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
