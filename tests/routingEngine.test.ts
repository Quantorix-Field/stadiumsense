import { describe, expect, it } from 'vitest'
import {
  resolveRoute,
  getFacilities,
  getAccessibilityNeedOptions,
} from '../src/utils/routingEngine'

describe('getFacilities', () => {
  it('returns all four registered facilities', () => {
    expect(getFacilities()).toHaveLength(4)
  })

  it('includes the sensory room facility', () => {
    const facilities = getFacilities()
    expect(facilities.some((f) => f.id === 'sensory-room')).toBe(true)
  })
})

describe('getAccessibilityNeedOptions', () => {
  it('returns three accessibility need options', () => {
    expect(getAccessibilityNeedOptions()).toHaveLength(3)
  })

  it('includes wheelchair as a valid option', () => {
    const options = getAccessibilityNeedOptions()
    expect(options.some((o) => o.value === 'wheelchair')).toBe(true)
  })
})

describe('resolveRoute', () => {
  it('returns null for an unknown facility', () => {
    const result = resolveRoute({
      fromGateId: 'gate-a',
      toFacilityId: 'not-a-real-facility',
      accessibilityNeeds: [],
    })
    expect(result).toBeNull()
  })

  it('returns null for an unknown gate', () => {
    const result = resolveRoute({
      fromGateId: 'not-a-real-gate',
      toFacilityId: 'sensory-room',
      accessibilityNeeds: [],
    })
    expect(result).toBeNull()
  })

  it('resolves a valid route to the sensory room', () => {
    const result = resolveRoute({
      fromGateId: 'gate-c',
      toFacilityId: 'sensory-room',
      accessibilityNeeds: [],
    })
    expect(result).not.toBeNull()
    expect(result?.destinationName).toBe('Sensory Room')
  })

  it('produces at least one direction step', () => {
    const result = resolveRoute({
      fromGateId: 'gate-c',
      toFacilityId: 'sensory-room',
      accessibilityNeeds: [],
    })
    expect(result?.steps.length).toBeGreaterThan(0)
  })

  it('calculates total distance as the sum of all step distances', () => {
    const result = resolveRoute({
      fromGateId: 'gate-c',
      toFacilityId: 'sensory-room',
      accessibilityNeeds: [],
    })
    const expectedTotal = result?.steps.reduce((sum, s) => sum + s.distanceMeters, 0)
    expect(result?.totalDistanceMeters).toBe(expectedTotal)
  })

  it('mentions the destination facility in the final step instruction', () => {
    const result = resolveRoute({
      fromGateId: 'gate-c',
      toFacilityId: 'sensory-room',
      accessibilityNeeds: [],
    })
    const lastStep = result?.steps[result.steps.length - 1]
    expect(lastStep?.instruction).toContain('Sensory Room')
  })

  it('returns a valid crowd level for the resolved route', () => {
    const result = resolveRoute({
      fromGateId: 'gate-a',
      toFacilityId: 'medical-1',
      accessibilityNeeds: [],
    })
    expect(['low', 'moderate', 'high', 'critical']).toContain(result?.crowdLevel)
  })

  it('is deterministic — same query returns the same route', () => {
    const query = {
      fromGateId: 'gate-b',
      toFacilityId: 'restroom-accessible',
      accessibilityNeeds: [] as const,
    }
    const first = resolveRoute({ ...query, accessibilityNeeds: [] })
    const second = resolveRoute({ ...query, accessibilityNeeds: [] })
    expect(first).toEqual(second)
  })

  it('resolves routes for every gate-to-facility combination without throwing', () => {
    const gateIds = ['gate-a', 'gate-b', 'gate-c', 'gate-d', 'gate-e']
    const facilityIds = getFacilities().map((f) => f.id)

    for (const gateId of gateIds) {
      for (const facilityId of facilityIds) {
        expect(() =>
          resolveRoute({ fromGateId: gateId, toFacilityId: facilityId, accessibilityNeeds: [] })
        ).not.toThrow()
      }
    }
  })
})
