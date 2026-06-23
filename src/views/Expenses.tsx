import { useState } from 'react'
import { useStore } from '../store'
import { Button, Card, Money, NumberField, TextField } from '../components/ui'
import { categoryTotal, rest, totalExpenses, totalIncome } from '../lib/calc'
import { CATEGORIES, type CategoryKey, type Expense } from '../types'
import { formatEur } from '../lib/format'

export default function Expenses() {
  const s = useStore((st) => st.active())
  const editMode = useStore((st) => st.editMode)
  const addExpense = useStore((st) => st.addExpense)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  if (!s) return null
  const toggle = (k: string) => setCollapsed((c) => ({ ...c, [k]: !c[k] }))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Kostenträger</h2>
          <p className="mt-1 text-sm text-slate-500">
            {s.name} · Gesamte Kontobelastung{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {formatEur(totalExpenses(s))}
            </span>
          </p>
        </div>
        {!editMode && (
          <p className="text-xs text-slate-400">
            Bearbeiten im Kopf aktivieren, um Einträge zu ändern.
          </p>
        )}
      </div>

      {CATEGORIES.map((cat) => {
        const items = s.expenses.filter((e) => e.category === cat.key)
        const isCollapsed = collapsed[cat.key]
        const showLeasing = cat.key === 'kredit_kfz' && s.leasing.enabled
        const count = items.length + (showLeasing ? 1 : 0)
        return (
          <Card key={cat.key} className="!p-0 overflow-hidden">
            <button
              onClick={() => toggle(cat.key)}
              className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-5"
            >
              <span className="flex items-center gap-2.5">
                <span className="h-3 w-3 rounded-full" style={{ background: cat.color }} />
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {cat.label}
                </span>
                <span className="text-xs text-slate-400">({count})</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="font-bold tabular-nums text-slate-700 dark:text-slate-200">
                  {formatEur(categoryTotal(s, cat.key))}
                </span>
                <span className="text-slate-400">{isCollapsed ? '▸' : '▾'}</span>
              </span>
            </button>

            {!isCollapsed && (
              <div className="border-t border-slate-100 dark:border-slate-800">
                {count === 0 && (
                  <p className="px-5 py-3 text-sm text-slate-400">Keine Einträge.</p>
                )}
                {items.map((e) => (
                  <ExpenseRow key={e.id} scenarioId={s.id} expense={e} editMode={editMode} />
                ))}
                {showLeasing && (
                  <div className="flex items-center justify-between gap-3 border-t border-slate-50 px-4 py-2.5 sm:px-5 dark:border-slate-800/50">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-sm text-slate-800 dark:text-slate-200">
                        Leasing / KFZ
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:bg-slate-800">
                          via Leasing-Panel
                        </span>
                      </div>
                      <div className="truncate text-xs text-slate-400">
                        Rate {formatEur(s.leasing.rate)} + Wartung {formatEur(s.leasing.wartung)} + Vers.{' '}
                        {formatEur(s.leasing.versicherung)}
                      </div>
                    </div>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatEur(s.leasing.rate + s.leasing.wartung + s.leasing.versicherung)}
                    </span>
                  </div>
                )}
                {editMode && (
                  <div className="px-4 py-2.5 sm:px-5">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        addExpense(s.id, {
                          name: 'Neuer Eintrag',
                          amount: 0,
                          note: '',
                          category: cat.key,
                        })
                      }
                    >
                      + Kostenträger hinzufügen
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        )
      })}

      <div className="grid gap-5 lg:grid-cols-2">
        <IncomePanel scenarioId={s.id} />
        <LeasingPanel scenarioId={s.id} />
      </div>

      <Card>
        <div className="flex items-center justify-between text-lg">
          <span className="font-bold">Rest (Einkünfte − Belastung)</span>
          <Money value={rest(s)} className="text-xl font-bold" />
        </div>
        <div className="mt-1 flex items-center justify-between text-sm text-slate-400">
          <span>Einkünfte {formatEur(totalIncome(s.income))}</span>
          <span>Belastung {formatEur(totalExpenses(s))}</span>
        </div>
      </Card>
    </div>
  )
}

function ExpenseRow({
  scenarioId,
  expense,
  editMode,
}: {
  scenarioId: string
  expense: Expense
  editMode: boolean
}) {
  const updateExpense = useStore((st) => st.updateExpense)
  const deleteExpense = useStore((st) => st.deleteExpense)
  const moveCategory = (category: CategoryKey) =>
    updateExpense(scenarioId, { ...expense, category })

  if (!editMode) {
    return (
      <div className="flex items-center justify-between gap-3 border-t border-slate-50 px-4 py-2.5 first:border-t-0 sm:px-5 dark:border-slate-800/50">
        <div className="min-w-0">
          <div className="truncate text-sm text-slate-800 dark:text-slate-200">{expense.name}</div>
          {expense.note && <div className="truncate text-xs text-slate-400">{expense.note}</div>}
        </div>
        <span className="shrink-0 font-medium tabular-nums">{formatEur(expense.amount)}</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-2 border-t border-slate-50 px-4 py-2.5 first:border-t-0 sm:grid-cols-[2fr_1.5fr_7rem_auto] sm:items-center sm:px-5 dark:border-slate-800/50">
      <TextField value={expense.name} onCommit={(name) => updateExpense(scenarioId, { ...expense, name })} />
      <TextField
        value={expense.note}
        placeholder="Notiz"
        onCommit={(note) => updateExpense(scenarioId, { ...expense, note })}
        className="col-span-1 sm:col-auto"
      />
      <NumberField value={expense.amount} onCommit={(amount) => updateExpense(scenarioId, { ...expense, amount })} />
      <div className="col-span-2 flex items-center justify-between gap-2 sm:col-auto">
        <select
          value={expense.category}
          onChange={(e) => moveCategory(e.target.value as CategoryKey)}
          className="rounded-lg border border-slate-300 bg-white px-1.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:hidden"
        >
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <Button variant="danger" onClick={() => deleteExpense(scenarioId, expense.id)} title="Löschen">
          ✕
        </Button>
      </div>
    </div>
  )
}

function LeasingPanel({ scenarioId }: { scenarioId: string }) {
  const s = useStore((st) => st.scenarios.find((x) => x.id === scenarioId))!
  const editMode = useStore((st) => st.editMode)
  const updateLeasing = useStore((st) => st.updateLeasing)
  const l = s.leasing
  const totalKfz = l.rate + l.wartung + l.versicherung

  if (!l.enabled && !editMode) return null

  const rows: { key: keyof typeof l; label: string }[] = [
    { key: 'rate', label: 'Leasingrate' },
    { key: 'wartung', label: 'Wartung' },
    { key: 'versicherung', label: 'Leasing-Versicherung' },
    { key: 'restwert', label: 'Restwert' },
  ]

  return (
    <Card
      title="Leasing / KFZ"
      action={
        editMode && (
          <Button
            variant={l.enabled ? 'subtle' : 'primary'}
            onClick={() => updateLeasing(scenarioId, { ...l, enabled: !l.enabled })}
          >
            {l.enabled ? 'Deaktivieren' : 'Aktivieren'}
          </Button>
        )
      }
    >
      {!l.enabled ? (
        <p className="text-sm text-slate-400">Kein Leasing in diesem Szenario.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-300">{r.label}</span>
              {editMode ? (
                <div className="w-36">
                  <NumberField
                    value={l[r.key] as number}
                    onCommit={(v) => updateLeasing(scenarioId, { ...l, [r.key]: v })}
                  />
                </div>
              ) : (
                <span className="font-medium tabular-nums">{formatEur(l[r.key] as number)}</span>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-bold dark:border-slate-800">
            <span>KFZ-Kosten / Monat</span>
            <span className="tabular-nums">{formatEur(totalKfz)}</span>
          </div>
        </div>
      )}
    </Card>
  )
}

function IncomePanel({ scenarioId }: { scenarioId: string }) {
  const s = useStore((st) => st.scenarios.find((x) => x.id === scenarioId))!
  const editMode = useStore((st) => st.editMode)
  const updateIncome = useStore((st) => st.updateIncome)
  const updateScenarioMeta = useStore((st) => st.updateScenarioMeta)
  const { income } = s

  const rows: { key: keyof typeof income; label: string }[] = [
    { key: 'haupteinkommen', label: 'Haupteinkommen' },
    { key: 'sonstiges', label: 'Sonstiges / Minijob' },
    { key: 'pvEinspeisung', label: 'PV-Einspeisung' },
  ]

  return (
    <Card title="Einkünfte">
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-300">{r.label}</span>
            {editMode ? (
              <div className="w-36">
                <NumberField
                  value={income[r.key]}
                  onCommit={(v) => updateIncome(scenarioId, { ...income, [r.key]: v })}
                />
              </div>
            ) : (
              <span className="font-medium tabular-nums">{formatEur(income[r.key])}</span>
            )}
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-bold dark:border-slate-800">
          <span>Summe Einkünfte</span>
          <span className="tabular-nums">{formatEur(totalIncome(income))}</span>
        </div>
      </div>

      {editMode && (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <label className="text-sm">
            <span className="text-slate-500">Kontostand</span>
            <NumberField
              value={s.kontostand}
              onCommit={(v) => updateScenarioMeta(scenarioId, { kontostand: v })}
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Kaution</span>
            <NumberField
              value={s.kaution}
              onCommit={(v) => updateScenarioMeta(scenarioId, { kaution: v })}
            />
          </label>
        </div>
      )}
    </Card>
  )
}
