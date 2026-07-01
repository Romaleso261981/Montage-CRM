import type { Order, OrderStatus, PaymentStatus } from '../types/order'

export type OrderInstallationFilter =
  | 'all'
  | 'today'
  | 'tomorrow'
  | 'with_date'
  | 'without_date'

export type OrdersListFilters = {
  status: OrderStatus | 'all'
  paymentStatus: PaymentStatus | 'all'
  installation: OrderInstallationFilter
}

export const DEFAULT_ORDERS_LIST_FILTERS: OrdersListFilters = {
  status: 'all',
  paymentStatus: 'all',
  installation: 'all',
}

const ORDER_STATUSES: OrderStatus[] = [
  'new',
  'confirmed',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
]

const PAYMENT_STATUSES: PaymentStatus[] = ['unpaid', 'partial', 'paid']

const INSTALLATION_FILTERS: OrderInstallationFilter[] = [
  'all',
  'today',
  'tomorrow',
  'with_date',
  'without_date',
]

function parseInstallationLocalDay(isoDate?: string): Date | null {
  const raw = isoDate?.trim()
  if (!raw) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
  if (!match) return null
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  )
  return Number.isNaN(date.getTime()) ? null : date
}

function localDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function normalizeOrdersListFilters(
  partial?: Partial<OrdersListFilters>,
): OrdersListFilters {
  const status =
    partial?.status === 'all' ||
    (partial?.status && ORDER_STATUSES.includes(partial.status))
      ? partial.status
      : DEFAULT_ORDERS_LIST_FILTERS.status
  const paymentStatus =
    partial?.paymentStatus === 'all' ||
    (partial?.paymentStatus &&
      PAYMENT_STATUSES.includes(partial.paymentStatus))
      ? partial.paymentStatus
      : DEFAULT_ORDERS_LIST_FILTERS.paymentStatus
  const installation =
    partial?.installation &&
    INSTALLATION_FILTERS.includes(partial.installation)
      ? partial.installation
      : DEFAULT_ORDERS_LIST_FILTERS.installation
  return { status, paymentStatus, installation }
}

export function isOrdersListFiltersDefault(filters: OrdersListFilters): boolean {
  return (
    filters.status === 'all' &&
    filters.paymentStatus === 'all' &&
    filters.installation === 'all'
  )
}

export function orderMatchesListFilters(
  order: Order,
  filters: OrdersListFilters,
  now: Date = new Date(),
): boolean {
  if (filters.status !== 'all' && order.status !== filters.status) {
    return false
  }
  if (
    filters.paymentStatus !== 'all' &&
    order.paymentStatus !== filters.paymentStatus
  ) {
    return false
  }

  if (filters.installation === 'all') return true

  const install = parseInstallationLocalDay(order.installationDate)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrowStart = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    todayStart.getDate() + 1,
  )

  switch (filters.installation) {
    case 'without_date':
      return install === null
    case 'with_date':
      return install !== null
    case 'today':
      return install !== null && localDateKey(install) === localDateKey(todayStart)
    case 'tomorrow':
      return (
        install !== null && localDateKey(install) === localDateKey(tomorrowStart)
      )
    default:
      return true
  }
}

export function filterOrdersByListFilters(
  orders: Order[],
  filters: OrdersListFilters,
): Order[] {
  if (isOrdersListFiltersDefault(filters)) return orders
  return orders.filter((order) => orderMatchesListFilters(order, filters))
}
