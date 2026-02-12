# Math Racer

## Overview

Math Racer is a mobile-first multiplication practice app built with Expo (React Native). Users select which multiplication tables to practice (1–10), choose a session mode (fixed number of questions or timed), and then answer multiplication problems in a racing-themed interface. The app tracks performance with detailed statistics, session history, table-by-table breakdowns, and trend analysis. It includes an Express backend server, though the core game logic and stats are handled client-side with AsyncStorage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with expo-router for file-based routing
- **Screens**: 4 main screens managed by expo-router's Stack navigator:
  - `index` — Home screen with table selection, mode picker (questions vs timed), and start button
  - `practice` — The active quiz screen with a race track progress visualization, number pad, and timer
  - `results` — Post-session results showing accuracy, streaks, time, and per-question breakdown
  - `history` — All-time stats, session history list, weak tables analysis, and sparkline trends
- **Styling**: Custom color theme in `constants/colors.ts` with a dark racing aesthetic. Uses `expo-linear-gradient` for gradient backgrounds.
- **Fonts**: Outfit font family (400–800 weights) via `@expo-google-fonts/outfit`
- **Animations**: `react-native-reanimated` for animated transitions, shake effects on wrong answers, fade-ins, and the race car progress bar
- **Haptics**: `expo-haptics` for tactile feedback on button presses and correct/wrong answers
- **State Management**: React local state (useState/useCallback) for game state. No global state store — each screen receives data via route params.
- **Data Fetching**: `@tanstack/react-query` with a configured query client in `lib/query-client.ts`, though currently the app primarily uses local storage rather than API calls

### Data Storage

- **Client-side**: `@react-native-async-storage/async-storage` stores all game stats and session history locally on device (`lib/stats-storage.ts`). Keys: `math_racer_stats` (cumulative table stats) and `math_racer_sessions` (session records array).
- **Server-side schema**: Drizzle ORM with PostgreSQL is configured (`shared/schema.ts`, `drizzle.config.ts`) but currently only has a basic `users` table. The server uses in-memory storage (`MemStorage` class in `server/storage.ts`) as a placeholder.
- **Database**: PostgreSQL via Drizzle ORM. Run `npm run db:push` to push schema. The `DATABASE_URL` environment variable must be set.

### Backend (Express)

- **Server**: Express 5 in `server/index.ts` with CORS configured for Replit domains and localhost
- **Routes**: `server/routes.ts` — currently empty (placeholder for `/api` routes)
- **Storage layer**: `server/storage.ts` — interface-based storage with `MemStorage` implementation. Has user CRUD methods but no game-specific endpoints yet.
- **Build**: Server is bundled with esbuild for production (`server_dist/`)
- **Static serving**: In production, serves Expo web build as static files; in development, proxies to Metro bundler

### Build & Development

- **Dev workflow**: Two processes run simultaneously — `expo:dev` (Metro bundler for the mobile/web client) and `server:dev` (Express API via tsx)
- **Production build**: `expo:static:build` creates a static web export, `server:build` bundles the server, `server:prod` runs it
- **Proxy setup**: In dev mode, the Express server proxies non-API requests to the Expo Metro bundler via `http-proxy-middleware`

### Key Components

- `TableSelector` — Grid of 1–10 toggle buttons for selecting multiplication tables
- `RaceTrack` — Animated progress bar with a car icon showing quiz completion progress
- `ErrorBoundary` / `ErrorFallback` — Class-based error boundary with restart capability
- `KeyboardAwareScrollViewCompat` — Platform-aware wrapper (native keyboard controller vs web ScrollView)

## External Dependencies

- **PostgreSQL** — Database (via `DATABASE_URL` env var), managed through Drizzle ORM and drizzle-kit
- **Expo ecosystem** — expo-router, expo-haptics, expo-linear-gradient, expo-image, expo-splash-screen, expo-font, expo-status-bar, expo-constants
- **React Native libraries** — react-native-reanimated, react-native-gesture-handler, react-native-safe-area-context, react-native-screens, react-native-keyboard-controller, react-native-svg
- **@tanstack/react-query** — Data fetching/caching (configured but minimally used currently)
- **@react-native-async-storage/async-storage** — Local persistent storage for game stats
- **drizzle-orm / drizzle-zod** — ORM and schema validation (PostgreSQL dialect)
- **express** — Backend HTTP server
- **http-proxy-middleware** — Dev proxy from Express to Metro bundler
- **@expo-google-fonts/outfit** — Custom font loading
- **patch-package** — Applied via postinstall for any patched dependencies