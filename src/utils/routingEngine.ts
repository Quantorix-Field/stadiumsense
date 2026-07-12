import type {
  AccessibilityNeed,
  ConcourseSegment,
  Facility,
  Gate,
  RouteQuery,
  RouteResult,
  RouteStep,
} from '../types'
import { getCurrentGates, scoreToCrowdLevel } from './crowdSimulator'

/**
 * Fixed facility registry for a standard stadium concourse layout.
 * A real deployment would swap this for a venue's facility database;
 * the interface stays identical either way.
 */
const FACILITIES: Facility[] = [
  { id: 'sensory-room', name: 'Sensory Room', category: 'sensory-room', segment: 'NW' },
  {
    id: 'restroom-accessible',
    name: 'Accessible Restroom',
    category: 'accessible-restroom',
    segment: 'SE',
  },
  { id: 'medical-1', name: 'Medical Station', category: 'medical-station', segment: 'N' },
  {
    id: 'seating-accessible',
    name: 'Accessible Seating — Section 130',
    category: 'accessible-seating',
    segment: 'NW',
  },
]

/**
 * Adjacency map of the concourse ring. Each segment connects to its two
 * neighbors, forming a walkable loop around the stadium — mirrors how
 * real stadium concourses are laid out as a ring, not a grid.
 */
