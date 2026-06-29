# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev-server → http://localhost:5173
npm run build    # Production build to dist/
npm run preview  # Serve the production build locally
```

There are no tests or a linter configured.

## Architecture

Single-page React 18 + TypeScript app built with Vite. No routing library — the active view is driven by `activeTab` in the Zustand store. The app is gated behind a mandatory email/password login (Supabase Auth); after sign-in the Supabase cloud row is the source of truth, and `localStorage` (Zustand `persist`) is only a local cache.

### State (`src/store.ts`)

One global `useStore` (Zustand + `persist`). Persisted slice: `scenarios`, `activeScenarioId`, `darkMode` — under the key `budget-tracker-v4`. Bump the version key whenever the `Scenario` shape changes to force a clean reseed from `buildSeed()`.

The `active()` selector returns the currently selected `Scenario`. All mutations take a `scenarioId` and use the shared `patchScenario` helper to immutably update the matching entry.

### Domain model (`src/types.ts`)

```
Scenario
  ├── income: Income          (haupteinkommen, sonstiges, pvEinspeisung)
  ├── expenses: Expense[]     (id, name, amount, note, category)
  ├── assets: Asset[]         (id, name, type, current, monthlyAdd, countsAsSavings)
  ├── leasing: Leasing        (enabled, rate, restwert, wartung, versicherung)
  ├── kontostand, kaution, notes
  └── order                   (display order in sidebar)
```

`CategoryKey` is a fixed union (`fixkosten | versicherungen | kredit_kfz | immobilien | investitionen`). `AssetType` is also fixed (`tagesgeld | depot | krypto | gold | rente`).

### Calculations (`src/lib/calc.ts`)

Pure functions only — no side effects, no store access. Key computed values:
- `totalExpenses(s)` — expenses + active leasing cost (rate + wartung + versicherung; `restwert` excluded)
- `rest(s)` — totalIncome − totalExpenses
- `sparrate(s)` — investitionen + immobilien categories (both count as capital investment outflow)
- `gesamtVermoegen(assets)` / `gesamtVermoegenProjected(assets)` — current vs. after one month's contributions

### Views (`src/views/`)

| File | Tab |
|---|---|
| `Dashboard.tsx` | Summary cards, donut + bar charts, category subtotals |
| `Expenses.tsx` | Expense CRUD grouped by category, income editor, leasing panel |
| `Wealth.tsx` | Asset CRUD, monthly projection, allocation chart, cross-scenario wealth trend |
| `Compare.tsx` | Side-by-side table of all scenarios |
| `Settings.tsx` | JSON/CSV export, JSON import, Supabase sync, reset |

### Shared components (`src/components/`)

- `Sidebar.tsx` — scenario switcher + nav tabs
- `charts.tsx` — reusable Recharts wrappers (donut, bar, line)
- `ui.tsx` — small primitive UI components
- `CloudSaveButton.tsx` — cloud load/save button, only renders when Supabase is configured

### Auth gate (`src/lib/auth.tsx`, `src/components/AuthGate.tsx`)

Mandatory single-user email/password login. `AuthProvider` holds the Supabase session; `AuthGate` (in `main.tsx`, wrapping `<App/>`) renders: a "Supabase erforderlich" screen if env vars are missing, a splash while loading, `<Login/>` if signed out, else the app. The dark-mode `dark` class effect lives in `AuthGate` (not `App`) so the login/splash screens honor it too.

**Data-safety ordering** (`SyncedApp` in `AuthGate.tsx`): on auth it calls `loadFromCloud()` **first**; only after a successful load does it enable a debounced (~1.5s) autosave via `useStore.subscribe`. If the load fails, autosave stays off (never overwrite the live row from stale local state). `saveToCloud` also refuses to upsert an empty `scenarios` array. ⚠️ The `budget_snapshots` row holds live data — back it up before schema changes.

### Supabase sync (`src/lib/supabase.ts`)

Stores the entire app state as a single JSONB row (`budget_snapshots` table, key `default`). `getClient()` is the shared client reused by auth. Configured via `.env.local`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...   # or VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_ROW_KEY=...    # optional, defaults to "default"
```
Run `supabase/schema.sql` (sets the RLS policy to `authenticated`), disable public sign-ups, and create the one user in the Supabase dashboard. The manual `CloudSaveButton` / Settings sync buttons remain alongside autosave.

### Seed data (`src/data/seed.ts`)

`buildSeed()` returns the initial `{ scenarios, activeScenarioId }` used on first load and on reset. The fictional persona is "Lena Bauer" — keep seed data fictional and free of real personal information.

## Conventions

- German UI language throughout — labels, field names, and user-facing strings are in German.
- Currency formatting via `src/lib/format.ts` (`formatEuro`, `formatPct`).
- Tailwind CSS v4 for all styling. Dark mode is toggled by adding the `dark` class to `<html>`.
- IDs are generated with the inline `uid()` helper in `store.ts` (no library needed).
