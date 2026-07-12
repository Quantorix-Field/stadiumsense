import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import 'vitest-axe/extend-expect'
import { GateFinder } from '../src/components/GateFinder'
import { AccessibilityPanel } from '../src/components/AccessibilityPanel'
import { TransportPanel } from '../src/components/TransportPanel'
import { RoutePlanner } from '../src/components/RoutePlanner'
import { LanguageSelector } from '../src/components/LanguageSelector'
import { CrowdMeter } from '../src/components/CrowdMeter'
import { LANGUAGE_OPTIONS } from '../src/hooks/useLanguage'
import type { Gate } from '../src/types'

const mockGates: Gate[] = [
  {
    id: 'gate-a',
    name: 'Gate A — North Plaza',
    crowdLevel: 'moderate',
    crowdScore: 40,
    wheelchairAccessible: true,
    distanceMeters: 120,
    estimatedWaitMinutes: 8,
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
]

/**
 * Automated WCAG conformance checks using axe-core. These catch real,
 * programmatically-detectable accessibility violations — missing labels,
 * invalid ARIA usage, insufficient color contrast — that manual review
 * can miss, complementing (not replacing) the semantic HTML and ARIA
 * attributes already built into each component.
 */
describe('Accessibility (axe-core)', () => {
  it('GateFinder has no detectable accessibility violations', async () => {
    const { container } = render(<GateFinder gates={mockGates} isLoading={false} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('AccessibilityPanel has no detectable accessibility violations', async () => {
    const { container } = render(<AccessibilityPanel gates={mockGates} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('TransportPanel has no detectable accessibility violations', async () => {
    const { container } = render(<TransportPanel />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('RoutePlanner has no detectable accessibility violations', async () => {
    const { container } = render(<RoutePlanner gates={mockGates} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('LanguageSelector has no detectable accessibility violations', async () => {
    const { container } = render(
      <LanguageSelector options={LANGUAGE_OPTIONS} value="en" onChange={() => {}} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('CrowdMeter has no detectable accessibility violations', async () => {
    const { container } = render(<CrowdMeter level="moderate" score={40} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
