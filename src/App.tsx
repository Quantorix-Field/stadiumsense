import { useCrowdData } from './hooks/useCrowdData'
import { GateFinder } from './components/GateFinder'
import { AccessibilityPanel } from './components/AccessibilityPanel'
import { ChatAssistant } from './components/ChatAssistant'

/**
 * Root layout for StadiumSense. Crowd data is fetched once here and passed
 * down, rather than each panel polling independently — keeps gate rankings
 * and accessibility counts in sync with each other.
 */
export function App() {
  const { gates, isLoading } = useCrowdData()

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>StadiumSense</h1>
        <p>Your AI guide for FIFA World Cup 2026 stadiums</p>
      </header>

      <main className="app-main">
        <ChatAssistant gates={gates} />
        <GateFinder gates={gates} isLoading={isLoading} />
        <AccessibilityPanel gates={gates} />
      </main>

      <footer className="app-footer">
        <p>Built for PromptWars Virtual — Challenge 4: Smart Stadiums &amp; Tournament Operations</p>
      </footer>
    </div>
  )
}
