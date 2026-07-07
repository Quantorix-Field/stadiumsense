import { useRef, useState, type FormEvent } from 'react'
import type { SupportedLanguage } from '../types'
import { useChat } from '../hooks/useChat'
import { useLanguage } from '../hooks/useLanguage'
import { formatTimestamp } from '../utils/formatters'
import { LanguageSelector } from './LanguageSelector'

/**
 * Core GenAI-powered chat surface. Fans ask natural-language questions about
 * navigation, gates, transport, or accessibility and get grounded, short
 * answers back through our serverless Gemini proxy.
 */
export function ChatAssistant() {
  const { language, setLanguage, options } = useLanguage()
  const { messages, isSending, error, sendMessage } = useChat(language)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const text = draft
    setDraft('')
    await sendMessage(text)
    inputRef.current?.focus()
  }

  const handleLanguageChange = (code: SupportedLanguage) => {
    setLanguage(code)
  }

  return (
    <section className="chat-assistant" aria-label="StadiumSense assistant">
      <div className="chat-header">
        <h2>Ask StadiumSense</h2>
        <LanguageSelector options={options} value={language} onChange={handleLanguageChange} />
      </div>

      <div className="chat-log" role="log" aria-live="polite">
        {messages.length === 0 && (
          <p className="chat-empty-state">
            Ask about gates, wait times, transport, or accessibility.
          </p>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`chat-message chat-message-${message.role}`}>
            <p>{message.content}</p>
            <span className="chat-timestamp">{formatTimestamp(message.timestamp)}</span>
          </div>
        ))}
        {isSending && (
          <p className="chat-typing-indicator" aria-live="polite">
            StadiumSense is typing…
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="chat-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="chat-input-form">
        <label htmlFor="chat-input" className="sr-only">
          Ask a question
        </label>
        <input
          id="chat-input"
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. Which gate has the shortest wait?"
          disabled={isSending}
          autoComplete="off"
        />
        <button type="submit" disabled={isSending || !draft.trim()}>
          Send
        </button>
      </form>
    </section>
  )
}
