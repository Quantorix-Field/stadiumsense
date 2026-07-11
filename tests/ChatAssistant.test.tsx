import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatAssistant } from '../src/components/ChatAssistant'
import * as api from '../src/utils/api'

describe('ChatAssistant', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the empty state with no messages', () => {
    render(<ChatAssistant gates={[]} transportOptions={[]} />)
    expect(
      screen.getByText(/ask about gates, wait times, transport, or accessibility/i)
    ).toBeInTheDocument()
  })

  it('sends a message and displays the assistant reply', async () => {
    vi.spyOn(api, 'sendChatMessage').mockResolvedValue('Gate A has the shortest wait right now.')

    render(<ChatAssistant gates={[]} transportOptions={[]} />)
    const input = screen.getByPlaceholderText(/which gate has the shortest wait/i)
    const button = screen.getByRole('button', { name: /send/i })

    fireEvent.change(input, { target: { value: 'Which gate is fastest?' } })
    fireEvent.click(button)

    expect(await screen.findByText('Which gate is fastest?')).toBeInTheDocument()
    expect(
      await screen.findByText('Gate A has the shortest wait right now.')
    ).toBeInTheDocument()
  })

  it('clears the input field after sending', async () => {
    vi.spyOn(api, 'sendChatMessage').mockResolvedValue('Sure thing.')

    render(<ChatAssistant gates={[]} transportOptions={[]} />)

    const input = screen.getByPlaceholderText(/which gate has the shortest wait/i) as HTMLInputElement
    const button = screen.getByRole('button', { name: /send/i })

    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(input.value).toBe('')
    })
  })

  it('shows an error message when the request fails', async () => {
    vi.spyOn(api, 'sendChatMessage').mockRejectedValue(
      new Error('The assistant is temporarily unavailable. Please try again shortly.')
    )

    render(<ChatAssistant gates={[]} transportOptions={[]} />)
    const input = screen.getByPlaceholderText(/which gate has the shortest wait/i)
    const button = screen.getByRole('button', { name: /send/i })

    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(button)

    expect(
      await screen.findByText(/temporarily unavailable/i)
    ).toBeInTheDocument()
  })

  it('disables the send button while a message is in flight', async () => {
    let resolvePromise: (value: string) => void = () => {}
    vi.spyOn(api, 'sendChatMessage').mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    render(<ChatAssistant gates={[]} transportOptions={[]} />)
    const input = screen.getByPlaceholderText(/which gate has the shortest wait/i)
    const button = screen.getByRole('button', { name: /send/i }) as HTMLButtonElement

    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(button.disabled).toBe(true)
    })

    resolvePromise('Done')
  })
})
