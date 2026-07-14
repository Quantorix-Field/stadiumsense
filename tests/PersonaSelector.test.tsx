import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PersonaSelector } from '../src/components/PersonaSelector'

describe('PersonaSelector', () => {
  it('renders all four persona options', () => {
    render(<PersonaSelector onSelect={() => {}} />)
    expect(screen.getByText('Fan')).toBeInTheDocument()
    expect(screen.getByText('Volunteer')).toBeInTheDocument()
    expect(screen.getByText('Organizer')).toBeInTheDocument()
    expect(screen.getByText('Venue Staff')).toBeInTheDocument()
  })

  it('calls onSelect with "fan" when the Fan option is clicked', () => {
    const onSelect = vi.fn()
    render(<PersonaSelector onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Fan'))
    expect(onSelect).toHaveBeenCalledWith('fan')
  })

  it('calls onSelect with "venue-staff" when the Venue Staff option is clicked', () => {
    const onSelect = vi.fn()
    render(<PersonaSelector onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Venue Staff'))
    expect(onSelect).toHaveBeenCalledWith('venue-staff')
  })
})
