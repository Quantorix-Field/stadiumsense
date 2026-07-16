/**
 * Central type definitions for StadiumSense.
 * Every module imports from here — no duplicate shape definitions anywhere else.
 */

export type SupportedLanguage = 'en' | 'es' | 'pt' | 'fr' | 'ar' | 'hi'

export type DisplayMode = 'standard' | 'high-visibility'

export type Persona = 'fan' | 'volunteer' | 'organizer' | 'venue-staff'

export interface VenueOverview {
  averageWaitMinutes: number
  averageCrowdScore: number
  busiestGateId: string
  quietestGateId: string
}

export interface SuggestedAction {
  id: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  gateId: string
}

export interface QuickPhrase {
  id: string
  english: string
  translations: Record<SupportedLanguage, string>
}
export interface LanguageOption {
  code: SupportedLanguage
  label: string
  nativeLabel: string
}

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: number
}

export interface OperationsContext {
  suggestedActions?: string[]
  averageWaitMinutes?: number
  averageCrowdLevel?: string
  facilities?: string[]
}

export interface ChatRequestPayload {
  message: string
  language: SupportedLanguage
  history: ChatMessage[]
  gates?: Gate[]
  transportOptions?: TransportOption[]
  persona?: Persona
  operations?: OperationsContext
}

export interface ChatResponsePayload {
  reply: string
}

export type CrowdLevel = 'low' | 'moderate' | 'high' | 'critical'

export interface Gate {
  id: string
  name: string
  crowdLevel: CrowdLevel
  crowdScore: number
  wheelchairAccessible: boolean
  distanceMeters: number
  estimatedWaitMinutes: number
}

export interface AccessibilityFeature {
  id: string
  label: string
  description: string
  gateIds: string[]
}

export type TransportMode = 'metro' | 'bus' | 'shuttle' | 'walking'

export interface TransportOption {
  id: string
  mode: TransportMode
  label: string
  etaMinutes: number
  nearestGateId: string
}

export interface SustainabilityTip {
  id: string
  label: string
  description: string
}

export type ConcourseSegment = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export type FacilityCategory =
  'sensory-room' | 'accessible-restroom' | 'medical-station' | 'accessible-seating'

export interface Facility {
  id: string
  name: string
  category: FacilityCategory
  segment: ConcourseSegment
}

export type AccessibilityNeed = 'wheelchair' | 'low-vision' | 'deaf-hoh'

export interface RouteStep {
  segment: ConcourseSegment
  instruction: string
  distanceMeters: number
  stepFree: boolean
}

export interface RouteResult {
  destinationName: string
  totalDistanceMeters: number
  estimatedWalkMinutes: number
  steps: RouteStep[]
  crowdLevel: CrowdLevel
  stepFree: boolean
  isUrgent: boolean
  urgencyMessage: string | null
}

export interface RouteQuery {
  fromGateId: string
  toFacilityId: string
  accessibilityNeeds: AccessibilityNeed[]
  minutesToKickoff?: number
}

export interface ApiErrorResponse {
  error: string
}
