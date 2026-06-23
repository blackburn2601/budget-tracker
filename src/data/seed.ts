import type {
  AppData,
  Asset,
  CategoryKey,
  Expense,
  Income,
  Leasing,
  Scenario,
} from '../types'

// ---------------------------------------------------------------------------
// SAMPLE DATA — entirely fictional (Max Mustermann). No real personal data.
// Replace via the app's edit mode / import, or wire up Supabase.
// ---------------------------------------------------------------------------

// Deterministic id helper for seed data (no randomness → stable across reloads)
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[äàá]/g, 'a')
    .replace(/[öòó]/g, 'o')
    .replace(/[üùú]/g, 'u')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

let counter = 0
const eid = (scenario: string, name: string) =>
  `${scenario}__${slug(name)}__${counter++}`

function exp(
  scenario: string,
  category: CategoryKey,
  name: string,
  amount: number,
  note = '',
): Expense {
  return { id: eid(scenario, name), name, amount, note, category }
}

function asset(
  scenario: string,
  type: Asset['type'],
  name: string,
  current: number,
  monthlyAdd: number,
  countsAsSavings = true,
): Asset {
  return { id: eid(scenario, 'asset-' + name), name, type, current, monthlyAdd, countsAsSavings }
}

const noLeasing: Leasing = {
  enabled: false,
  rate: 0,
  restwert: 0,
  wartung: 0,
  versicherung: 0,
}

const leasingActive: Leasing = {
  enabled: true,
  rate: 380,
  restwert: 1500,
  wartung: 25,
  versicherung: 20,
}

const baseIncome: Income = {
  haupteinkommen: 3200.0,
  sonstiges: 100.0,
  pvEinspeisung: 0,
}

// --- AKTUELL: the canonical, fully-specified sample scenario ---------------
function aktuell(): Scenario {
  const id = 'aktuell'
  return {
    id,
    name: 'AKTUELL',
    order: 0,
    notes: 'Beispiel-Stand ohne Auto. Demo-Daten – jederzeit überschreibbar.',
    kontostand: 3200,
    kaution: 1000,
    leasing: noLeasing,
    income: { ...baseIncome },
    expenses: [
      exp(id, 'fixkosten', 'Streaming-Abo', 12.99),
      exp(id, 'fixkosten', 'Cloud-Speicher', 4.99),
      exp(id, 'fixkosten', 'Fitnessstudio', 29.9),
      exp(id, 'fixkosten', 'Mobilfunk', 19.99),
      exp(id, 'fixkosten', 'Internet / DSL', 39.99),
      exp(id, 'fixkosten', 'Mailhosting', 6.0),
      exp(id, 'fixkosten', 'Kontoführung', 4.9),
      exp(id, 'fixkosten', 'Lebenshaltung', 650.0),
      exp(id, 'versicherungen', 'Hausratversicherung', 12.5),
      exp(id, 'versicherungen', 'Krankenzusatz', 45.0),
      exp(id, 'versicherungen', 'Privathaftpflicht', 5.9),
      exp(id, 'versicherungen', 'BU-Versicherung', 78.0, 'Berufsunfähigkeit'),
      exp(id, 'versicherungen', 'Unfallversicherung', 14.5),
      exp(id, 'kredit_kfz', 'Ratenkredit', 145.0),
      exp(id, 'kredit_kfz', 'PV-Finanzierung', 99.0),
      exp(id, 'immobilien', 'Eigentumswohnung', 210.0),
      exp(id, 'investitionen', 'ETF-Sparplan', 250.0),
      exp(id, 'investitionen', 'Altersvorsorge', 300.0, 'Fondsgebunden'),
      exp(id, 'investitionen', 'Edelmetalle-Sparplan', 75.0),
      exp(id, 'investitionen', 'Tagesgeld-Sparrate', 400.0),
    ],
    assets: [
      asset(id, 'tagesgeld', 'Tagesgeldkonto', 5000, 400),
      asset(id, 'depot', 'ETF-Depot', 18000, 250),
      asset(id, 'depot', 'Broker-Portfolio', 3200, 0),
      asset(id, 'krypto', 'Krypto-Wallet', 1500, 0),
      asset(id, 'krypto', 'Krypto-Börse A', 50, 0),
      asset(id, 'krypto', 'Krypto-Börse B', 30, 0),
      asset(id, 'gold', 'Edelmetalle', 4000, 75),
      asset(id, 'rente', 'Altersvorsorge (Rente)', 9000, 300, false),
    ],
  }
}

// Helper to clone a scenario with a new identity + apply overrides
function derive(
  from: Scenario,
  id: string,
  name: string,
  order: number,
  notes: string,
  mutate: (s: Scenario) => void,
): Scenario {
  const clone: Scenario = {
    ...from,
    id,
    name,
    order,
    notes,
    income: { ...from.income },
    leasing: { ...from.leasing },
    expenses: from.expenses.map((e) => ({ ...e, id: eid(id, e.name) })),
    assets: from.assets.map((a) => ({ ...a, id: eid(id, 'asset-' + a.name) })),
  }
  mutate(clone)
  return clone
}

