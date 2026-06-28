import { useEffect, useState } from 'react'
import { USER_ROLE_LABELS } from '../constants/userRoles'
import { useAuth } from '../context/AuthContext'
import { getUsersByOrganizationId } from '../services/usersService'
import type { AppUser } from '../types/user'

function formatDate(user: AppUser): string {
  const ts = user.createdAt
  if (!ts || typeof ts.toDate !== 'function') return '—'
  return ts.toDate().toLocaleDateString('uk-UA')
}

export function UsersSettingsPage() {
  const { appUser } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!appUser?.organizationId) return
    void getUsersByOrganizationId(appUser.organizationId)
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [appUser?.organizationId])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Користувачі організації</h1>
        <p className="mt-1 text-sm text-slate-500">
          Список учасників вашої організації. Запрошення нових користувачів
          буде додано через колекцію{' '}
          <code className="rounded bg-slate-100 px-1">organizationInvites</code>.
        </p>
      </div>

      {loading && <p className="text-slate-500">Завантаження…</p>}

      {!loading && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Імʼя</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Роль</th>
                <th className="px-4 py-3 font-medium">Дата створення</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    {user.displayName ?? '—'}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    {USER_ROLE_LABELS[user.role]}
                  </td>
                  <td className="px-4 py-3">{formatDate(user)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
