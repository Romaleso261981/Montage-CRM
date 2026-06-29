import type { OrdersSortKey } from './ordersTableSort'

export const DEFAULT_ORDERS_COLUMN_ORDER: OrdersSortKey[] = [
  'client',
  'phone',
  'created',
  'installation',
  'amountDue',
  'status',
]

export const ORDERS_COLUMN_LABELS: Record<OrdersSortKey, string> = {
  client: 'Клієнт',
  phone: 'Телефон',
  created: 'Створено',
  installation: 'Монтаж',
  amountDue: 'До сплати з клієнта',
  status: 'Статус',
}

const STORAGE_KEY = 'montage-crm-orders-column-order'

function isOrdersSortKey(value: unknown): value is OrdersSortKey {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(ORDERS_COLUMN_LABELS, value)
  )
}

export function loadOrdersColumnOrder(): OrdersSortKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...DEFAULT_ORDERS_COLUMN_ORDER]
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length !== DEFAULT_ORDERS_COLUMN_ORDER.length) {
      return [...DEFAULT_ORDERS_COLUMN_ORDER]
    }
    if (!parsed.every(isOrdersSortKey)) {
      return [...DEFAULT_ORDERS_COLUMN_ORDER]
    }
    const set = new Set(parsed)
    if (set.size !== DEFAULT_ORDERS_COLUMN_ORDER.length) {
      return [...DEFAULT_ORDERS_COLUMN_ORDER]
    }
    return parsed as OrdersSortKey[]
  } catch {
    return [...DEFAULT_ORDERS_COLUMN_ORDER]
  }
}

export function saveOrdersColumnOrder(order: OrdersSortKey[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  } catch {
    // ignore quota / private mode
  }
}

export function reorderOrdersColumns(
  order: OrdersSortKey[],
  draggedKey: OrdersSortKey,
  targetKey: OrdersSortKey,
): OrdersSortKey[] {
  if (draggedKey === targetKey) return order
  const next = order.filter((k) => k !== draggedKey)
  const targetIndex = next.indexOf(targetKey)
  if (targetIndex === -1) return order
  next.splice(targetIndex, 0, draggedKey)
  return next
}
