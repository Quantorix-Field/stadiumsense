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

export interface ApiErrorResponse {
  error: string
}
