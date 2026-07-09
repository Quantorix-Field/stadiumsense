# StadiumSense

**AI-powered fan navigation and multilingual assistant for FIFA World Cup 2026 stadiums**

Built for **Google PromptWars Virtual (Hack2Skill) — Challenge 4: Smart Stadiums & Tournament Operations**

🔗 **Live app:** https://stadiumsense-eta.vercel.app/

🔗 **Repository:** https://github.com/Quantorix-Field/stadiumsense.git

---

## Chosen Vertical

**Fan Navigation & Multilingual Assistant**

Of the themes listed in the challenge (navigation, crowd management, accessibility, transportation, sustainability, multilingual assistance, operational intelligence, real-time decision support), StadiumSense is built around a single, focused persona: **a fan standing outside the stadium who needs to get in quickly, safely, and comfortably.**

This vertical was chosen because it naturally combines four of the challenge's core themes into one coherent, testable product rather than four disconnected features:

- **Navigation** — ranked gate recommendations based on live conditions
- **Crowd management** — real-time crowd density per gate, visualized clearly
- **Accessibility** — a wheelchair-accessible filter and a dedicated accessibility information panel
- **Multilingual assistance** — a GenAI chat assistant that answers in the fan's chosen language

Rather than building a broad but shallow operations dashboard, this focus allows the solution to be judged end-to-end by a single, realistic user story: *"I just arrived at the stadium — which gate should I use?"*

---

## Approach and Logic

The core design principle behind StadiumSense is that **the AI assistant should never guess.** A generic chatbot that says "I recommend checking the nearest gate" is not useful to a fan standing in a crowd. Instead, the assistant is explicitly grounded in the same live gate data shown in the UI:

1. A crowd-simulation engine (`src/utils/crowdSimulator.ts`) generates deterministic, time-seeded "live" data for five stadium gates — crowd level, wait time, distance, and wheelchair accessibility. This is designed to be a drop-in replacement point for a real venue telemetry feed in production.
2. That same gate data is displayed directly to the user in the **Recommended Gates** panel, ranked by a weighted combination of crowd level and distance.
3. When a fan asks the AI assistant a question, the **exact same gate data** is passed into the prompt sent to Gemini. The assistant is explicitly instructed to base its answer on those numbers rather than inventing information.

This means the chat assistant and the visual gate panel can never contradict each other — what the AI says and what the UI shows are backed by one single source of truth.

A second design principle was **security by default**. The Gemini API key never touches the browser or the public repository. All AI calls are routed through a Vercel serverless function (`api/chat.ts`), which holds the key only in a server-side environment variable. The function also validates input length, enforces a sliding-window rate limit per client, and strips any stray markdown formatting from AI replies before they reach the user.

---

## How the Solution Works

**User flow:**
1. A fan opens the app and sees five stadium gates ranked by current conditions, refreshed automatically every 15 seconds.
2. They can toggle "Wheelchair-accessible only" to instantly filter to accessible entrances.
3. They can switch the assistant's language (English, Spanish, Portuguese, French, Arabic, Hindi) from a dropdown.
4. They ask a natural-language question — e.g. *"Which gate should I avoid right now?"* or *"मुझे कौन सा गेट लेना चाहिए"*.
5. The question, along with the live gate data and selected language, is sent to `/api/chat`.
6. The serverless function builds a grounded prompt, calls the Gemini API (`gemini-flash-latest`), cleans the response, and returns a short, direct, plain-text answer in the requested language.
7. The fan sees a specific, accurate answer — naming real gates with real numbers — not a generic response.

**Technical architecture:**

```
src/
├── components/       → ErrorBoundary, ChatAssistant, GateFinder, CrowdMeter,
│                        LanguageSelector, AccessibilityPanel
├── hooks/            → useChat, useCrowdData, useLanguage
├── utils/            → crowdSimulator (deterministic mock data engine),
│                        formatters, api (backend proxy client)
├── types/            → shared TypeScript contracts
api/
└── chat.ts           → Vercel serverless proxy — holds the Gemini key,
                          grounds prompts in live gate data, rate-limits,
                          and sanitizes output
tests/                → Vitest + Testing Library coverage for all
                         components, hooks, and pure logic
```

**Key engineering decisions:**
- **Full TypeScript** across the frontend, backend function, and Vite config, with `tsc --noEmit` enforced in CI.
- **Custom hooks** (`useChat`, `useCrowdData`, `useLanguage`) separate state logic from presentation, keeping components simple and testable.
- **ErrorBoundary** wraps the entire app so a runtime error shows a recoverable fallback instead of a blank screen — important for a tool used on a stadium floor.
- **CI pipeline** (GitHub Actions) runs typecheck, lint, and the full test suite on every push.
- **34 automated tests** across 6 test files cover the crowd simulation logic, all custom hooks, and every interactive component — including error states, loading states, and filtering behavior.

---

## Assumptions Made

- **Crowd and wait-time data is simulated**, not sourced from a real stadium telemetry system, since no such live feed exists for FIFA World Cup 2026 at the time of building. The simulation is deterministic (seeded by a 5-minute time window) so all users see consistent "live" data, and the interface is designed so a real data source could be swapped in without touching any consumer code.
- **Five gates** were used as a representative stadium layout (North, East, South, West, and a VIP entrance) rather than modeling a specific real venue, since the challenge does not specify an exact stadium.
- **Gemini's `gemini-flash-latest` alias** was used instead of a pinned model version, since Google has deprecated several model versions during this project's development — using the rolling alias reduces the risk of the integration breaking again if a specific dated model is retired.
- **Rate limiting is in-memory and per-instance**, which resets on a serverless cold start. This is an intentional, documented tradeoff appropriate for a demo-scale deployment; a production system would use a shared store (e.g. Redis) for persistent rate limiting across instances.
- **Language selection is explicit** (via a dropdown) rather than auto-detected from the typed question, so that a fan's chosen language is always respected consistently, even if they type a question in a different language.

---

## Tech Stack

React 18 · TypeScript · Vite · Vitest + Testing Library · Vercel Serverless Functions · Google Gemini API · GitHub Actions CI

---

## Running Locally

```bash
npm install
npm run dev          # start local dev server
npm run typecheck    # verify TypeScript compiles cleanly
npm run lint         # run ESLint
npm run test         # run the full test suite
npm run build        # production build
```

A `GEMINI_API_KEY` environment variable is required for the chat assistant to function (set in Vercel's dashboard for deployment, or a local `.env` for development against the Vercel dev server).

---

*Built for PromptWars Virtual — Challenge 4: Smart Stadiums & Tournament Operations.*
