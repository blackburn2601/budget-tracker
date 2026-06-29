import { useState } from 'react'
import { useStore } from '../store'
import { isSupabaseConfigured, saveToCloud } from '../lib/supabase'

type Status = 'idle' | 'saving' | 'ok' | 'err'

export default function CloudSaveButton() {
  const scenarios = useStore((st) => st.scenarios)
  const activeScenarioId = useStore((st) => st.activeScenarioId)
  const userName = useStore((st) => st.userName)
  const [status, setStatus] = useState<Status>('idle')
  const [err, setErr] = useState('')

  const save = async () => {
    if (status === 'saving') return
    setStatus('saving')
    setErr('')
    try {
      await saveToCloud({ scenarios, activeScenarioId, userName })
      setStatus('ok')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (e) {
      setErr((e as Error).message)
      setStatus('err')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  const label =
    status === 'saving' ? 'Speichern…'
    : status === 'ok' ? 'Gespeichert'
    : status === 'err' ? 'Fehler'
    : 'In Cloud speichern'

  const icon =
    status === 'saving' ? '⏳' : status === 'ok' ? '✓' : status === 'err' ? '✕' : '☁'

  const tone =
    status === 'ok'
      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
      : status === 'err'
        ? 'bg-red-600 text-white hover:bg-red-700'
        : 'bg-brand-600 text-white hover:bg-brand-700'

  if (!isSupabaseConfigured) {
    return (
      <button
        disabled
        title="Supabase nicht konfiguriert (siehe Einstellungen)"
        className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-400 dark:bg-slate-800"
      >
        ☁ <span className="hidden sm:inline">Cloud</span>
      </button>
    )
  }

  return (
    <button
      onClick={save}
      disabled={status === 'saving'}
      title={status === 'err' ? err : 'Aktuellen Stand in Supabase speichern'}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-70 ${tone}`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
