import { Suspense, lazy, useState } from 'react'
import { useCrowdData } from './hooks/useCrowdData'
import { GateFinder } from './components/GateFinder'
import { AccessibilityPanel } from './components/AccessibilityPanel'
import { TransportPanel } from './components/TransportPanel'
import { RoutePlanner } from './components/RoutePlanner'
import { PersonaSelector } from './components/PersonaSelector'
import { VolunteerDashboard } from './components/VolunteerDashboard'
import { OrganizerDashboard } from './components/OrganizerDashboard'
import { VenueStaffDashboard } from './components/VenueStaffDashboard'
import { getTransportOptions } from './utils/transportData'
import { useDisplayMode } from './hooks/useDisplayMode'
import type { Persona } from './types'
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
  const { toggle, isHighVisibility } = useDisplayMode()
  const [persona, setPersona] = useState<Persona | null>(null)
  return (
    <div className={`app-shell ${isHighVisibility ? 'app-shell-high-visibility' : ''}`}>
      <header className="app-header">
        <div className="app-header-top">
          <h1>StadiumSense</h1>
          <button
            type="button"
            className="display-mode-toggle"
            onClick={toggle}
            aria-pressed={isHighVisibility}
          >
            {isHighVisibility ? '✓ ' : ''}High-visibility / screen-reader mode
          </button>
        </div>
        <p>Your AI guide for FIFA World Cup 2026 stadiums</p>
        {persona && (
          <button type="button" className="change-role-button" onClick={() => setPersona(null)}>
            ← Change role
          </button>
        )}
      </header>

      {!persona && <PersonaSelector onSelect={setPersona} />}

      {persona === 'volunteer' && <VolunteerDashboard gates={gates} />}
      {persona === 'organizer' && <OrganizerDashboard gates={gates} />}
      {persona === 'venue-staff' && <VenueStaffDashboard gates={gates} />}

      {persona === 'fan' && (
      <main className="app-main">
        <Suspense fallback={<p className="chat-loading">Loading assistant…</p>}>
          <ChatAssistant gates={gates} transportOptions={transportOptions} />
        </Suspense>
        <RoutePlanner gates={gates} />
        <GateFinder gates={gates} isLoading={isLoading} />
        <AccessibilityPanel gates={gates} />
        <TransportPanel />
      </main>
      )}

      <footer className="app-footer">
        <p>
          Built for PromptWars Virtual — Challenge 4: Smart Stadiums &amp; Tournament Operations
        </p>
      </footer>
    </div>
  )
}
