import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TransportPanel } from '../src/components/TransportPanel'

describe('TransportPanel', () => {
  it('renders the getting there heading', () => {
    render(<TransportPanel />)
    expect(screen.getByText('Getting there')).toBeInTheDocument()
  })

  it('renders all transport options', () => {
    render(<TransportPanel />)
    expect(screen.getByText(/Metro Line 2/i)).toBeInTheDocument()
    expect(screen.getByText(/Official Shuttle/i)).toBeInTheDocument()
    expect(screen.getByText(/City Bus Route 14/i)).toBeInTheDocument()
    expect(screen.getByText(/Pedestrian Bridge/i)).toBeInTheDocument()
  })

  it('renders the sustainability tips section', () => {
    render(<TransportPanel />)
    expect(screen.getByText('Travel sustainably')).toBeInTheDocument()
    expect(screen.getByText('Take public transport')).toBeInTheDocument()
    expect(screen.getByText('Bring a reusable water bottle')).toBeInTheDocument()
    expect(screen.getByText('Use a digital ticket')).toBeInTheDocument()
  })

  it('renders transport options sorted by ETA', () => {
    render(<TransportPanel />)
    const etas = screen.getAllByText(/min$/).map((el) => parseInt(el.textContent ?? '0', 10))
    for (let i = 1; i < etas.length; i++) {
      expect(etas[i]).toBeGreaterThanOrEqual(etas[i - 1])
    }
  })
})
