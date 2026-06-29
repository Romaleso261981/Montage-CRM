import { formatMoneyDisplay } from './moneyFormat'
import type { Order } from '../types/order'

/** Дата монтажу для списку заявок (uk-UA). */
export function formatInstallationSchedule(order: Order): string {
  const raw = order.installationDate?.trim()
  if (!raw) return '—'

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
  if (!match) return raw

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return raw

  const datePart = new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)

  const time = order.installationTime?.trim()
  return time ? `${datePart}, ${time}` : datePart
}

/** Сума, яку ще потрібно отримати від клієнта (без поля часткової передплати — за статусом). */
export function clientAmountDue(order: Order): number {
  if (order.paymentStatus === 'paid') return 0
  return order.salePrice
}

export function formatClientAmountDue(order: Order): string {
  const due = clientAmountDue(order)
  if (order.paymentStatus === 'paid') {
    return formatMoneyDisplay(0, 'UAH')
  }
  return formatMoneyDisplay(due, 'UAH')
}
