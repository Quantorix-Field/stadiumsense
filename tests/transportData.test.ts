import { describe, expect, it } from 'vitest'
import { getTransportOptions, getSustainabilityTips } from '../src/utils/transportData'

describe('getTransportOptions', () => {
  it('returns all four transport options', () => {
    const options = getTransportOptions()
    expect(options).toHaveLength(4)
  })

  it('sorts options by ETA ascending', () => {
    const options = getTransportOptions()
    for (let i = 1; i < options.length; i++) {
      expect(options[i].etaMinutes).toBeGreaterThanOrEqual(options[i - 1].etaMinutes)
    }
  })

  it('does not mutate the underlying data between calls', () => {
    const first = getTransportOptions()
    const second = getTransportOptions()
    expect(first).toEqual(second)
    expect(first).not.toBe(second)
  })

  it('includes a valid mode for every option', () => {
    const validModes = ['metro', 'bus', 'shuttle', 'walking']
    const options = getTransportOptions()
    for (const option of options) {
      expect(validModes).toContain(option.mode)
    }
  })
})

describe('getSustainabilityTips', () => {
  it('returns three sustainability tips', () => {
    const tips = getSustainabilityTips()
    expect(tips).toHaveLength(3)
  })

  it('gives every tip a non-empty label and description', () => {
    const tips = getSustainabilityTips()
    for (const tip of tips) {
      expect(tip.label.length).toBeGreaterThan(0)
      expect(tip.description.length).toBeGreaterThan(0)
    }
  })
})
