import { describe, expect, it } from 'vitest'
import { getVenueOverview, getSuggestedActions, getQuickPhrases } from '../src/utils/operationsData'
import type { Gate } from '../src/types'

const mockGates: Gate[] = [
  {
    id: 'gate-a',
    name: 'Gate A — North Plaza',
    crowdLevel: 'critical',
    crowdScore: 90,
    wheelchairAccessible: true,
    distanceMeters: 120,
    estimatedWaitMinutes: 30,
  },
  {
    id: 'gate-b',
    name: 'Gate B — East Concourse',
    crowdLevel: 'low',
    crowdScore: 10,
    wheelchairAccessible: false,
    distanceMeters: 340,
    estimatedWaitMinutes: 1,
  },
  {
    id: 'gate-c',
    name: 'Gate C — South Terrace',
    crowdLevel: 'moderate',
    crowdScore: 65,
    wheelchairAccessible: true,
    distanceMeters: 210,
    estimatedWaitMinutes: 12,
  },
]

describe('getVenueOverview', () => {
  it('returns null for an empty gate list', () => {
    expect(getVenueOverview([])).toBeNull()
  })

  it('correctly identifies the busiest gate', () => {
    const overview = getVenueOverview(mockGates)
    expect(overview?.busiestGateId).toBe('gate-a')
  })

  it('correctly identifies the quietest gate', () => {
    const overview = getVenueOverview(mockGates)
    expect(overview?.quietestGateId).toBe('gate-b')
  })

  it('calculates the correct average wait time', () => {
    const overview = getVenueOverview(mockGates)
    expect(overview?.averageWaitMinutes).toBe(Math.round((30 + 1 + 12) / 3))
  })

  it('calculates the correct average crowd score', () => {
    const overview = getVenueOverview(mockGates)
    expect(overview?.averageCrowdScore).toBe(Math.round((90 + 10 + 65) / 3))
  })
})

describe('getSuggestedActions', () => {
  it('flags the critical gate with critical severity', () => {
    const actions = getSuggestedActions(mockGates)
    const critical = actions.find((a) => a.gateId === 'gate-a')
    expect(critical?.severity).toBe('critical')
  })

  it('flags the moderate-crowd gate with warning severity', () => {
    const actions = getSuggestedActions(mockGates)
    const warning = actions.find((a) => a.gateId === 'gate-c')
    expect(warning?.severity).toBe('warning')
  })

  it('does not flag the low-crowd gate at all', () => {
    const actions = getSuggestedActions(mockGates)
    const flagged = actions.find((a) => a.gateId === 'gate-b')
    expect(flagged).toBeUndefined()
  })

  it('returns no actions when all gates are quiet', () => {
    const quietGates = mockGates.map((g) => ({ ...g, crowdScore: 5 }))
    expect(getSuggestedActions(quietGates)).toHaveLength(0)
  })
})

describe('getQuickPhrases', () => {
  it('returns four quick phrases', () => {
    expect(getQuickPhrases()).toHaveLength(4)
  })

  it('includes all six language translations for every phrase', () => {
    const phrases = getQuickPhrases()
    const languages = ['en', 'es', 'pt', 'fr', 'ar', 'hi']
    for (const phrase of phrases) {
      for (const lang of languages) {
        expect(phrase.translations[lang as keyof typeof phrase.translations]).toBeTruthy()
      }
    }
  })
})
