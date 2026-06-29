import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { OrdersColumnsPicker } from '../components/OrdersColumnsPicker'
import { OrdersTableOrderCell } from '../components/OrdersTableOrderCell'
import { OrdersTableSortHeader } from '../components/OrdersTableSortHeader'
import { useAuth } from '../context/useAuth'
import { getFirestoreErrorMessage } from '../lib/firestoreErrors'
import {
  getOrderRowHighlight,
  orderRowHighlightClasses,
} from '../lib/orderDisplay'
import {
  clampPage,
  loadOrdersTableViewSettings,
  ORDERS_COLUMN_LABELS,
  reorderOrdersColumns,
  saveOrdersTableViewSettings,
  visibleColumnsFromSettings,
} from '../lib/ordersColumnOrder'
import {
  defaultSortDirectionForKey,
  sortOrders,
  type OrdersSortKey,
} from '../lib/ordersTableSort'
import { getOrdersByOrganizationId } from '../services/ordersService'
import type { Order } from '../types/order'

const PAGE_SIZE = 10

export function OrdersPage() {
  const { appUser } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewSettings, setViewSettings] = useState(loadOrdersTableViewSettings)
  const { sortKey, sortDir, page } = viewSettings
  const visibleColumns = useMemo(
    () => visibleColumnsFromSettings(viewSettings),
    [viewSettings],
  )
  const [draggedColumn, setDraggedColumn] = useState<OrdersSortKey | null>(null)
  const [dropTargetColumn, setDropTargetColumn] =
    useState<OrdersSortKey | null>(null)

  function persistViewSettings(
    update:
      | Partial<typeof viewSettings>
      | ((prev: typeof viewSettings) => typeof viewSettings),
  ) {
    setViewSettings((prev) => {
      const next =
        typeof update === 'function'
          ? update(prev)
          : { ...prev, ...update }
      saveOrdersTableViewSettings(next)
      return next
    })
  }

  function handleSort(key: OrdersSortKey) {
    if (key === sortKey) {
      persistViewSettings({ sortDir: sortDir === 'asc' ? 'desc' : 'asc' })
    } else {
      persistViewSettings({
        sortKey: key,
        sortDir: defaultSortDirectionForKey(key),
        page: 1,
      })
    }
  }

  function handleColumnDrop(targetKey: OrdersSortKey) {
    if (!draggedColumn) return
    persistViewSettings((prev) => ({
      ...prev,
      order: reorderOrdersColumns(prev.order, draggedColumn, targetKey),
    }))
    setDraggedColumn(null)
    setDropTargetColumn(null)
  }

  function goToPage(nextPage: number) {
    persistViewSettings({ page: nextPage })
  }

  const sortedOrders = useMemo(
    () => sortOrders(orders, sortKey, sortDir),
    [orders, sortKey, sortDir],
  )

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / PAGE_SIZE))

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return sortedOrders.slice(start, start + PAGE_SIZE)
  }, [sortedOrders, page])

  useEffect(() => {
    setViewSettings((prev) => {
      const clamped = clampPage(prev.page, totalPages)
      if (clamped === prev.page) return prev
      const next = { ...prev, page: clamped }
      saveOrdersTableViewSettings(next)
      return next
    })
  }, [totalPages])

  useEffect(() => {
    if (!appUser?.organizationId) return
    void getOrdersByOrganizationId(appUser.organizationId)
      .then(setOrders)
      .catch((err) => setError(getFirestoreErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [appUser?.organizationId])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Заявки</h1>
        <div className="flex flex-wrap items-center gap-2">
          {!loading && orders.length > 0 && (
            <OrdersColumnsPicker
              settings={viewSettings}
              onChange={(next) => persistViewSettings(next)}
            />
          )}
          <Link
            to="/orders/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Нова заявка
          </Link>
        </div>
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
        <>
          <p className="text-sm text-slate-500">
            Натисніть на рядок, щоб відкрити заявку. Сортування — по назві
            колонки, порядок колонок — перетягніть іконку ⠿ у заголовку.
            <span className="mt-1 block">
              Кольори: жовтий — монтаж завтра, червоний — сьогодні, зелений —
              завершена. Налаштування таблиці зберігаються у цьому браузері.
            </span>
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th
                    className="w-12 px-3 py-3 text-center font-medium text-slate-600"
                    scope="col"
                  >
                    №
                  </th>
                  {visibleColumns.map((columnKey) => (
                    <OrdersTableSortHeader
                      key={columnKey}
                      label={ORDERS_COLUMN_LABELS[columnKey]}
                      columnKey={columnKey}
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={handleSort}
                      isDragging={draggedColumn === columnKey}
                      isDropTarget={dropTargetColumn === columnKey}
                      onDragStart={setDraggedColumn}
                      onDragEnd={() => {
                        setDraggedColumn(null)
                        setDropTargetColumn(null)
                      }}
                      onDragOver={setDropTargetColumn}
                      onDrop={handleColumnDrop}
                    />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`cursor-pointer ${orderRowHighlightClasses(getOrderRowHighlight(order))}`}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/orders/${order.id}`)
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`Заявка ${order.clientName}`}
                  >
                    <td className="px-3 py-3 text-center text-slate-500 tabular-nums">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>
                    {visibleColumns.map((columnKey) => (
                      <OrdersTableOrderCell
                        key={columnKey}
                        columnKey={columnKey}
                        order={order}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sortedOrders.length > PAGE_SIZE && (
            <nav
              className="flex flex-wrap items-center justify-between gap-3 text-sm"
              aria-label="Сторінки заявок"
            >
              <p className="text-slate-600">
                Показано {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, sortedOrders.length)} з{' '}
                {sortedOrders.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Назад
                </button>
                <span className="text-slate-600">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Далі
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
