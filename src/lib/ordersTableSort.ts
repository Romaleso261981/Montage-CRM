import { clientAmountDue } from './orderDisplay'
import type { Order, OrderStatus } from '../types/order'

export type OrdersSortKey =
  | 'client'
  | 'phone'
  | 'created'
  | 'installation'
  | 'amountDue'
  | 'status'

export type SortDirection = 'asc' | 'desc'

const STATUS_ORDER: OrderStatus[] = [
  'new',
  'confirmed',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
]

function statusRank(status: OrderStatus): number {
  const i = STATUS_ORDER.indexOf(status)
  return i === -1 ? STATUS_ORDER.length : i
}

function createdAtMs(order: Order): number | null {
  const ms = order.createdAt?.toMillis?.()
  return ms != null && !Number.isNaN(ms) ? ms : null
}

function installationDateMs(order: Order): number | null {
  const raw = order.installationDate?.trim()
  if (!raw) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
  if (!match) return null
  const d = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  )
  const ms = d.getTime()
  return Number.isNaN(ms) ? null : ms
}

function compareWithNullsLast(
  a: number | null,
  b: number | null,
  dir: SortDirection,
): number {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return dir === 'asc' ? a - b : b - a
}

function compareStrings(a: string, b: string, dir: SortDirection): number {
  const cmp = a.localeCompare(b, 'uk', { sensitivity: 'base' })
  return dir === 'asc' ? cmp : -cmp
}

export function sortOrders(
  orders: Order[],
  key: OrdersSortKey,
  dir: SortDirection,
): Order[] {
  const list = [...orders]
  list.sort((a, b) => {
    let cmp = 0
    switch (key) {
      case 'client':
        cmp = compareStrings(a.clientName, b.clientName, dir)
        break
      case 'phone':
        cmp = compareStrings(a.phone, b.phone, dir)
        break
      case 'created':
        cmp = compareWithNullsLast(createdAtMs(a), createdAtMs(b), dir)
        break
      case 'installation':
        cmp = compareWithNullsLast(
          installationDateMs(a),
          installationDateMs(b),
          dir,
        )
        break
      case 'amountDue':
        cmp = compareWithNullsLast(
          clientAmountDue(a),
          clientAmountDue(b),
          dir,
        )
        break
      case 'status': {
        const ra = statusRank(a.status)
        const rb = statusRank(b.status)
        cmp = dir === 'asc' ? ra - rb : rb - ra
        break
      }
    }
    if (cmp !== 0) return cmp
    return compareWithNullsLast(createdAtMs(a), createdAtMs(b), 'desc')
  })
  return list
}

export function defaultSortDirectionForKey(key: OrdersSortKey): SortDirection {
  return key === 'created' ? 'desc' : 'asc'
}
