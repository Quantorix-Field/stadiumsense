import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { sendChatMessage } from '../src/utils/api'

describe('sendChatMessage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the reply on a successful first attempt', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'Gate A is best.' }),
    })

    const reply = await sendChatMessage('test', 'en', [])
    expect(reply).toBe('Gate A is best.')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('retries once after a failure and succeeds on the second attempt', async () => {
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: false, status: 504 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reply: 'Gate B is best.' }),
      })

    const reply = await sendChatMessage('test', 'en', [])
    expect(reply).toBe('Gate B is best.')
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('throws an error if both attempts fail', async () => {
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: false, status: 500 })

    await expect(sendChatMessage('test', 'en', [])).rejects.toThrow(
      'The assistant is temporarily unavailable'
    )
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('does not retry when rate-limited', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 429 })

    await expect(sendChatMessage('test', 'en', [])).rejects.toThrow('Too many requests')
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
