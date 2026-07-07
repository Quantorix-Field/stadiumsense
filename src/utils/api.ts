import type { ChatMessage, ChatRequestPayload, ChatResponsePayload, SupportedLanguage } from '../types'

const CHAT_ENDPOINT = '/api/chat'

/**
 * Sends a chat message through our serverless proxy rather than calling
 * Gemini directly from the browser. This keeps the API key server-side only
 * and lets us control rate limiting, prompt shaping, and error handling
 * in one place.
 *
 * @throws Error with a user-facing message if the request fails
 */
export async function sendChatMessage(
  message: string,
  language: SupportedLanguage,
  history: ChatMessage[]
): Promise<string> {
  const payload: ChatRequestPayload = { message, language, history }

  let response: Response
  try {
    response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('Unable to reach the assistant. Check your connection and try again.')
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Too many requests right now — please wait a moment and try again.')
    }
    throw new Error('The assistant is temporarily unavailable. Please try again shortly.')
  }

  const data: ChatResponsePayload = await response.json()
  return data.reply
}
