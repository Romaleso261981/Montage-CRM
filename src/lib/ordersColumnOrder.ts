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

const LEGACY_ORDER_STORAGE_KEY = 'montage-crm-orders-column-order'
const SETTINGS_STORAGE_KEY = 'montage-crm-orders-table-columns'

export type OrdersTableColumnsSettings = {
  order: OrdersSortKey[]
  hidden: OrdersSortKey[]
}

function isOrdersSortKey(value: unknown): value is OrdersSortKey {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(ORDERS_COLUMN_LABELS, value)
  )
}

function isValidOrder(order: unknown): order is OrdersSortKey[] {
  if (!Array.isArray(order) || order.length !== DEFAULT_ORDERS_COLUMN_ORDER.length) {
    return false
  }
  if (!order.every(isOrdersSortKey)) return false
  return new Set(order).size === DEFAULT_ORDERS_COLUMN_ORDER.length
}

function isValidHidden(hidden: unknown): hidden is OrdersSortKey[] {
  if (!Array.isArray(hidden)) return false
  if (!hidden.every(isOrdersSortKey)) return false
  if (hidden.length >= DEFAULT_ORDERS_COLUMN_ORDER.length) return false
  return true
}

function loadLegacyOrder(): OrdersSortKey[] | null {
  try {
    const raw = localStorage.getItem(LEGACY_ORDER_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isValidOrder(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function loadOrdersTableColumnsSettings(): OrdersTableColumnsSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (
        parsed &&
        typeof parsed === 'object' &&
        'order' in parsed &&
        'hidden' in parsed &&
        isValidOrder((parsed as OrdersTableColumnsSettings).order) &&
        isValidHidden((parsed as OrdersTableColumnsSettings).hidden)
      ) {
        return parsed as OrdersTableColumnsSettings
      }
    }
  } catch {
    // fall through
  }

  const legacyOrder = loadLegacyOrder()
  return {
    order: legacyOrder ?? [...DEFAULT_ORDERS_COLUMN_ORDER],
    hidden: [],
  }
}

export function saveOrdersTableColumnsSettings(
  settings: OrdersTableColumnsSettings,
): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    localStorage.removeItem(LEGACY_ORDER_STORAGE_KEY)
  } catch {
    // ignore
  }
}

/** @deprecated use loadOrdersTableColumnsSettings */
export function loadOrdersColumnOrder(): OrdersSortKey[] {
  return loadOrdersTableColumnsSettings().order
}

/** @deprecated use saveOrdersTableColumnsSettings */
export function saveOrdersColumnOrder(order: OrdersSortKey[]): void {
  const current = loadOrdersTableColumnsSettings()
  saveOrdersTableColumnsSettings({ ...current, order })
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

export function visibleColumnsFromSettings(
  settings: OrdersTableColumnsSettings,
): OrdersSortKey[] {
  const hidden = new Set(settings.hidden)
  return settings.order.filter((key) => !hidden.has(key))
}

export function countVisibleColumns(settings: OrdersTableColumnsSettings): number {
  return DEFAULT_ORDERS_COLUMN_ORDER.length - new Set(settings.hidden).size
}

export function setColumnVisible(
  settings: OrdersTableColumnsSettings,
  key: OrdersSortKey,
  visible: boolean,
): OrdersTableColumnsSettings {
  const hidden = new Set(settings.hidden)
  if (visible) {
    hidden.delete(key)
  } else {
    if (!hidden.has(key) && countVisibleColumns(settings) <= 1) {
      return settings
    }
    hidden.add(key)
  }
  return { ...settings, hidden: [...hidden] }
}

export function isColumnVisible(
  settings: OrdersTableColumnsSettings,
  key: OrdersSortKey,
): boolean {
  return !settings.hidden.includes(key)
}
