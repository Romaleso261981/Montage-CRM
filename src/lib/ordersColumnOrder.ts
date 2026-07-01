import type { OrdersSortKey, SortDirection } from './ordersTableSort'
import {
  DEFAULT_ORDERS_LIST_FILTERS,
  normalizeOrdersListFilters,
  type OrdersListFilters,
} from './orderListFilters'

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
const LEGACY_COLUMNS_STORAGE_KEY = 'montage-crm-orders-table-columns'
const VIEW_STORAGE_KEY = 'montage-crm-orders-table-view'

export type OrdersTableViewSettings = {
  order: OrdersSortKey[]
  hidden: OrdersSortKey[]
  sortKey: OrdersSortKey
  sortDir: SortDirection
  page: number
  filters: OrdersListFilters
}

export const DEFAULT_ORDERS_TABLE_VIEW: OrdersTableViewSettings = {
  order: [...DEFAULT_ORDERS_COLUMN_ORDER],
  hidden: [],
  sortKey: 'installation',
  sortDir: 'asc',
  page: 1,
  filters: { ...DEFAULT_ORDERS_LIST_FILTERS },
}

/** @deprecated use OrdersTableViewSettings */
export type OrdersTableColumnsSettings = Pick<
  OrdersTableViewSettings,
  'order' | 'hidden'
>

function isOrdersSortKey(value: unknown): value is OrdersSortKey {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(ORDERS_COLUMN_LABELS, value)
  )
}

function isSortDirection(value: unknown): value is SortDirection {
  return value === 'asc' || value === 'desc'
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

function columnsFromPartial(
  order: OrdersSortKey[],
  hidden: OrdersSortKey[],
): Pick<OrdersTableViewSettings, 'order' | 'hidden'> {
  return { order, hidden }
}

function loadLegacyOrderOnly(): OrdersSortKey[] | null {
  try {
    const raw = localStorage.getItem(LEGACY_ORDER_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isValidOrder(parsed) ? parsed : null
  } catch {
    return null
  }
}

function loadLegacyColumnsSettings(): Pick<
  OrdersTableViewSettings,
  'order' | 'hidden'
> | null {
  try {
    const raw = localStorage.getItem(LEGACY_COLUMNS_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === 'object' &&
      'order' in parsed &&
      'hidden' in parsed &&
      isValidOrder((parsed as OrdersTableColumnsSettings).order) &&
      isValidHidden((parsed as OrdersTableColumnsSettings).hidden)
    ) {
      return columnsFromPartial(
        (parsed as OrdersTableColumnsSettings).order,
        (parsed as OrdersTableColumnsSettings).hidden,
      )
    }
  } catch {
    // ignore
  }
  return null
}

function normalizeViewSettings(
  partial: Partial<OrdersTableViewSettings>,
): OrdersTableViewSettings {
  const order = isValidOrder(partial.order)
    ? partial.order
    : DEFAULT_ORDERS_TABLE_VIEW.order
  const hidden = isValidHidden(partial.hidden)
    ? partial.hidden
    : DEFAULT_ORDERS_TABLE_VIEW.hidden
  const sortKey = isOrdersSortKey(partial.sortKey)
    ? partial.sortKey
    : DEFAULT_ORDERS_TABLE_VIEW.sortKey
  const sortDir = isSortDirection(partial.sortDir)
    ? partial.sortDir
    : DEFAULT_ORDERS_TABLE_VIEW.sortDir
  const page =
    typeof partial.page === 'number' &&
    Number.isFinite(partial.page) &&
    partial.page >= 1
      ? Math.floor(partial.page)
      : DEFAULT_ORDERS_TABLE_VIEW.page
  const filters = normalizeOrdersListFilters(
    partial.filters as Partial<OrdersListFilters> | undefined,
  )

  return { order, hidden, sortKey, sortDir, page, filters }
}

export function loadOrdersTableViewSettings(): OrdersTableViewSettings {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        return normalizeViewSettings(parsed as Partial<OrdersTableViewSettings>)
      }
    }
  } catch {
    // fall through
  }

  const legacyColumns = loadLegacyColumnsSettings()
  if (legacyColumns) {
    return normalizeViewSettings(legacyColumns)
  }

  const legacyOrder = loadLegacyOrderOnly()
  if (legacyOrder) {
    return normalizeViewSettings({ order: legacyOrder })
  }

  return { ...DEFAULT_ORDERS_TABLE_VIEW }
}

export function saveOrdersTableViewSettings(
  settings: OrdersTableViewSettings,
): void {
  const normalized = normalizeViewSettings(settings)
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(normalized))
    localStorage.removeItem(LEGACY_ORDER_STORAGE_KEY)
    localStorage.removeItem(LEGACY_COLUMNS_STORAGE_KEY)
  } catch {
    // ignore
  }
}

/** @deprecated */
export function loadOrdersTableColumnsSettings(): OrdersTableColumnsSettings {
  const { order, hidden } = loadOrdersTableViewSettings()
  return { order, hidden }
}

/** @deprecated */
export function saveOrdersTableColumnsSettings(
  settings: OrdersTableColumnsSettings,
): void {
  const current = loadOrdersTableViewSettings()
  saveOrdersTableViewSettings({ ...current, ...settings })
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
  settings: Pick<OrdersTableViewSettings, 'order' | 'hidden'>,
): OrdersSortKey[] {
  const hidden = new Set(settings.hidden)
  return settings.order.filter((key) => !hidden.has(key))
}

export function countVisibleColumns(
  settings: Pick<OrdersTableViewSettings, 'hidden'>,
): number {
  return DEFAULT_ORDERS_COLUMN_ORDER.length - new Set(settings.hidden).size
}

export function setColumnVisible(
  settings: OrdersTableViewSettings,
  key: OrdersSortKey,
  visible: boolean,
): OrdersTableViewSettings {
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
  settings: Pick<OrdersTableViewSettings, 'hidden'>,
  key: OrdersSortKey,
): boolean {
  return !settings.hidden.includes(key)
}

export function clampPage(page: number, totalPages: number): number {
  const max = Math.max(1, totalPages)
  return Math.min(Math.max(1, page), max)
}
