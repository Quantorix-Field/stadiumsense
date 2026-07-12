import type { SustainabilityTip, TransportOption } from '../types'

/**
 * Fixed transport registry mapping each mode to its nearest gate.
 * A real deployment would swap this for a live transit-authority feed;
 * the interface stays identical either way.
 */
const TRANSPORT_OPTIONS: TransportOption[] = [
  {
    id: 'metro-north',
    mode: 'metro',
    label: 'Metro Line 2 — North Station',
    etaMinutes: 4,
    nearestGateId: 'gate-a',
  },
  {
    id: 'shuttle-vip',
    mode: 'shuttle',
    label: 'Official Shuttle — VIP Drop-off',
    etaMinutes: 2,
    nearestGateId: 'gate-e',
  },
  {
    id: 'bus-south',
    mode: 'bus',
    label: 'City Bus Route 14 — South Terrace',
    etaMinutes: 6,
    nearestGateId: 'gate-c',
  },
  {
    id: 'walk-east',
    mode: 'walking',
    label: 'Pedestrian Bridge — East Concourse',
    etaMinutes: 8,
    nearestGateId: 'gate-b',
  },
]

const SUSTAINABILITY_TIPS: SustainabilityTip[] = [
  {
    id: 'public-transport',
    label: 'Take public transport',
    description: 'Metro and shuttle options reduce per-fan carbon footprint compared to driving.',
  },
  {
    id: 'reusable-bottle',
    label: 'Bring a reusable water bottle',
    description:
      'Refill stations are available near every gate — help cut down on single-use plastic.',
  },
  {
    id: 'digital-ticket',
    label: 'Use a digital ticket',
    description: 'Skip paper printouts entirely — your phone is all you need at any gate.',
  },
]

/**
 * Returns all transport options, sorted by ETA. In production this would
 * be fed by a live transit API; kept as static data here to stay testable
 * without a network dependency.
 */
export function getTransportOptions(): TransportOption[] {
  return [...TRANSPORT_OPTIONS].sort((a, b) => a.etaMinutes - b.etaMinutes)
}

/**
 * Returns the fixed set of sustainability tips shown alongside transport
 * options, encouraging lower-impact choices when heading to the venue.
 */
export function getSustainabilityTips(): SustainabilityTip[] {
  return SUSTAINABILITY_TIPS
}
