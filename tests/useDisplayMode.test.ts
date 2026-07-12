import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDisplayMode } from '../src/hooks/useDisplayMode'

describe('useDisplayMode', () => {
  it('starts in standard mode', () => {
    const { result } = renderHook(() => useDisplayMode())
    expect(result.current.mode).toBe('standard')
    expect(result.current.isHighVisibility).toBe(false)
  })

  it('switches to high-visibility mode when toggled', () => {
    const { result } = renderHook(() => useDisplayMode())

    act(() => {
      result.current.toggle()
    })

    expect(result.current.mode).toBe('high-visibility')
    expect(result.current.isHighVisibility).toBe(true)
  })

  it('switches back to standard mode when toggled twice', () => {
    const { result } = renderHook(() => useDisplayMode())

    act(() => {
      result.current.toggle()
    })
    act(() => {
      result.current.toggle()
    })

    expect(result.current.mode).toBe('standard')
    expect(result.current.isHighVisibility).toBe(false)
  })
})
