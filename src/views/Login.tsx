import { useState, type FormEvent } from 'react'
import { Button, Card } from '../components/ui'
import { signIn } from '../lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await signIn(email.trim(), password)
      // On success, onAuthStateChange in AuthProvider flips the gate.
    } catch {
      setError('Anmeldung fehlgeschlagen. E-Mail oder Passwort prüfen.')
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Budget Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-500">Bitte anmelden, um fortzufahren.</p>
        </div>

        <Card>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Passwort
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-300">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" disabled={busy} className="w-full">
              {busy ? 'Anmelden…' : 'Anmelden'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
