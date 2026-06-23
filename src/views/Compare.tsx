import { useStore } from '../store'
import { Card } from '../components/ui'
import {
  categoryTotal,
  gesamtVermoegen,
  rest,
  sparrate,
  totalExpenses,
  totalIncome,
} from '../lib/calc'
import { formatEur } from '../lib/format'

export default function Compare() {
  const scenarios = useStore((st) => st.scenarios)
  const setActiveScenario = useStore((st) => st.setActiveScenario)
  const setTab = useStore((st) => st.setTab)

  const list = [...scenarios].sort((a, b) => a.order - b.order)

  const rows: { label: string; get: (id: string) => number; tone?: 'rest' }[] = [
    { label: 'Fixkosten / Abos', get: (id) => categoryTotal(find(id), 'fixkosten') },
    { label: 'Versicherungen', get: (id) => categoryTotal(find(id), 'versicherungen') },
    { label: 'Kredit / KFZ', get: (id) => categoryTotal(find(id), 'kredit_kfz') },
    { label: 'Immobilien (Kapitalanlage)', get: (id) => categoryTotal(find(id), 'immobilien') },
    { label: 'Sparrate (inkl. Immobilie)', get: (id) => sparrate(find(id)) },
    { label: 'Kontobelastung', get: (id) => totalExpenses(find(id)) },
    { label: 'Einkünfte', get: (id) => totalIncome(find(id).income) },
    { label: 'Rest', get: (id) => rest(find(id)), tone: 'rest' },
    { label: 'Gesamt-Vermögen', get: (id) => gesamtVermoegen(find(id).assets) },
  ]

  function find(id: string) {
    return scenarios.find((s) => s.id === id)!
  }

  const open = (id: string) => {
    setActiveScenario(id)
    setTab('dashboard')
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Szenario-Vergleich</h2>
        <p className="mt-1 text-sm text-slate-500">
          Alle Szenarien im direkten Vergleich. Spalte anklicken, um das Szenario zu öffnen.
        </p>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  Kennzahl
                </th>
                {list.map((s) => (
                  <th
                    key={s.id}
                    onClick={() => open(s.id)}
                    className="cursor-pointer whitespace-nowrap px-3 py-3 text-right font-semibold text-slate-700 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-400"
                    title="Szenario öffnen"
                  >
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.label}
                  className={`border-t border-slate-100 dark:border-slate-800 ${
                    r.label === 'Kontobelastung' || r.label === 'Rest'
                      ? 'bg-slate-50/60 font-semibold dark:bg-slate-800/30'
                      : ''
                  }`}
                >
                  <td className="sticky left-0 z-10 bg-white px-4 py-2.5 text-left text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {r.label}
                  </td>
                  {list.map((s) => {
                    const v = r.get(s.id)
                    const negative = r.tone === 'rest' && v < 0
                    return (
                      <td
                        key={s.id + i}
                        className={`whitespace-nowrap px-3 py-2.5 text-right tabular-nums ${
                          negative ? 'text-red-600 dark:text-red-400' : ''
                        } ${r.tone === 'rest' && v >= 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
                      >
                        {formatEur(v)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
