import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../constants/orderLabels'
import { inputClass } from './AuthShell'
import {
  DEFAULT_ORDERS_LIST_FILTERS,
  isOrdersListFiltersDefault,
  type OrdersListFilters,
} from '../lib/orderListFilters'
import type { OrderStatus, PaymentStatus } from '../types/order'

type OrdersListFiltersBarProps = {
  filters: OrdersListFilters
  onChange: (filters: OrdersListFilters) => void
}

const labelClass = 'text-sm font-medium text-slate-700'

export function OrdersListFiltersBar({
  filters,
  onChange,
}: OrdersListFiltersBarProps) {
  function patch(partial: Partial<OrdersListFilters>) {
    onChange({ ...filters, ...partial })
  }

  const hasActive = !isOrdersListFiltersDefault(filters)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">Фільтри</p>
        {hasActive && (
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_ORDERS_LIST_FILTERS })}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Скинути фільтри
          </button>
        )}
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className={labelClass}>Статус заявки</span>
          <select
            className={`${inputClass} mt-1`}
            value={filters.status}
            onChange={(e) =>
              patch({ status: e.target.value as OrderStatus | 'all' })
            }
          >
            <option value="all">Усі</option>
            {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((key) => (
              <option key={key} value={key}>
                {ORDER_STATUS_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Оплата</span>
          <select
            className={`${inputClass} mt-1`}
            value={filters.paymentStatus}
            onChange={(e) =>
              patch({
                paymentStatus: e.target.value as PaymentStatus | 'all',
              })
            }
          >
            <option value="all">Усі</option>
            {(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map(
              (key) => (
                <option key={key} value={key}>
                  {PAYMENT_STATUS_LABELS[key]}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Монтаж</span>
          <select
            className={`${inputClass} mt-1`}
            value={filters.installation}
            onChange={(e) =>
              patch({
                installation: e.target.value as OrdersListFilters['installation'],
              })
            }
          >
            <option value="all">Усі дати</option>
            <option value="today">Сьогодні</option>
            <option value="tomorrow">Завтра</option>
            <option value="with_date">З датою монтажу</option>
            <option value="without_date">Без дати монтажу</option>
          </select>
        </label>
      </div>
    </div>
  )
}
