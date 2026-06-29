import { formatMoneyDisplay } from './moneyFormat'
import type { Order } from '../types/order'

function formatUkDate(date: Date): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatUkTime(date: Date): string {
  return new Intl.DateTimeFormat('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Дата створення заявки (Firestore createdAt). */
export function formatOrderCreatedAt(order: Order): {
  date: string
  time?: string
} {
  const ts = order.createdAt
  if (!ts?.toDate) {
    return { date: '—' }
  }
  const d = ts.toDate()
  if (Number.isNaN(d.getTime())) {
    return { date: '—' }
  }
  return { date: formatUkDate(d), time: formatUkTime(d) }
}

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

  const datePart = formatUkDate(date)

  const time = order.installationTime?.trim()
  return time ? `${datePart}, ${time}` : datePart
}

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

/** Підсвітка рядка заявки в списку. */
export type OrderRowHighlight =
  | 'completed'
  | 'install-today'
  | 'install-tomorrow'

export function getOrderRowHighlight(
  order: Order,
  now: Date = new Date(),
): OrderRowHighlight | null {
  if (order.status === 'completed') return 'completed'

  const install = parseInstallationLocalDay(order.installationDate)
  if (!install) return null

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrowStart = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    todayStart.getDate() + 1,
  )

  const installKey = localDateKey(install)
  if (installKey === localDateKey(todayStart)) return 'install-today'
  if (installKey === localDateKey(tomorrowStart)) return 'install-tomorrow'
  return null
}

export function orderRowHighlightClasses(
  highlight: OrderRowHighlight | null,
): string {
  switch (highlight) {
    case 'completed':
      return 'bg-green-50 hover:bg-green-100'
    case 'install-today':
      return 'bg-red-50 hover:bg-red-100'
    case 'install-tomorrow':
      return 'bg-yellow-50 hover:bg-yellow-100'
    default:
      return 'hover:bg-slate-100'
  }
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
