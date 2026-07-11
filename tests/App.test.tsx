import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { App } from '../src/App'

describe('App', () => {
  it('renders the app title and tagline', () => {
    render(<App />)
    expect(screen.getByText('StadiumSense')).toBeInTheDocument()
    expect(screen.getByText(/your ai guide for fifa world cup 2026 stadiums/i)).toBeInTheDocument()
  })

  it('renders the chat assistant section', async () => {
    render(<App />)
    expect(
      await screen.findByLabelText(/stadiumsense assistant/i)
    ).toBeInTheDocument()
  })

  it('renders gate recommendations once crowd data loads', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Recommended gates')).toBeInTheDocument()
    })
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
  })

  it('renders the accessibility panel', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Accessibility at this venue')).toBeInTheDocument()
    })
  })

  it('renders the footer with challenge attribution', () => {
    render(<App />)
    expect(
      screen.getByText(/built for promptwars virtual/i)
    ).toBeInTheDocument()
  })
})
