import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '../lib/auth'
import { useStore } from '../store'
import { isSupabaseConfigured, loadFromCloud, saveToCloud } from '../lib/supabase'
import Login from '../views/Login'

// ---------------------------------------------------------------------------
// AuthGate — wraps the whole app.
//   not configured → setup screen   |   loading → splash
//   no session     → <Login/>       |   authed   → <SyncedApp/> (then children)
// ---------------------------------------------------------------------------

export default function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const darkMode = useStore((s) => s.darkMode)

  // Apply dark mode here (not in App) so the login/splash screens honor it too.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  if (!isSupabaseConfigured) return <ConfigNeeded />
  if (loading) return <Splash text="Wird geladen…" />
  if (!session) return <Login />
  return <SyncedApp>{children}</SyncedApp>
}

/**
 * Cloud is the source of truth. Load BEFORE enabling autosave so a stale
 * localStorage state can never overwrite the live row (see plan §Data safety).
 */
function SyncedApp({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading')
  const replaceAll = useStore((s) => s.replaceAll)

  // 1. Pull the live snapshot first.
  useEffect(() => {
    let cancelled = false
    loadFromCloud()
      .then((snap) => {
        if (cancelled) return
        if (snap?.scenarios?.length) replaceAll(snap.scenarios, snap.activeScenarioId)
        setPhase('ready') // only now is autosave allowed
      })
      .catch(() => {
        if (!cancelled) setPhase('error') // autosave stays OFF — never clobber
      })
    return () => {
      cancelled = true
    }
  }, [replaceAll])

  // 2. Debounced autosave, active only after a successful load.
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (phase !== 'ready') return
    const unsub = useStore.subscribe((state, prev) => {
      if (
        state.scenarios === prev.scenarios &&
        state.activeScenarioId === prev.activeScenarioId
      ) {
        return // ignore UI-only changes (tab, dark mode, …)
      }
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        const { scenarios, activeScenarioId } = useStore.getState()
        saveToCloud({ scenarios, activeScenarioId }).catch(() => {
          /* transient; next change retries */
        })
      }, 1500)
    })
    return () => {
      clearTimeout(timer.current)
      unsub()
    }
  }, [phase])

  if (phase === 'loading') return <Splash text="Daten werden geladen…" />
  if (phase === 'error') return <LoadError />
  return <>{children}</>
}

function Splash({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-950">
      {text}
    </div>
  )
}

function LoadError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-4 text-center dark:bg-slate-950">
      <div className="max-w-md text-sm text-slate-600 dark:text-slate-300">
        <p className="mb-1 text-lg font-semibold text-red-600 dark:text-red-400">
          Daten konnten nicht geladen werden
        </p>
        <p>
          Die Cloud-Daten sind nicht erreichbar. Aus Sicherheitsgründen wird
          nichts gespeichert, um vorhandene Daten nicht zu überschreiben. Bitte
          die Verbindung prüfen und neu laden.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Neu laden
      </button>
    </div>
  )
}

function ConfigNeeded() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
          Supabase erforderlich
        </h1>
        <p className="mb-3 text-sm text-slate-500">
          Diese App benötigt eine Anmeldung. Lege eine Datei{' '}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">.env.local</code>{' '}
          an mit:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
{`VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
VITE_SUPABASE_ROW_KEY=default`}
        </pre>
        <p className="mt-3 text-sm text-slate-500">
          Danach Dev-Server neu starten. SQL-Schema siehe{' '}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
            supabase/schema.sql
          </code>
          .
        </p>
      </div>
    </div>
  )
}
