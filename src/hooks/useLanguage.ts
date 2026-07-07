import { useState } from 'react'
import type { LanguageOption, SupportedLanguage } from '../types'

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
]

const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

interface UseLanguageResult {
  language: SupportedLanguage
  setLanguage: (code: SupportedLanguage) => void
  options: LanguageOption[]
}

/**
 * Tracks the fan's selected language for both the UI copy and the
 * instructions sent to the assistant. Kept as a hook (rather than global
 * state) since only ChatAssistant and LanguageSelector need it right now —
 * easy to lift to context later if more components need it.
 */
export function useLanguage(): UseLanguageResult {
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)

  return { language, setLanguage, options: LANGUAGE_OPTIONS }
}
