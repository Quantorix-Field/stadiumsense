import { describe, expect, it } from 'vitest'
import {
  scoreToCrowdLevel,
  estimateWaitMinutes,
  getCurrentGates,
  getRecommendedGates,
} from '../src/utils/crowdSimulator'
import type { Gate } from '../src/types'

describe('scoreToCrowdLevel', () => {
  it('classifies low scores correctly', () => {
    expect(scoreToCrowdLevel(0)).toBe('low')
    expect(scoreToCrowdLevel(29)).toBe('low')
  })

  it('classifies moderate scores correctly', () => {
    expect(scoreToCrowdLevel(30)).toBe('moderate')
    expect(scoreToCrowdLevel(59)).toBe('moderate')
  })

  it('classifies high scores correctly', () => {
    expect(scoreToCrowdLevel(60)).toBe('high')
    expect(scoreToCrowdLevel(84)).toBe('high')
  })

  it('classifies critical scores correctly', () => {
    expect(scoreToCrowdLevel(85)).toBe('critical')
    expect(scoreToCrowdLevel(100)).toBe('critical')
  })
})

describe('estimateWaitMinutes', () => {
  it('returns short waits for low crowd scores', () => {
    expect(estimateWaitMinutes(10)).toBe(1)
    expect(estimateWaitMinutes(0)).toBe(0)
  })

  it('returns moderate waits for mid-range scores', () => {
    const wait = estimateWaitMinutes(50)
    expect(wait).toBeGreaterThan(3)
    expect(wait).toBeLessThan(13)
  })

  it('escalates sharply for high scores', () => {
    const waitAt70 = estimateWaitMinutes(70)
    const waitAt95 = estimateWaitMinutes(95)
    expect(waitAt95).toBeGreaterThan(waitAt70)
    expect(waitAt95 - waitAt70).toBeGreaterThan(20)
  })
})

describe('getCurrentGates', () => {
  it('returns all five registered gates', () => {
    const gates = getCurrentGates()
    expect(gates).toHaveLength(5)
  })

  it('returns internally consistent crowd data for every gate', () => {
    const gates = getCurrentGates()
    for (const gate of gates) {
      expect(gate.crowdScore).toBeGreaterThanOrEqual(0)
      expect(gate.crowdScore).toBeLessThan(100)
      expect(gate.crowdLevel).toBe(scoreToCrowdLevel(gate.crowdScore))
      expect(gate.estimatedWaitMinutes).toBe(estimateWaitMinutes(gate.crowdScore))
    }
  })

  it('is deterministic within the same time window', () => {
    const first = getCurrentGates()
    const second = getCurrentGates()
    expect(first).toEqual(second)
  })
})

describe('getRecommendedGates', () => {
  const mockGates: Gate[] = [
    {
      id: 'g1',
      name: 'Gate 1',
      crowdLevel: 'high',
      crowdScore: 70,
      wheelchairAccessible: false,
      distanceMeters: 50,
      estimatedWaitMinutes: 20,
    },
    {
      id: 'g2',
      name: 'Gate 2',
      crowdLevel: 'low',
      crowdScore: 10,
      wheelchairAccessible: true,
      distanceMeters: 500,
      estimatedWaitMinutes: 1,
    },
    {
      id: 'g3',
      name: 'Gate 3',
      crowdLevel: 'moderate',
      crowdScore: 40,
      wheelchairAccessible: true,
      distanceMeters: 100,
      estimatedWaitMinutes: 6,
    },
  ]

  it('ranks less crowded, closer gates first', () => {
    const ranked = getRecommendedGates(mockGates)
    expect(ranked[0].id).toBe('g2')
  })

  it('filters to only wheelchair-accessible gates when requested', () => {
    const ranked = getRecommendedGates(mockGates, true)
    expect(ranked).toHaveLength(2)
    expect(ranked.every((g) => g.wheelchairAccessible)).toBe(true)
  })

  it('does not mutate the original array', () => {
    const original = [...mockGates]
    getRecommendedGates(mockGates)
    expect(mockGates).toEqual(original)
  })
})
