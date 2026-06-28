import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { USER_ROLE_LABELS } from '../constants/userRoles'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
  }`

export function AppLayout() {
  const { organization, appUser, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">Montage CRM</p>
            {organization && (
              <p className="text-sm text-slate-500">{organization.name}</p>
            )}
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              Панель
            </NavLink>
            <NavLink to="/orders" className={navLinkClass}>
              Заявки
            </NavLink>
            <NavLink to="/installations" className={navLinkClass}>
              Монтажі
            </NavLink>
            <NavLink to="/settings/organization" className={navLinkClass}>
              Організація
            </NavLink>
            <NavLink to="/settings/users" className={navLinkClass}>
              Користувачі
            </NavLink>
          </nav>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            {appUser && (
              <span>
                {appUser.displayName ?? appUser.email} ·{' '}
                {USER_ROLE_LABELS[appUser.role]}
              </span>
            )}
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
            >
              Вийти
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
