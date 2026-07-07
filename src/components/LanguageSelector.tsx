import type { LanguageOption, SupportedLanguage } from '../types'

interface LanguageSelectorProps {
  options: LanguageOption[]
  value: SupportedLanguage
  onChange: (code: SupportedLanguage) => void
}

/**
 * Lets a fan pick their preferred language for the assistant. A native <select>
 * is used deliberately over a custom dropdown — it's free keyboard navigation,
 * screen-reader support, and mobile-native picker UI with zero extra code.
 */
export function LanguageSelector({ options, value, onChange }: LanguageSelectorProps) {
  return (
    <div className="language-selector">
      <label htmlFor="language-select">Language</label>
      <select
        id="language-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SupportedLanguage)}
        aria-label="Select assistant language"
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  )
}
