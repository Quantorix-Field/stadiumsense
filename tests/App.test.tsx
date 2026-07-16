import { describe, expect, it } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { App } from '../src/App'

describe('App', () => {
  it('renders the app title and tagline', () => {
    render(<App />)
    expect(screen.getByText('StadiumSense')).toBeInTheDocument()
    expect(screen.getByText(/your ai guide for fifa world cup 2026 stadiums/i)).toBeInTheDocument()
  })

  it('shows the persona selector by default', () => {
    render(<App />)
    expect(screen.getByText('I am a...')).toBeInTheDocument()
  })

  it('renders the chat assistant section after choosing the Fan persona', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('Fan'))
    expect(await screen.findByLabelText(/stadiumsense assistant/i)).toBeInTheDocument()
  })

  it('renders gate recommendations once the Fan persona is chosen', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('Fan'))
    await waitFor(() => {
      expect(screen.getByText('Recommended gates')).toBeInTheDocument()
    })
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
  })

  it('renders the accessibility panel once the Fan persona is chosen', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('Fan'))
    await waitFor(() => {
      expect(screen.getByText('Accessibility at this venue')).toBeInTheDocument()
    })
  })

  it('renders the footer with challenge attribution', () => {
    render(<App />)
    expect(screen.getByText(/built for promptwars virtual/i)).toBeInTheDocument()
  })

  it('renders the high-visibility mode toggle', () => {
    render(<App />)
    expect(
      screen.getByRole('button', { name: /high-visibility \/ screen-reader mode/i })
    ).toBeInTheDocument()
  })

  it('toggles high-visibility mode on click', () => {
    render(<App />)
    const toggleButton = screen.getByRole('button', {
      name: /high-visibility \/ screen-reader mode/i,
    })

    expect(toggleButton).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(toggleButton)

    expect(toggleButton).toHaveAttribute('aria-pressed', 'true')
  })
})
