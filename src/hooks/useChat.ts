import { useCallback, useState } from 'react'
import type { ChatMessage, Gate, SupportedLanguage } from '../types'
import { sendChatMessage } from '../utils/api'

interface UseChatResult {
  messages: ChatMessage[]
  isSending: boolean
  error: string | null
  sendMessage: (text: string) => Promise<void>
}
function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    timestamp: Date.now(),
  }
}

/**
 * Owns the chat conversation state: message history, in-flight status, and
 * error surfacing. Talks to the backend proxy via sendChatMessage rather than
 * any AI SDK directly, so the UI never knows or cares which model is behind it.
 */
export function useChat(language: SupportedLanguage, gates: Gate[] = []): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isSending) return

      const userMessage = createMessage('user', trimmed)
      setMessages((prev) => [...prev, userMessage])
      setIsSending(true)
      setError(null)

      try {
        const reply = await sendChatMessage(trimmed, language, messages, gates)
        setMessages((prev) => [...prev, createMessage('assistant', reply)])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsSending(false)
      }
    },
    [isSending, language, messages, gates]
  )

  return { messages, isSending, error, sendMessage }
}
