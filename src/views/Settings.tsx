import { useRef, useState } from 'react'
import { useStore } from '../store'
import { Button, Card } from '../components/ui'
import {
  isSupabaseConfigured,
  loadFromCloud,
  saveToCloud,
} from '../lib/supabase'
import { categoryTotal, rest, totalExpenses, totalIncome } from '../lib/calc'
import { CATEGORIES, type Scenario } from '../types'

export default function Settings() {
  const scenarios = useStore((st) => st.scenarios)
  const activeScenarioId = useStore((st) => st.activeScenarioId)
  const replaceAll = useStore((st) => st.replaceAll)
  const resetData = useStore((st) => st.resetData)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const flash = (kind: 'ok' | 'err', text: string) => {
    setMsg({ kind, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ scenarios, activeScenarioId }, null, 2)], {
      type: 'application/json',
    })
    download(blob, 'budget-tracker.json')
  }

  const exportCsv = () => {
    const lines = ['Szenario;Kategorie;Kostentraeger;Betrag;Notiz']
    for (const s of scenarios) {
      for (const e of s.expenses) {
        const cat = CATEGORIES.find((c) => c.key === e.category)?.label ?? e.category
        lines.push(
          [s.name, cat, e.name, e.amount.toFixed(2).replace('.', ','), e.note]
            .map((c) => `"${String(c).replace(/"/g, '""')}"`)
            .join(';'),
        )
      }
    }
    download(new Blob([lines.join('\n')], { type: 'text/csv' }), 'budget-tracker.csv')
  }

  const onImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        const list: Scenario[] = parsed.scenarios ?? parsed
        if (!Array.isArray(list) || !list.length) throw new Error('Keine Szenarien gefunden.')
        replaceAll(list, parsed.activeScenarioId)
        flash('ok', `${list.length} Szenarien importiert.`)
      } catch (e) {
        flash('err', 'Import fehlgeschlagen: ' + (e as Error).message)
      }
    }
    reader.readAsText(file)
  }

  const cloudSave = async () => {
    try {
      await saveToCloud({ scenarios, activeScenarioId })
      flash('ok', 'In Supabase gespeichert.')
    } catch (e) {
      flash('err', 'Cloud-Speichern fehlgeschlagen: ' + (e as Error).message)
    }
  }
  const cloudLoad = async () => {
    try {
      const snap = await loadFromCloud()
      if (!snap) return flash('err', 'Keine Daten in der Cloud gefunden.')
      replaceAll(snap.scenarios, snap.activeScenarioId)
      flash('ok', 'Aus Supabase geladen.')
    } catch (e) {
      flash('err', 'Cloud-Laden fehlgeschlagen: ' + (e as Error).message)
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Einstellungen & Daten</h2>

      {msg && (
        <div
          className={`rounded-xl px-4 py-2.5 text-sm ${
            msg.kind === 'ok'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
              : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
          }`}
        >
          {msg.text}
        </div>
      )}

      <Card title="Export / Import">
        <p className="mb-3 text-sm text-slate-500">
          Alle Daten liegen lokal im Browser (localStorage). Hier kannst du sie sichern oder
          wiederherstellen.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="subtle" onClick={exportJson}>⬇ JSON exportieren</Button>
          <Button variant="subtle" onClick={exportCsv}>⬇ CSV exportieren</Button>
          <Button variant="subtle" onClick={() => fileRef.current?.click()}>⬆ JSON importieren</Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
          />
        </div>
      </Card>

      <Card title="Supabase Cloud-Sync">
        {isSupabaseConfigured ? (
          <>
            <p className="mb-3 text-sm text-emerald-600 dark:text-emerald-400">
              ✓ Supabase ist konfiguriert.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={cloudSave}>☁ In Cloud speichern</Button>
              <Button variant="subtle" onClick={cloudLoad}>⬇ Aus Cloud laden</Button>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-500">
            <p className="mb-2">
              Supabase ist noch nicht konfiguriert. Lege eine Datei <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">.env.local</code> an mit:
            </p>
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
{`VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
VITE_SUPABASE_ROW_KEY=default`}
            </pre>
            <p className="mt-2">Danach Dev-Server neu starten. SQL-Schema siehe <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">supabase/schema.sql</code>.</p>
          </div>
        )}
      </Card>

      <Card title="Übersicht">
        <ul className="space-y-1.5 text-sm">
          {[...scenarios].sort((a, b) => a.order - b.order).map((s) => (
            <li key={s.id} className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">{s.name}</span>
              <span className="tabular-nums text-slate-400">
                Belastung {fmt(totalExpenses(s))} · Rest {fmt(rest(s))} ·{' '}
                Fix {fmt(categoryTotal(s, 'fixkosten'))} · Eink. {fmt(totalIncome(s.income))}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Zurücksetzen">
        <p className="mb-3 text-sm text-slate-500">
          Setzt alle Szenarien auf die Ausgangsdaten zurück. Lokale Änderungen gehen verloren.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            if (confirm('Wirklich alle Daten auf die Ausgangswerte zurücksetzen?')) {
              resetData()
              flash('ok', 'Daten zurückgesetzt.')
            }
          }}
        >
          Auf Ausgangsdaten zurücksetzen
        </Button>
      </Card>
    </div>
  )
}

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
