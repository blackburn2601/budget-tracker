import { useStore } from '../store'
import { Card, Money, Stat } from '../components/ui'
import { DonutChart, IncomeExpenseBar, Legendry } from '../components/charts'
import {
  categoryBreakdown,
  gesamtVermoegen,
  rest,
  sparrate,
  sparquote,
  sparVermoegen,
  totalExpenses,
  totalIncome,
} from '../lib/calc'
import { ASSET_TYPE_COLOR, ASSET_TYPE_LABEL, type AssetType } from '../types'
import { formatEur } from '../lib/format'

export default function Dashboard() {
  const s = useStore((st) => st.active())
  if (!s) return null

  const expenses = totalExpenses(s)
  const income = totalIncome(s.income)
  const leftover = rest(s)

  const breakdown = categoryBreakdown(s)
  const donutData = breakdown.map((c) => ({ name: c.label, value: c.total, color: c.color }))

  // asset allocation by type
  const allocMap = new Map<AssetType, number>()
  for (const a of s.assets) allocMap.set(a.type, (allocMap.get(a.type) ?? 0) + a.current)
  const allocData = [...allocMap.entries()]
    .map(([type, value]) => ({ name: ASSET_TYPE_LABEL[type], value, color: ASSET_TYPE_COLOR[type] }))
    .filter((d) => d.value > 0)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{s.name}</h2>
        {s.notes && <p className="mt-1 text-sm text-slate-500">{s.notes}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Einkünfte" value={formatEur(income)} tone="good" />
        <Stat label="Kontobelastung" value={formatEur(expenses)} tone="bad" />
        <Stat
          label="Rest"
          value={<Money value={leftover} />}
          tone={leftover < 0 ? 'bad' : 'brand'}
          hint={`Sparrate ${formatEur(sparrate(s))} · Quote ${Math.round(sparquote(s) * 100)}%`}
        />
        <Stat label="Gesamt-Vermögen" value={formatEur(gesamtVermoegen(s.assets))} tone="neutral" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Ausgaben nach Kategorie">
          <DonutChart
            data={donutData}
            centerLabel="Kontobelastung"
            centerValue={formatEur(expenses)}
          />
          <Legendry data={donutData} />
        </Card>

        <Card title="Einkünfte · Belastung · Rest">
          <IncomeExpenseBar income={income} expenses={expenses} rest={leftover} />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="text-slate-400">Kontostand</div>
              <div className="font-semibold tabular-nums">{formatEur(s.kontostand)}</div>
            </div>
            <div>
              <div className="text-slate-400">Kaution</div>
              <div className="font-semibold tabular-nums">{formatEur(s.kaution)}</div>
            </div>
            <div>
              <div className="text-slate-400">Spar-Vermögen</div>
              <div className="font-semibold tabular-nums">{formatEur(sparVermoegen(s.assets))}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Zwischensummen je Kategorie">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {breakdown.map((c) => (
              <li key={c.key} className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-sm text-slate-700 dark:text-slate-200">{c.label}</span>
                  <span className="text-xs text-slate-400">({c.count})</span>
                </span>
                <span className="font-semibold tabular-nums">{formatEur(c.total)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between pt-3 text-base font-bold">
              <span>Gesamt</span>
              <span className="tabular-nums">{formatEur(expenses)}</span>
            </li>
            <li className="flex items-center justify-between pt-2 text-sm text-emerald-600 dark:text-emerald-400">
              <span>davon Sparrate (Invest. + Immobilie)</span>
              <span className="font-semibold tabular-nums">{formatEur(sparrate(s))}</span>
            </li>
          </ul>
        </Card>

        <Card title="Vermögensaufteilung">
          {allocData.length ? (
            <>
              <DonutChart
                data={allocData}
                centerLabel="Gesamt"
                centerValue={formatEur(gesamtVermoegen(s.assets))}
              />
              <Legendry data={allocData} />
            </>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">
              Noch keine Vermögenswerte erfasst.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
