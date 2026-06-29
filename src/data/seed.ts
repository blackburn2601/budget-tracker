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
// SAMPLE DATA — entirely fictional (Lena Bauer, Hamburg). No real personal data.
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
  rate: 299,
  restwert: 1800,
  wartung: 22,
  versicherung: 28,
}

const baseIncome: Income = {
  haupteinkommen: 3650,
  sonstiges: 200,
  pvEinspeisung: 0,
}

// --- AKTUELL: the canonical, fully-specified sample scenario ---------------
// Lena Bauer, 32, UX-Designerin bei einem Hamburger Tech-Startup.
// Nettoeinkommen 3.650 € + 200 € Nebeneinkommen (Foto-Aufträge).
// 2-Zimmer-Wohnung in Eimsbüttel, kein Auto.
function aktuell(): Scenario {
  const id = 'aktuell'
  return {
    id,
    name: 'AKTUELL',
    order: 0,
    notes: 'Lena Bauer – UX Designerin in Hamburg. Miete, kein Auto. Demo-Daten – jederzeit überschreibbar.',
    kontostand: 3650,
    kaution: 2670,
    leasing: noLeasing,
    income: { ...baseIncome },
    expenses: [
      exp(id, 'fixkosten', 'Kaltmiete', 890.00),
      exp(id, 'fixkosten', 'Nebenkosten', 175.00),
      exp(id, 'fixkosten', 'Netflix', 15.99),
      exp(id, 'fixkosten', 'Spotify', 9.99),
      exp(id, 'fixkosten', 'iCloud-Speicher', 2.99),
      exp(id, 'fixkosten', 'Mobilfunk', 22.99),
      exp(id, 'fixkosten', 'Internet / DSL', 44.99),
      exp(id, 'fixkosten', 'Fitnessstudio', 24.90),
      exp(id, 'fixkosten', 'Lebenshaltung', 480.00),
      exp(id, 'fixkosten', 'Freizeit & Ausgehen', 220.00),
      exp(id, 'fixkosten', 'Urlaub-Rücklage', 120.00),
      exp(id, 'versicherungen', 'Hausratversicherung', 8.90),
      exp(id, 'versicherungen', 'Privathaftpflicht', 7.50),
      exp(id, 'versicherungen', 'Zahnzusatz', 21.90),
      exp(id, 'versicherungen', 'BU-Versicherung', 89.00, 'Berufsunfähigkeit'),
      exp(id, 'versicherungen', 'Rechtsschutz', 13.80),
      exp(id, 'kredit_kfz', 'Studienkredit', 135.00, 'BAföG-Rückzahlung'),
      exp(id, 'investitionen', 'ETF-Sparplan MSCI World', 200.00),
      exp(id, 'investitionen', 'ETF-Sparplan EM', 75.00, 'Schwellenländer'),
      exp(id, 'investitionen', 'Tagesgeld-Sparrate', 300.00),
      exp(id, 'investitionen', 'Krypto-Sparplan', 25.00),
      exp(id, 'investitionen', 'Betriebliche Altersvorsorge', 80.00, 'bAV über Arbeitgeber'),
    ],
    assets: [
      asset(id, 'tagesgeld', 'Tagesgeldkonto', 7400, 300),
      asset(id, 'depot', 'ETF-Depot MSCI World', 16800, 200),
      asset(id, 'depot', 'ETF-Depot Schwellenländer', 5200, 75),
      asset(id, 'krypto', 'Krypto-Wallet', 1850, 0),
      asset(id, 'rente', 'Betriebliche AV (bAV)', 6900, 80, false),
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
function removeAsset(s: Scenario, name: string) {
  s.assets = s.assets.filter((x) => x.name !== name)
}

export function buildSeed(): AppData {
  counter = 0
  const a = aktuell()

  // Leasing is tracked via the Leasing panel (s.leasing) and counted under
  // "Kredit / KFZ" automatically — no separate expense line needed.
  const oktober = derive(a, 'oktober-2026', 'Ab Oktober 2026', 1, 'Leasing startet (349 €/Mon), Tagesgeld-Sparrate auf 150 € reduziert.', (s) => {
    s.leasing = { ...leasingActive }
    setExpense(s, 'Tagesgeld-Sparrate', 150)
    setAsset(s, 'Tagesgeldkonto', 7650, 150)
  })

  const gehaltserhohung = derive(oktober, 'gehaltserhohung', 'Gehaltserhöhung', 2, 'Gehalt auf 4.200 € netto – mehr in ETF und Tagesgeld.', (s) => {
    s.income.haupteinkommen = 4200
    setExpense(s, 'ETF-Sparplan MSCI World', 300)
    setExpense(s, 'Tagesgeld-Sparrate', 350)
    setAsset(s, 'Tagesgeldkonto', undefined, 350)
    setAsset(s, 'ETF-Depot MSCI World', undefined, 300)
  })

  const leasingPlus = derive(oktober, 'leasing-plus', 'LEASING+', 3, 'Höherwertige Leasing-Option: 379 € Grundrate statt 299 €.', (s) => {
    s.leasing = { ...s.leasing, rate: 379 }
  })

  const etw = derive(gehaltserhohung, 'etw-kauf', 'Eigentumswohnung', 4, 'ETW gekauft – Kaltmiete entfällt, Hausgeld + Darlehen. Depot teilweise für Eigenkapital aufgelöst.', (s) => {
    removeExpense(s, 'Kaltmiete')
    removeExpense(s, 'Nebenkosten')
    removeExpense(s, 'Studienkredit')
    addExpense(s, 'immobilien', 'Hausgeld (ETW)', 290.00)
    addExpense(s, 'kredit_kfz', 'Immobiliendarlehen', 980.00, '20 Jahre, 3,4 % p.a.')
    s.kaution = 0
    setExpense(s, 'Tagesgeld-Sparrate', 200)
    setAsset(s, 'Tagesgeldkonto', 2200, 200)
    setAsset(s, 'ETF-Depot MSCI World', 7500, 300)
    setAsset(s, 'ETF-Depot Schwellenländer', 2800, 75)
  })

  const vollgasSparen = derive(a, 'vollgas-sparen', 'Vollgas Sparen', 5, 'Konsumsparplan: Entertainment gekürzt, alle freien Mittel in Kapitalanlagen.', (s) => {
    setExpense(s, 'Netflix', 9.99)
    setExpense(s, 'Freizeit & Ausgehen', 80)
    setExpense(s, 'Urlaub-Rücklage', 60)
    setExpense(s, 'ETF-Sparplan MSCI World', 350)
    setExpense(s, 'ETF-Sparplan EM', 150)
    setExpense(s, 'Tagesgeld-Sparrate', 500)
    setExpense(s, 'Krypto-Sparplan', 50)
    setAsset(s, 'ETF-Depot MSCI World', undefined, 350)
    setAsset(s, 'ETF-Depot Schwellenländer', undefined, 150)
    setAsset(s, 'Tagesgeldkonto', undefined, 500)
  })

  const elternzeit = derive(a, 'elternzeit', 'Elternzeit', 6, 'Elterngeld (2.100 €) statt Gehalt – alle Sparpläne pausiert, kein Nebeneinkommen.', (s) => {
    s.income.haupteinkommen = 2100
    s.income.sonstiges = 0
    removeExpense(s, 'Fitnessstudio')
    removeExpense(s, 'ETF-Sparplan MSCI World')
    removeExpense(s, 'ETF-Sparplan EM')
    removeExpense(s, 'Tagesgeld-Sparrate')
    removeExpense(s, 'Krypto-Sparplan')
    removeExpense(s, 'Urlaub-Rücklage')
    setExpense(s, 'Freizeit & Ausgehen', 80)
    setAsset(s, 'ETF-Depot MSCI World', undefined, 0)
    setAsset(s, 'ETF-Depot Schwellenländer', undefined, 0)
    setAsset(s, 'Tagesgeldkonto', undefined, 0)
  })

  const historisch = derive(a, 'historisch', 'Historisch', 7, 'Älterer Stand – ETF noch im Aufbau, kein Krypto, Bausparvertrag noch aktiv.', (s) => {
    setExpense(s, 'ETF-Sparplan MSCI World', 100)
    removeExpense(s, 'ETF-Sparplan EM')
    removeExpense(s, 'Krypto-Sparplan')
    addExpense(s, 'investitionen', 'Bausparvertrag', 50.00)
    setExpense(s, 'Tagesgeld-Sparrate', 200)
    setAsset(s, 'ETF-Depot MSCI World', 9200, 100)
    setAsset(s, 'Tagesgeldkonto', 4800, 200)
    setAsset(s, 'Betriebliche AV (bAV)', 3200, 80)
    removeAsset(s, 'ETF-Depot Schwellenländer')
    removeAsset(s, 'Krypto-Wallet')
  })

  const scenarios = [a, oktober, gehaltserhohung, leasingPlus, etw, vollgasSparen, elternzeit, historisch]
  return { scenarios, activeScenarioId: a.id }
}
