import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCrowdData } from '../src/hooks/useCrowdData'

describe('useCrowdData', () => {
  it('starts in a loading state with no gates', () => {
    const { result } = renderHook(() => useCrowdData())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.gates).toEqual([])
  })

  it('loads gate data and clears the loading state', async () => {
    const { result } = renderHook(() => useCrowdData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.gates.length).toBeGreaterThan(0)
    expect(result.current.lastUpdated).not.toBeNull()
  })

  it('returns gates with valid crowd data shapes', async () => {
    const { result } = renderHook(() => useCrowdData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    for (const gate of result.current.gates) {
      expect(gate).toHaveProperty('id')
      expect(gate).toHaveProperty('crowdLevel')
      expect(gate.crowdScore).toBeGreaterThanOrEqual(0)
    }
  })
})
