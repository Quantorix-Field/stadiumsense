import type { Gate, QuickPhrase, SuggestedAction, VenueOverview } from '../types'

const CRITICAL_CROWD_THRESHOLD = 85
const WARNING_CROWD_THRESHOLD = 60

/**
 * Computes a venue-wide summary from live gate data — the single at-a-glance
 * health metric an organizer needs without scanning every gate individually.
 * Derived entirely from the same crowd simulation powering the fan-facing
 * gate finder, so it can never disagree with what fans are shown.
 */
export function getVenueOverview(gates: Gate[]): VenueOverview | null {
  if (gates.length === 0) return null

  const totalWait = gates.reduce((sum, g) => sum + g.estimatedWaitMinutes, 0)
  const totalCrowd = gates.reduce((sum, g) => sum + g.crowdScore, 0)

  const busiest = gates.reduce((max, g) => (g.crowdScore > max.crowdScore ? g : max))
  const quietest = gates.reduce((min, g) => (g.crowdScore < min.crowdScore ? g : min))

  return {
    averageWaitMinutes: Math.round(totalWait / gates.length),
    averageCrowdScore: Math.round(totalCrowd / gates.length),
    busiestGateId: busiest.id,
    quietestGateId: quietest.id,
  }
}

/**
 * Generates deterministic operational recommendations from live crowd
 * thresholds — genuine decision support, not a static list. A gate crossing
 * the critical threshold always produces the same class of suggestion,
 * making this behavior fully predictable and testable.
 */
export function getSuggestedActions(gates: Gate[]): SuggestedAction[] {
  return gates
    .filter((g) => g.crowdScore >= WARNING_CROWD_THRESHOLD)
    .map((g) => {
      const severity = g.crowdScore >= CRITICAL_CROWD_THRESHOLD ? 'critical' : 'warning'
      const message =
        severity === 'critical'
          ? `${g.name} is critically crowded — consider redirecting fans to a quieter gate.`
          : `${g.name} is approaching capacity — monitor closely.`
      return { id: `action-${g.id}`, severity, message, gateId: g.id }
    })
}

const QUICK_PHRASES: QuickPhrase[] = [
  {
    id: 'follow-me',
    english: 'Please follow me.',
    translations: {
      en: 'Please follow me.',
      es: 'Por favor, sígame.',
      pt: 'Por favor, siga-me.',
      fr: 'Veuillez me suivre.',
      ar: 'من فضلك اتبعني.',
      hi: 'कृपया मेरे साथ आएं।',
    },
  },
  {
    id: 'this-way-exit',
    english: 'This way to the exit.',
    translations: {
      en: 'This way to the exit.',
      es: 'Por aquí para la salida.',
      pt: 'Por aqui para a saída.',
      fr: "Par ici pour la sortie.",
      ar: 'من هنا للخروج.',
      hi: 'बाहर जाने का रास्ता इधर है।',
    },
  },
  {
    id: 'need-help',
    english: 'Do you need help?',
    translations: {
      en: 'Do you need help?',
      es: '¿Necesita ayuda?',
      pt: 'Precisa de ajuda?',
      fr: "Avez-vous besoin d'aide?",
      ar: 'هل تحتاج إلى مساعدة؟',
      hi: 'क्या आपको सहायता चाहिए?',
    },
  },
  {
    id: 'wait-here',
    english: 'Please wait here.',
    translations: {
      en: 'Please wait here.',
      es: 'Por favor, espere aquí.',
      pt: 'Por favor, espere aqui.',
      fr: 'Veuillez attendre ici.',
      ar: 'من فضلك انتظر هنا.',
      hi: 'कृपया यहां प्रतीक्षा करें।',
    },
  },
]

/**
 * Returns the fixed set of volunteer quick-reference phrases, pre-translated
 * into every supported language, so a volunteer can point a fan to the
 * right phrase without needing to speak their language.
 */
export function getQuickPhrases(): QuickPhrase[] {
  return QUICK_PHRASES
}
