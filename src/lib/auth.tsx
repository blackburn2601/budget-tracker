import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getClient, isSupabaseConfigured } from './supabase'

// ---------------------------------------------------------------------------
// Auth — single-user gate via Supabase email/password.
// The app is mandatory-auth: without a session AuthGate renders the login.
// Supabase-js persists/refreshes the JWT in localStorage on its own.
// ---------------------------------------------------------------------------

/** Sign in with email + password. Throws on failure. */
export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await getClient().auth.signInWithPassword({ email, password })
  if (error) throw error
}

/** Sign out the current session. */
export async function signOut(): Promise<void> {
  await getClient().auth.signOut()
}

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  // When Supabase isn't configured there is nothing to load — skip the spinner.
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const client = getClient()

    client.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = client.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setLoading(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    loading,
    signOut,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
