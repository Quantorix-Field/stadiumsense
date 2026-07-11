import { Suspense, lazy } from 'react'
import { useCrowdData } from './hooks/useCrowdData'
import { GateFinder } from './components/GateFinder'
import { AccessibilityPanel } from './components/AccessibilityPanel'
import { TransportPanel } from './components/TransportPanel'
import { getTransportOptions } from './utils/transportData'
/**
 * Lazy-loaded since the chat assistant pulls in the largest chunk of
 * interactive logic (hooks, API client) but isn't needed for first paint —
 * this keeps the initial bundle smaller and the gate panel visible sooner.
 */
const ChatAssistant = lazy(() =>
  import('./components/ChatAssistant').then((m) => ({ default: m.ChatAssistant }))
)
/**
 * Root layout for StadiumSense. Crowd data is fetched once here and passed
 * down, rather than each panel polling independently — keeps gate rankings
 * and accessibility counts in sync with each other.
 */
export function App() {
  const { gates, isLoading } = useCrowdData()
  const transportOptions = getTransportOptions()

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>StadiumSense</h1>
        <p>Your AI guide for FIFA World Cup 2026 stadiums</p>
      </header>

      <main className="app-main">
        <Suspense fallback={<p className="chat-loading">Loading assistant…</p>}>
          <ChatAssistant gates={gates} transportOptions={transportOptions} />
        </Suspense>
        <GateFinder gates={gates} isLoading={isLoading} />
        <AccessibilityPanel gates={gates} />
          <TransportPanel />
        </main>

      <footer className="app-footer">
        <p>Built for PromptWars Virtual — Challenge 4: Smart Stadiums &amp; Tournament Operations</p>
      </footer>
    </div>
  )
}
