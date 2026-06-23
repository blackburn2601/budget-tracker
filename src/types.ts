// ---------------------------------------------------------------------------
// Domain types for the personal budget & wealth tracker
// ---------------------------------------------------------------------------

export type CategoryKey =
  | 'fixkosten'
  | 'versicherungen'
  | 'kredit_kfz'
  | 'immobilien'
  | 'investitionen'

export interface CategoryMeta {
  key: CategoryKey
  label: string
  color: string // hex, used for charts & accents
}

export const CATEGORIES: CategoryMeta[] = [
  { key: 'fixkosten', label: 'Fixkosten / Abonnements', color: '#3478f6' },
  { key: 'versicherungen', label: 'Versicherungen', color: '#f59e0b' },
  { key: 'kredit_kfz', label: 'Kredit / KFZ', color: '#ef4444' },
  { key: 'immobilien', label: 'Immobilien', color: '#8b5cf6' },
  { key: 'investitionen', label: 'Sparen & Investitionen', color: '#10b981' },
]

export function categoryMeta(key: CategoryKey): CategoryMeta {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0]
}

export interface Expense {
  id: string
  name: string
  amount: number
  note: string
  category: CategoryKey
}

export interface Income {
  haupteinkommen: number
  sonstiges: number
  pvEinspeisung: number
}

// Asset classes tracked in the wealth overview (Monatsvoraussicht)
export type AssetType = 'tagesgeld' | 'depot' | 'krypto' | 'gold' | 'rente'

export interface Asset {
  id: string
  name: string
  type: AssetType
  current: number // current value in €
  monthlyAdd: number // monthly contribution in €
  countsAsSavings: boolean // included in Spar-Vermögen subtotal
}

export interface Leasing {
  enabled: boolean
  rate: number
  restwert: number
  wartung: number
  versicherung: number
}

export interface Scenario {
  id: string
  name: string
  order: number
  expenses: Expense[]
  income: Income
  assets: Asset[]
  kontostand: number
  kaution: number
  leasing: Leasing
  notes: string
}

export interface AppData {
  scenarios: Scenario[]
  activeScenarioId: string
}

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  tagesgeld: 'Tagesgeld',
  depot: 'Depot / Fonds',
  krypto: 'Krypto',
  gold: 'Gold',
  rente: 'Rente',
}

export const ASSET_TYPE_COLOR: Record<AssetType, string> = {
  tagesgeld: '#3478f6',
  depot: '#10b981',
  krypto: '#f59e0b',
  gold: '#eab308',
  rente: '#8b5cf6',
}
