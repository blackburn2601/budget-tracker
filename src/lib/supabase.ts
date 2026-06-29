import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Scenario } from '../types'

// ---------------------------------------------------------------------------
// Supabase sync — OPTIONAL. The app works fully on localStorage alone.
// Configure by creating a `.env.local` file (see .env.example) with:
//   VITE_SUPABASE_URL=...
//   VITE_SUPABASE_ANON_KEY=...
// ---------------------------------------------------------------------------

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Supports both the new publishable key (sb_publishable_…) and the legacy anon JWT.
const ANON = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined

// Row key for this single-user snapshot. Override via VITE_SUPABASE_ROW_KEY.
const ROW_KEY =
  (import.meta.env.VITE_SUPABASE_ROW_KEY as string | undefined) ?? 'default'

const TABLE = 'budget_snapshots'

export const isSupabaseConfigured = Boolean(URL && ANON)

let client: SupabaseClient | null = null
/** Shared Supabase client. Reused by both data sync and auth (src/lib/auth.tsx). */
export function getClient(): SupabaseClient {
  if (!client) {
    if (!URL || !ANON) throw new Error('Supabase ist nicht konfiguriert.')
    client = createClient(URL, ANON)
  }
  return client
}

export interface Snapshot {
  scenarios: Scenario[]
  activeScenarioId: string
  userName?: string
}

/** Pull the latest snapshot from the cloud. Returns null if no row exists. */
export async function loadFromCloud(): Promise<Snapshot | null> {
  const { data, error } = await getClient()
    .from(TABLE)
    .select('data')
    .eq('id', ROW_KEY)
    .maybeSingle()
  if (error) throw error
  return (data?.data as Snapshot) ?? null
}

/** Upsert the full snapshot to the cloud. */
export async function saveToCloud(snapshot: Snapshot): Promise<void> {
  // Safety guard: never blank the live row with an empty/half-initialized state.
  if (!snapshot.scenarios?.length) {
    throw new Error('Speichern abgebrochen: keine Szenarien vorhanden.')
  }
  const { error } = await getClient()
    .from(TABLE)
    .upsert(
      { id: ROW_KEY, data: snapshot, updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    )
  if (error) throw error
}