function setExpense(s: Scenario, name: string, amount: number, note?: string) {
  const e = s.expenses.find((x) => x.name === name)
  if (e) {
    e.amount = amount
    if (note !== undefined) e.note = note
  }
}
function removeExpense(s: Scenario, name: string) {
  s.expenses = s.expenses.filter((x) => x.name !== name)
}
function addExpense(s: Scenario, category: CategoryKey, name: string, amount: number, note = '') {
  s.expenses.push(exp(s.id, category, name, amount, note))
}
function setAsset(s: Scenario, name: string, current?: number, monthlyAdd?: number) {
  const a = s.assets.find((x) => x.name === name)
  if (a) {
    if (current !== undefined) a.current = current
    if (monthlyAdd !== undefined) a.monthlyAdd = monthlyAdd
  }
}

export function buildSeed(): AppData {
  counter = 0
  const a = aktuell()

  // Leasing is tracked via the Leasing panel (s.leasing) and counted under
  // "Kredit / KFZ" automatically — no separate expense line needed.
  const maerz = derive(a, 'maerz-2026', 'Ab März 2026', 1, 'Leasing startet (425 €), Tagesgeld-Sparrate 600 €.', (s) => {
    s.leasing = { ...leasingActive }
    setExpense(s, 'Tagesgeld-Sparrate', 600.0)
    setAsset(s, 'Tagesgeldkonto', 5600, 600)
  })

  const mai = derive(maerz, 'mai-2026', 'Ab Mai 2026', 2, 'Mailhosting 7,50 €, Tagesgeld-Sparrate 600 €.', (s) => {
    setExpense(s, 'Mailhosting', 7.5)
    setExpense(s, 'Tagesgeld-Sparrate', 600.0)
  })

  const leasing = derive(mai, 'leasing', 'LEASING', 3, 'Leasing-Variante mit höherer Rate.', (s) => {
    s.leasing = { ...s.leasing, rate: 400.0 } // 400 + 25 + 20 = 445
  })

  const juli = derive(mai, 'juli-2026', 'Juli 2026', 4, 'Mobilfunk-Tarif 12,99 € + DSL 34,99 € getrennt, Tagesgeld-Sparrate 300 €.', (s) => {
    removeExpense(s, 'Internet / DSL')
    addExpense(s, 'fixkosten', 'Mobilfunk-Tarif', 12.99)
    addExpense(s, 'fixkosten', 'DSL-Anschluss', 34.99)
    setExpense(s, 'Tagesgeld-Sparrate', 300.0)
    setAsset(s, 'Tagesgeldkonto', 6200, 300)
  })

  const auto = derive(mai, 'auto-2026', 'AUTO 2026', 5, 'Eigenes Auto statt Leasing, höhere PV-Rate.', (s) => {
    s.leasing = { ...noLeasing }
    addExpense(s, 'kredit_kfz', 'Autokredit + Kosten', 520.0)
    setExpense(s, 'PV-Finanzierung', 220.0)
    setExpense(s, 'Tagesgeld-Sparrate', 250.0)
    setExpense(s, 'Altersvorsorge', 200.0)
    setAsset(s, 'Tagesgeldkonto', 5250, 250)
    setAsset(s, 'Altersvorsorge (Rente)', 9500, 200)
  })

  const minijob = derive(mai, 'minijob', 'Minijob', 6, 'Höhere KFZ-Rate, zusätzliches Nebeneinkommen, kein Ratenkredit.', (s) => {
    s.leasing = { ...s.leasing, rate: 600.0 } // 600 + 25 + 20 = 645
    removeExpense(s, 'Ratenkredit')
    s.income.sonstiges = 450.0
  })

  const monat = derive(a, 'monat', 'Monat (historisch)', 7, 'Älterer Stand mit anderen Sparbeträgen.', (s) => {
    addExpense(s, 'fixkosten', 'Tool-Abo', 29.9)
    addExpense(s, 'investitionen', 'Bausparvertrag', 50.0)
    setExpense(s, 'ETF-Sparplan', 150.0)
    setExpense(s, 'Altersvorsorge', 200.0)
    setExpense(s, 'Tagesgeld-Sparrate', 300.0)
    setAsset(s, 'ETF-Depot', 16000, 150)
    setAsset(s, 'Edelmetalle', 3500, 75)
    setAsset(s, 'Altersvorsorge (Rente)', 7500, 200)
    setAsset(s, 'Tagesgeldkonto', 4200, 300)
  })

  const scenarios = [a, maerz, mai, leasing, juli, auto, minijob, monat]
  return { scenarios, activeScenarioId: a.id }
}
