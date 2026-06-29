import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../constants/orderLabels'
import { useAuth } from '../context/useAuth'
import { getOrdersByOrganizationId } from '../services/ordersService'
import { getFirestoreErrorMessage } from '../lib/firestoreErrors'
import { formatMoneyDisplay } from '../lib/moneyFormat'
import {
  formatClientAmountDue,
  formatInstallationSchedule,
} from '../lib/orderDisplay'
import type { Order } from '../types/order'

export function OrdersPage() {
  const { appUser } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!appUser?.organizationId) return
    void getOrdersByOrganizationId(appUser.organizationId)
      .then(setOrders)
      .catch((err) => setError(getFirestoreErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [appUser?.organizationId])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Заявки</h1>
        <Link
          to="/orders/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Нова заявка
        </Link>
      </div>

      {loading && <p className="text-slate-500">Завантаження…</p>}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <p className="text-slate-500">Заявок у вашій організації ще немає.</p>
      )}

      {!loading && orders.length > 0 && (
        <>
          <p className="text-sm text-slate-500">
            Натисніть на рядок, щоб відкрити та редагувати заявку.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Клієнт</th>
                  <th className="px-4 py-3 font-medium">Телефон</th>
                  <th className="px-4 py-3 font-medium">Монтаж</th>
                  <th className="px-4 py-3 font-medium">До сплати з клієнта</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer hover:bg-slate-100"
                    onClick={() => navigate(`/orders/${order.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/orders/${order.id}`)
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`Заявка ${order.clientName}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {order.clientName}
                      </p>
                      <p className="mt-0.5 text-xs leading-snug text-slate-500">
                        {order.address?.trim() || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a
                        href={`tel:${order.phone.replace(/\s/g, '')}`}
                        className="text-slate-800 underline-offset-2 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {order.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <p>{formatInstallationSchedule(order)}</p>
                      {order.installerName?.trim() && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {order.installerName}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p
                        className={
                          order.paymentStatus === 'paid'
                            ? 'font-medium text-slate-500'
                            : 'font-semibold text-slate-900'
                        }
                      >
                        {order.paymentStatus === 'paid'
                          ? 'Оплачено'
                          : formatClientAmountDue(order)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                        {order.paymentStatus !== 'paid' && (
                          <>
                            {' · '}
                            загалом {formatMoneyDisplay(order.salePrice, 'UAH')}
                          </>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {ORDER_STATUS_LABELS[order.status]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
