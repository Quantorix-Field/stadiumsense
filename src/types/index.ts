/**
 * Central type definitions for StadiumSense.
 * Every module imports from here — no duplicate shape definitions anywhere else.
 */

export type SupportedLanguage = 'en' | 'es' | 'pt' | 'fr' | 'ar' | 'hi'

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

export interface ChatRequestPayload {
  message: string
  language: SupportedLanguage
  history: ChatMessage[]
  gates?: Gate[]
  transportOptions?: TransportOption[]
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

export interface ApiErrorResponse {
  error: string
}
