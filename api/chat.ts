import type { VercelRequest, VercelResponse } from '@vercel/node'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface GateInfo {
  name: string
  crowdLevel: string
  distanceMeters: number
  estimatedWaitMinutes: number
  wheelchairAccessible: boolean
}

interface ChatRequestBody {
  message: string
  language: string
  history: ChatMessage[]
  gates?: GateInfo[]
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  ar: 'Arabic',
  hi: 'Hindi',
}

const SYSTEM_PROMPT = `You are StadiumSense, an on-site assistant for fans at FIFA World Cup 2026 stadiums.
You help with navigation, gate wait times, accessibility options, transportation, and general
event questions. Keep answers short (2-4 sentences), practical, and friendly. When gate data is
provided below, base your answer on those exact numbers rather than guessing. If you don't have
real-time data for something outside the provided gates, say so honestly rather than inventing specifics.`
const MAX_MESSAGE_LENGTH = 1000
const MAX_HISTORY_MESSAGES = 10

/**
 * Serverless proxy between the client and Gemini's API. The API key lives only
 * in this function's environment (set in Vercel's dashboard) and is never sent
 * to or readable by the browser, keeping the public repo credential-free.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  const body = req.body as ChatRequestBody

  if (!body?.message || typeof body.message !== 'string') {
    return res.status(400).json({ error: 'A message is required' })
  }

  if (body.message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: 'Message is too long' })
  }

  const languageName = LANGUAGE_NAMES[body.language] ?? 'English'
  const recentHistory = (body.history ?? []).slice(-MAX_HISTORY_MESSAGES)

  const gateContext =
    body.gates && body.gates.length > 0
      ? `\n\nCurrent gate conditions:\n${body.gates
          .map(
            (g) =>
              `- ${g.name}: ${g.crowdLevel} crowd, ${g.estimatedWaitMinutes} min wait, ${g.distanceMeters}m away, ${g.wheelchairAccessible ? 'wheelchair accessible' : 'not wheelchair accessible'}`
          )
          .join('\n')}`
      : ''

  const contents = [
    ...recentHistory.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: body.message }] },
  ]

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: `${SYSTEM_PROMPT}\nRespond in ${languageName}.${gateContext}` }],
          },
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      return res.status(502).json({ error: 'Assistant service unavailable' })
    }

    const data = await geminiResponse.json()
    const reply: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!reply) {
      return res.status(502).json({ error: 'Assistant returned an empty response' })
    }

    return res.status(200).json({ reply })
  } catch {
    return res.status(500).json({ error: 'Unexpected server error' })
  }
}
