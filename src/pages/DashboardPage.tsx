import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ORDER_STATUS_LABELS } from '../constants/orderLabels'
import { getOrdersByOrganizationId } from '../services/ordersService'
import type { Order } from '../types/order'

export function DashboardPage() {
  const { appUser } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!appUser?.organizationId) return
    void getOrdersByOrganizationId(appUser.organizationId)
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [appUser?.organizationId])

  const stats = {
    total: orders.length,
    new: orders.filter((o) => o.status === 'new').length,
    scheduled: orders.filter((o) => o.status === 'scheduled').length,
    completed: orders.filter((o) => o.status === 'completed').length,
  }

  const recent = orders.slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Панель керування</h1>
        <Link
          to="/orders/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Нова заявка
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">Завантаження статистики…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Усього заявок', value: stats.total },
              { label: 'Нові', value: stats.new },
              { label: 'Заплановані', value: stats.scheduled },
              { label: 'Завершені', value: stats.completed },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-1 text-3xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-medium">Останні заявки</h2>
            {recent.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">Заявок ще немає</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {recent.map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <span className="font-medium">{order.clientName}</span>
                    <span className="text-slate-500">
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
