import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Asset, Expense, Income, Leasing, Scenario } from './types'
import { buildSeed } from './data/seed'

type TabKey = 'dashboard' | 'expenses' | 'wealth' | 'compare' | 'settings'

interface UIState {
  activeTab: TabKey
  editMode: boolean
  darkMode: boolean
  sidebarOpen: boolean
}

interface State extends UIState {
  scenarios: Scenario[]
  activeScenarioId: string
  userName: string

  // selectors
  active: () => Scenario | undefined

  // ui
  setUserName: (name: string) => void
  setTab: (t: TabKey) => void
  toggleEdit: () => void
  toggleDark: () => void
  setSidebar: (open: boolean) => void

  // scenario management
  setActiveScenario: (id: string) => void
  addScenario: (name: string) => void
  duplicateScenario: (id: string) => void
  renameScenario: (id: string, name: string) => void
  deleteScenario: (id: string) => void

  // expense CRUD
  addExpense: (scenarioId: string, e: Omit<Expense, 'id'>) => void
  updateExpense: (scenarioId: string, e: Expense) => void
  deleteExpense: (scenarioId: string, expenseId: string) => void

  // income / meta
  updateIncome: (scenarioId: string, income: Income) => void
  updateScenarioMeta: (
    scenarioId: string,
    patch: Partial<Pick<Scenario, 'kontostand' | 'kaution' | 'notes'>>,
  ) => void
  updateLeasing: (scenarioId: string, leasing: Leasing) => void

  // asset CRUD
  addAsset: (scenarioId: string, a: Omit<Asset, 'id'>) => void
  updateAsset: (scenarioId: string, a: Asset) => void
  deleteAsset: (scenarioId: string, assetId: string) => void

  // data management
  replaceAll: (scenarios: Scenario[], activeScenarioId?: string) => void
  resetData: () => void
}

const uid = () =>
  `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

function patchScenario(
  scenarios: Scenario[],
  id: string,
  fn: (s: Scenario) => Scenario,
): Scenario[] {
  return scenarios.map((s) => (s.id === id ? fn(s) : s))
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      userName: 'Lena Bauer',
      activeTab: 'dashboard',
      editMode: false,
      darkMode: false,
      sidebarOpen: false,

      active: () => get().scenarios.find((s) => s.id === get().activeScenarioId),

      setUserName: (name) => set({ userName: name }),
      setTab: (t) => set({ activeTab: t, sidebarOpen: false }),
      toggleEdit: () => set((st) => ({ editMode: !st.editMode })),
      toggleDark: () => set((st) => ({ darkMode: !st.darkMode })),
      setSidebar: (open) => set({ sidebarOpen: open }),

      setActiveScenario: (id) => set({ activeScenarioId: id }),

      addScenario: (name) => {
        const id = uid()
        const order =
          Math.max(0, ...get().scenarios.map((s) => s.order)) + 1
        const blank: Scenario = {
          id,
          name: name || 'Neues Szenario',
          order,
          notes: '',
          kontostand: 0,
          kaution: 0,
          leasing: { enabled: false, rate: 0, restwert: 0, wartung: 0, versicherung: 0 },
          income: { haupteinkommen: 0, sonstiges: 0, pvEinspeisung: 0 },
          expenses: [],
          assets: [],
        }
        set((st) => ({ scenarios: [...st.scenarios, blank], activeScenarioId: id }))
      },

      duplicateScenario: (id) => {
        const src = get().scenarios.find((s) => s.id === id)
        if (!src) return
        const newId = uid()
        const order = Math.max(0, ...get().scenarios.map((s) => s.order)) + 1
        const copy: Scenario = {
          ...src,
          id: newId,
          name: `${src.name} (Kopie)`,
          order,
          income: { ...src.income },
          leasing: { ...src.leasing },
          expenses: src.expenses.map((e) => ({ ...e, id: uid() })),
          assets: src.assets.map((a) => ({ ...a, id: uid() })),
        }
        set((st) => ({ scenarios: [...st.scenarios, copy], activeScenarioId: newId }))
      },

      renameScenario: (id, name) =>
        set((st) => ({
          scenarios: patchScenario(st.scenarios, id, (s) => ({ ...s, name })),
        })),

      deleteScenario: (id) =>
        set((st) => {
          if (st.scenarios.length <= 1) return st
          const remaining = st.scenarios.filter((s) => s.id !== id)
          const activeScenarioId =
            st.activeScenarioId === id ? remaining[0].id : st.activeScenarioId
          return { scenarios: remaining, activeScenarioId }
        }),

      addExpense: (scenarioId, e) =>
        set((st) => ({
          scenarios: patchScenario(st.scenarios, scenarioId, (s) => ({
            ...s,
            expenses: [...s.expenses, { ...e, id: uid() }],
          })),
        })),

      updateExpense: (scenarioId, e) =>
        set((st) => ({
          scenarios: patchScenario(st.scenarios, scenarioId, (s) => ({
            ...s,
            expenses: s.expenses.map((x) => (x.id === e.id ? e : x)),
          })),
        })),

      deleteExpense: (scenarioId, expenseId) =>
        set((st) => ({
          scenarios: patchScenario(st.scenarios, scenarioId, (s) => ({
            ...s,
            expenses: s.expenses.filter((x) => x.id !== expenseId),
          })),
        })),

      updateIncome: (scenarioId, income) =>
        set((st) => ({
          scenarios: patchScenario(st.scenarios, scenarioId, (s) => ({ ...s, income })),
        })),

      updateScenarioMeta: (scenarioId, patch) =>
        set((st) => ({
          scenarios: patchScenario(st.scenarios, scenarioId, (s) => ({ ...s, ...patch })),
        })),

      updateLeasing: (scenarioId, leasing) =>
        set((st) => ({
          scenarios: patchScenario(st.scenarios, scenarioId, (s) => ({ ...s, leasing })),
        })),

      addAsset: (scenarioId, a) =>
        set((st) => ({
          scenarios: patchScenario(st.scenarios, scenarioId, (s) => ({
            ...s,
            assets: [...s.assets, { ...a, id: uid() }],
          })),
        })),

      updateAsset: (scenarioId, a) =>
        set((st) => ({
          scenarios: patchScenario(st.scenarios, scenarioId, (s) => ({
            ...s,
            assets: s.assets.map((x) => (x.id === a.id ? a : x)),
          })),
        })),

      deleteAsset: (scenarioId, assetId) =>
        set((st) => ({
          scenarios: patchScenario(st.scenarios, scenarioId, (s) => ({
            ...s,
            assets: s.assets.filter((x) => x.id !== assetId),
          })),
        })),

      replaceAll: (scenarios, activeScenarioId) =>
        set(() => ({
          scenarios,
          activeScenarioId: activeScenarioId ?? scenarios[0]?.id,
        })),

      resetData: () => {
        const seed = buildSeed()
        set({ scenarios: seed.scenarios, activeScenarioId: seed.activeScenarioId })
      },
    }),
    {
      // v4: seed replaced with fictional sample data (no real personal data).
      // Bump forces a clean reseed of any real data cached in localStorage.
      name: 'budget-tracker-v4',
      partialize: (st) => ({
        scenarios: st.scenarios,
        activeScenarioId: st.activeScenarioId,
        userName: st.userName,
        darkMode: st.darkMode,
      }),
    },
  ),
)
