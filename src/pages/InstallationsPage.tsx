import { useEffect, useState } from 'react'
import { ORDER_STATUS_LABELS } from '../constants/orderLabels'
import { useAuth } from '../context/AuthContext'
import { getInstallationsByOrganizationId } from '../services/ordersService'
import type { Order } from '../types/order'

export function InstallationsPage() {
  const { appUser } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!appUser?.organizationId) return
    void getInstallationsByOrganizationId(appUser.organizationId)
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [appUser?.organizationId])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Монтажі</h1>
      <p className="text-sm text-slate-500">
        Заявки з датою монтажу у вашій організації (
        <code className="rounded bg-slate-100 px-1">organizationId</code>).
      </p>

      {loading && <p className="text-slate-500">Завантаження…</p>}

      {!loading && orders.length === 0 && (
        <p className="text-slate-500">Запланованих монтажів немає.</p>
      )}

      {!loading && orders.length > 0 && (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{order.clientName}</p>
                  <p className="text-sm text-slate-500">{order.address}</p>
                </div>
                <span className="text-sm text-slate-600">
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <p className="mt-2 text-sm">
                {order.installationDate}
                {order.installationTime ? ` · ${order.installationTime}` : ''}
              </p>
              {order.installerName && (
                <p className="text-sm text-slate-500">
                  Монтажник: {order.installerName}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
