import { useStore } from './store'
import { useAuth } from './lib/auth'
import Sidebar from './components/Sidebar'
import CloudSaveButton from './components/CloudSaveButton'
import Dashboard from './views/Dashboard'
import Expenses from './views/Expenses'
import Wealth from './views/Wealth'
import Compare from './views/Compare'
import Settings from './views/Settings'

export default function App() {
  const activeTab = useStore((st) => st.activeTab)
  const editMode = useStore((st) => st.editMode)
  const darkMode = useStore((st) => st.darkMode)
  const sidebarOpen = useStore((st) => st.sidebarOpen)
  const toggleEdit = useStore((st) => st.toggleEdit)
  const toggleDark = useStore((st) => st.toggleDark)
  const setSidebar = useStore((st) => st.setSidebar)
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar — drawer on mobile, fixed on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </aside>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              onClick={() => setSidebar(true)}
              aria-label="Menü"
            >
              ☰
            </button>
            <CloudSaveButton />
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <button
              onClick={toggleEdit}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                editMode
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {editMode ? '✓ Bearbeiten an' : '✎ Bearbeiten'}
            </button>
            <button
              onClick={toggleDark}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              title="Dark Mode umschalten"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            {user?.email && (
              <span
                className="hidden max-w-[12rem] truncate text-sm text-slate-500 sm:inline"
                title={user.email}
              >
                {user.email}
              </span>
            )}
            <button
              onClick={() => signOut()}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              title="Abmelden"
            >
              ⎋ <span className="hidden sm:inline">Abmelden</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'expenses' && <Expenses />}
          {activeTab === 'wealth' && <Wealth />}
          {activeTab === 'compare' && <Compare />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}
