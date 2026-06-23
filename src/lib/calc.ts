import type { Asset, CategoryKey, Income, Scenario } from '../types'
import { CATEGORIES } from '../types'

/** Monthly leasing cost (Rate + Wartung + Versicherung), 0 if disabled.
 *  Restwert is a residual value, not a monthly cost → excluded. */
export function leasingTotal(s: Scenario): number {
  const l = s.leasing
  return l.enabled ? l.rate + l.wartung + l.versicherung : 0
}

/** Sum of all expenses incl. active leasing (= Gesamte Kontobelastung) */
export function totalExpenses(s: Scenario): number {
  return s.expenses.reduce((acc, e) => acc + e.amount, 0) + leasingTotal(s)
}

/** Sum of expenses for one category (Zwischensumme).
 *  Leasing is counted under "Kredit / KFZ". */
export function categoryTotal(s: Scenario, key: CategoryKey): number {
  const base = s.expenses
    .filter((e) => e.category === key)
    .reduce((acc, e) => acc + e.amount, 0)
  return key === 'kredit_kfz' ? base + leasingTotal(s) : base
}

/** Sum of all investment/savings expenses (the "Investitionen" outflow) */
export function totalInvestments(s: Scenario): number {
  return categoryTotal(s, 'investitionen')
}

/** Sparrate: monthly money flowing into Kapitalanlagen.
 *  Immobilien zählen als Kapitalanlage und werden mitgerechnet. */
export function sparrate(s: Scenario): number {
  return categoryTotal(s, 'investitionen') + categoryTotal(s, 'immobilien')
}

/** Sparquote = Sparrate / Einkünfte (Anteil des Einkommens in Kapitalanlagen) */
export function sparquote(s: Scenario): number {
  const inc = totalIncome(s.income)
  return inc > 0 ? sparrate(s) / inc : 0
}

export function totalIncome(income: Income): number {
  return income.haupteinkommen + income.sonstiges + income.pvEinspeisung
}

/** Rest = Einkünfte − Kontobelastung */
export function rest(s: Scenario): number {
  return totalIncome(s.income) - totalExpenses(s)
}

/** Breakdown per category, only categories that have entries */
export function categoryBreakdown(s: Scenario) {
  return CATEGORIES.map((c) => {
    const leasingCount = c.key === 'kredit_kfz' && s.leasing.enabled ? 1 : 0
    return {
      ...c,
      total: categoryTotal(s, c.key),
      count: s.expenses.filter((e) => e.category === c.key).length + leasingCount,
    }
  }).filter((c) => c.count > 0)
}

// --- Wealth ---------------------------------------------------------------

export function assetProjected(a: Asset): number {
  return a.current + a.monthlyAdd
}

/** Spar-Vermögen: current sum of assets flagged as savings */
export function sparVermoegen(assets: Asset[]): number {
  return assets
    .filter((a) => a.countsAsSavings)
    .reduce((acc, a) => acc + a.current, 0)
}

/** Gesamt-Vermögen: current sum of all tracked assets */
export function gesamtVermoegen(assets: Asset[]): number {
  return assets.reduce((acc, a) => acc + a.current, 0)
}

/** Projected total wealth after this month's contributions */
export function gesamtVermoegenProjected(assets: Asset[]): number {
  return assets.reduce((acc, a) => acc + assetProjected(a), 0)
}

export function totalMonthlyContribution(assets: Asset[]): number {
  return assets.reduce((acc, a) => acc + a.monthlyAdd, 0)
}
