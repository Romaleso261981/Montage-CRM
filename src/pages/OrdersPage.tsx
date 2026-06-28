import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../constants/orderLabels'
import { useAuth } from '../context/useAuth'
import { getOrdersByOrganizationId } from '../services/ordersService'
import { formatSupplierPurchaseCost } from '../lib/orderPricing'
import { formatMoneyDisplay } from '../lib/moneyFormat'
import type { Order } from '../types/order'

export function OrdersPage() {
  const { appUser } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!appUser?.organizationId) return
    void getOrdersByOrganizationId(appUser.organizationId)
      .then(setOrders)
      .catch(() => setError('Не вдалося завантажити заявки'))
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
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Клієнт</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Оплата</th>
                <th className="px-4 py-3 font-medium">Продаж</th>
                <th className="px-4 py-3 font-medium">Сума</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{order.clientName}</td>
                  <td className="px-4 py-3">{order.phone}</td>
                  <td className="px-4 py-3">
                    {ORDER_STATUS_LABELS[order.status]}
                  </td>
                  <td className="px-4 py-3">
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {order.isMySale && order.saleDetails ? (
                      <span
                        title={formatSupplierPurchaseCost(order.saleDetails)}
                      >
                        Моя · {order.saleDetails.acModel}
                        <span className="mt-0.5 block text-xs text-slate-400">
                          {order.saleDetails.supplierName}:{' '}
                          {formatSupplierPurchaseCost(order.saleDetails)}
                        </span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {formatMoneyDisplay(order.salePrice, 'UAH')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
