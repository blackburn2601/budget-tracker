import { useState } from 'react'
import { useStore } from '../store'
import { rest } from '../lib/calc'
import { formatEur } from '../lib/format'

const NAV: { key: any; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'expenses', label: 'Kostenträger', icon: '🧾' },
  { key: 'wealth', label: 'Vermögen', icon: '💎' },
  { key: 'compare', label: 'Vergleich', icon: '⚖️' },
  { key: 'settings', label: 'Einstellungen', icon: '⚙️' },
]

export default function Sidebar() {
  const scenarios = useStore((st) => st.scenarios)
  const activeScenarioId = useStore((st) => st.activeScenarioId)
  const activeTab = useStore((st) => st.activeTab)
  const userName = useStore((st) => st.userName)
  const setUserName = useStore((st) => st.setUserName)
  const setActiveScenario = useStore((st) => st.setActiveScenario)
  const setTab = useStore((st) => st.setTab)
  const addScenario = useStore((st) => st.addScenario)
  const duplicateScenario = useStore((st) => st.duplicateScenario)
  const renameScenario = useStore((st) => st.renameScenario)
  const deleteScenario = useStore((st) => st.deleteScenario)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)

  const list = [...scenarios].sort((a, b) => a.order - b.order)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg">💰</span>
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-900 dark:text-white">Budget Tracker</div>
          {editingName ? (
            <input
              autoFocus
              defaultValue={userName}
              onBlur={(e) => {
                setUserName(e.target.value.trim() || userName)
                setEditingName(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') setEditingName(false)
              }}
              className="mt-0.5 w-full rounded border border-brand-500 bg-white px-1 py-0.5 text-xs dark:bg-slate-900 dark:text-white"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              title="Name bearbeiten"
              className="group flex items-center gap-1 text-xs text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
            >
              <span className="truncate">{userName || 'Name festlegen'}</span>
              <span className="opacity-0 transition-opacity group-hover:opacity-100">✎</span>
            </button>
          )}
        </div>
      </div>

      <nav className="px-3">
        {NAV.map((n) => (
          <button
            key={n.key}
            onClick={() => setTab(n.key)}
            className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
              activeTab === n.key
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <span>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <div className="mt-5 flex items-center justify-between px-5 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Szenarien
        </span>
        <button
          onClick={() => addScenario('Neues Szenario')}
          className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
          title="Szenario hinzufügen"
        >
          ＋
        </button>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {list.map((s) => {
          const isActive = s.id === activeScenarioId
          const r = rest(s)
          return (
            <div
              key={s.id}
              className={`group rounded-lg ${
                isActive ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {editingId === s.id ? (
                <input
                  autoFocus
                  defaultValue={s.name}
                  onBlur={(e) => {
                    renameScenario(s.id, e.target.value || s.name)
                    setEditingId(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                  }}
                  className="w-full rounded-lg border border-brand-500 bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-white"
                />
              ) : (
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setActiveScenario(s.id)
                      setTab('dashboard')
                    }}
                    className="min-w-0 flex-1 px-3 py-2 text-left"
                  >
                    <div
                      className={`truncate text-sm ${
                        isActive
                          ? 'font-semibold text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {s.name}
                    </div>
                    <div
                      className={`text-xs tabular-nums ${
                        r < 0 ? 'text-red-500' : 'text-slate-400'
                      }`}
                    >
                      Rest {formatEur(r)}
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center pr-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <IconBtn title="Umbenennen" onClick={() => setEditingId(s.id)}>✎</IconBtn>
                    <IconBtn title="Duplizieren" onClick={() => duplicateScenario(s.id)}>⧉</IconBtn>
                    {list.length > 1 && (
                      <IconBtn
                        title="Löschen"
                        danger
                        onClick={() => {
                          if (confirm(`Szenario „${s.name}“ löschen?`)) deleteScenario(s.id)
                        }}
                      >
                        ✕
                      </IconBtn>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  danger?: boolean
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`grid h-6 w-6 place-items-center rounded text-xs ${
        danger
          ? 'text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50'
          : 'text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  )
}
