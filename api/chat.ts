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

interface TransportInfo {
  label: string
  etaMinutes: number
}

interface ChatRequestBody {
  message: string
  language: string
  history: ChatMessage[]
  gates?: GateInfo[]
  transportOptions?: TransportInfo[]
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
event questions. Answer immediately and directly with no preamble, hedging, or filler sentences.
Keep answers to 1-2 short sentences, practical and friendly, and always finish your sentence
completely. Do not use markdown formatting like asterisks or bold text — respond in plain text only.
When gate data is provided below, base your answer on those exact numbers rather than guessing.
If you don't have real-time data for something outside the provided gates, say so honestly in one
short sentence rather than inventing specifics.`
const MAX_MESSAGE_LENGTH = 1000
const MAX_HISTORY_MESSAGES = 10
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 10

const requestLog = new Map<string, number[]>()

/**
 * Simple in-memory sliding-window rate limiter keyed by client IP.
 * Resets on cold start, which is an acceptable tradeoff for a demo-scale
 * serverless function — it still blocks the obvious spam/abuse case.
 */
function isRateLimited(clientId: string): boolean {
  const now = Date.now()
  const timestamps = (requestLog.get(clientId) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  )

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestLog.set(clientId, timestamps)
    return true
  }

  timestamps.push(now)
  requestLog.set(clientId, timestamps)
  return false
}

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

  const clientId =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown'

  if (isRateLimited(clientId)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' })
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

  const transportContext =
    body.transportOptions && body.transportOptions.length > 0
      ? `\n\nTransport options to the venue:\n${body.transportOptions
          .map((t) => `- ${t.label}: ${t.etaMinutes} min`)
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
            parts: [
              {
                text: `${SYSTEM_PROMPT}\nRespond in ${languageName}.${gateContext}${transportContext}`,
              },
            ],
          },
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      return res.status(502).json({ error: 'Assistant service unavailable' })
    }

    const data = await geminiResponse.json()
    const rawReply: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
    const reply = rawReply
      ?.replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\*+/g, '')

    if (!reply) {
      return res.status(502).json({ error: 'Assistant returned an empty response' })
    }

    return res.status(200).json({ reply })
  } catch {
    return res.status(500).json({ error: 'Unexpected server error' })
  }
}