const CONCOURSE_RING: ConcourseSegment[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

const SEGMENT_LABELS: Record<ConcourseSegment, string> = {
  N: 'Upper Concourse (North)',
  NE: 'Upper Concourse (North-East)',
  E: 'Upper Concourse (East)',
  SE: 'Lower Concourse (South-East)',
  S: 'Lower Concourse (South)',
  SW: 'Lower Concourse (South-West)',
  W: 'Lower Concourse (West)',
  NW: 'Lower Concourse (North-West)',
}

const SEGMENT_DISTANCE_METERS = 55
const WALKING_METERS_PER_MINUTE = 70
const URGENCY_BUFFER_MINUTES = 3

/**
 * Maps a gate to its nearest concourse segment, so a route can start
 * from wherever the fan currently is.
 */
function gateToSegment(gate: Gate): ConcourseSegment {
  const mapping: Record<string, ConcourseSegment> = {
    'gate-a': 'N',
    'gate-b': 'E',
    'gate-c': 'S',
    'gate-d': 'W',
    'gate-e': 'NW',
  }
  return mapping[gate.id] ?? 'N'
}

/**
 * Returns the shortest walkable path between two ring segments, trying
 * both directions around the loop and picking whichever is shorter.
 */
function shortestPath(from: ConcourseSegment, to: ConcourseSegment): ConcourseSegment[] {
  const fromIndex = CONCOURSE_RING.indexOf(from)
  const toIndex = CONCOURSE_RING.indexOf(to)
  const ringLength = CONCOURSE_RING.length

  const forward: ConcourseSegment[] = []
  for (let i = fromIndex; i !== toIndex; i = (i + 1) % ringLength) {
    forward.push(CONCOURSE_RING[(i + 1) % ringLength])
  }

  const backward: ConcourseSegment[] = []
  for (let i = fromIndex; i !== toIndex; i = (i - 1 + ringLength) % ringLength) {
    backward.push(CONCOURSE_RING[(i - 1 + ringLength) % ringLength])
  }

  return forward.length <= backward.length ? forward : backward
}

/**
 * Weights each candidate path by live crowd data from the same simulator
 * that powers gate rankings — segments near heavily-crowded gates are
 * penalized, so the engine can genuinely reroute around bottlenecks
 * rather than always returning the geometrically shortest path.
 */
function pathCrowdPenalty(path: ConcourseSegment[]): number {
  const gates = getCurrentGates()
  return path.reduce((penalty, segment) => {
    const nearbyGate = gates.find((g) => gateToSegment(g) === segment)
    return penalty + (nearbyGate?.crowdScore ?? 0)
  }, 0)
}

/**
 * Resolves a route query into a concrete, deterministic set of directions.
 * This is the "facts engine" — it never touches an LLM. Gemini's only job
 * downstream is to phrase these already-computed facts in the fan's
 * language; it cannot invent a facility or a distance that isn't here.
 */
/**
 * Determines whether a route is at risk of not being completed before
 * kickoff, and if so, produces a plain-language warning. This is the
 * urgency layer of "logical decision making based on user context" —
 * the same route can be flagged differently depending on how much time
 * the fan actually has, computed here rather than guessed by an LLM.
 */
function assessUrgency(
  estimatedWalkMinutes: number,
  minutesToKickoff: number | undefined
): { isUrgent: boolean; urgencyMessage: string | null } {
  if (minutesToKickoff === undefined) {
    return { isUrgent: false, urgencyMessage: null }
  }

  const remainingBuffer = minutesToKickoff - estimatedWalkMinutes

  if (remainingBuffer < 0) {
    return {
      isUrgent: true,
      urgencyMessage: `This route takes about ${estimatedWalkMinutes} min, longer than the ${minutesToKickoff} min you have before kickoff — consider the nearest gate instead.`,
    }
  }

  if (remainingBuffer < URGENCY_BUFFER_MINUTES) {
    return {
      isUrgent: true,
      urgencyMessage: `Tight on time — this route takes about ${estimatedWalkMinutes} min, leaving only ${remainingBuffer} min of buffer before kickoff.`,
    }
  }

  return { isUrgent: false, urgencyMessage: null }
}

export function resolveRoute(query: RouteQuery): RouteResult | null {
  const facility = FACILITIES.find((f) => f.id === query.toFacilityId)
  if (!facility) return null

  const gates = getCurrentGates()
  const fromGate = gates.find((g) => g.id === query.fromGateId)
  if (!fromGate) return null

  const fromSegment = gateToSegment(fromGate)
  const forwardPath = shortestPath(fromSegment, facility.segment)
  const reversedFrom = shortestPath(facility.segment, fromSegment).reverse()

  const chosenPath =
    pathCrowdPenalty(forwardPath) <= pathCrowdPenalty(reversedFrom) ? forwardPath : reversedFrom

  const requiresStepFree = query.accessibilityNeeds.includes('wheelchair')
  const gatesBySegment = new Map(gates.map((g) => [gateToSegment(g), g]))

  const steps: RouteStep[] = chosenPath.map((segment, index) => {
    const isLast = index === chosenPath.length - 1
    const nearbyGate = gatesBySegment.get(segment)
    const stepFree = !nearbyGate || nearbyGate.wheelchairAccessible || !requiresStepFree

    return {
      segment,
      distanceMeters: SEGMENT_DISTANCE_METERS,
      stepFree,
      instruction: isLast
        ? `Walk to ${SEGMENT_LABELS[segment]}, where you'll find the ${facility.name}.`
        : `Walk to ${SEGMENT_LABELS[segment]}.`,
    }
  })

  const totalDistanceMeters = steps.reduce((sum, s) => sum + s.distanceMeters, 0)
  const allStepFree = steps.every((s) => s.stepFree)
  const estimatedWalkMinutes = Math.max(1, Math.round(totalDistanceMeters / WALKING_METERS_PER_MINUTE))

  const worstCrowdScore = Math.max(
    0,
    ...chosenPath.map((segment) => gatesBySegment.get(segment)?.crowdScore ?? 0)
  )

  const { isUrgent, urgencyMessage } = assessUrgency(estimatedWalkMinutes, query.minutesToKickoff)

  return {
    destinationName: facility.name,
    totalDistanceMeters,
    estimatedWalkMinutes,
    steps,
    crowdLevel: scoreToCrowdLevel(worstCrowdScore),
    stepFree: allStepFree,
    isUrgent,
    urgencyMessage,
  }
}

/**
 * Returns the fixed facility registry, used to populate the destination
 * dropdown in the route-planning form.
 */
export function getFacilities(): Facility[] {
  return FACILITIES
}

/**
 * Exposes accepted accessibility need values for validation and UI.
 */
export function getAccessibilityNeedOptions(): { value: AccessibilityNeed; label: string }[] {
  return [
    { value: 'wheelchair', label: 'Wheelchair / step-free' },
    { value: 'low-vision', label: 'Low vision / screen reader' },
    { value: 'deaf-hoh', label: 'Deaf / hard of hearing' },
  ]
}
