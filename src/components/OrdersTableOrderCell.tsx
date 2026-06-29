import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../constants/orderLabels'
import { formatMoneyDisplay } from '../lib/moneyFormat'
import {
  formatClientAmountDue,
  formatInstallationSchedule,
  formatOrderCreatedAt,
} from '../lib/orderDisplay'
import type { OrdersSortKey } from '../lib/ordersTableSort'
import type { Order } from '../types/order'

type OrdersTableOrderCellProps = {
  columnKey: OrdersSortKey
  order: Order
}

export function OrdersTableOrderCell({
  columnKey,
  order,
}: OrdersTableOrderCellProps) {
  const created = formatOrderCreatedAt(order)

  switch (columnKey) {
    case 'client':
      return (
        <td className="px-4 py-3">
          <p className="font-medium text-slate-900">{order.clientName}</p>
          <p className="mt-0.5 text-xs leading-snug text-slate-500">
            {order.address?.trim() || '—'}
          </p>
        </td>
      )
    case 'phone':
      return (
        <td className="px-4 py-3 whitespace-nowrap">
          <a
            href={`tel:${order.phone.replace(/\s/g, '')}`}
            className="text-slate-800 underline-offset-2 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {order.phone}
          </a>
        </td>
      )
    case 'created':
      return (
        <td className="px-4 py-3 whitespace-nowrap">
          <p>{created.date}</p>
          {created.time && (
            <p className="mt-0.5 text-xs text-slate-400">{created.time}</p>
          )}
        </td>
      )
    case 'installation':
      return (
        <td className="px-4 py-3">
          <p>{formatInstallationSchedule(order)}</p>
          {order.installerName?.trim() && (
            <p className="mt-0.5 text-xs text-slate-400">
              {order.installerName}
            </p>
          )}
        </td>
      )
    case 'amountDue':
      return (
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
      )
    case 'status':
      return (
        <td className="px-4 py-3 text-slate-600">
          {ORDER_STATUS_LABELS[order.status]}
        </td>
      )
  }
}
