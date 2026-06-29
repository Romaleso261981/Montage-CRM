import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { OrdersTableOrderCell } from '../components/OrdersTableOrderCell'
import { OrdersTableSortHeader } from '../components/OrdersTableSortHeader'
import { useAuth } from '../context/useAuth'
import { getFirestoreErrorMessage } from '../lib/firestoreErrors'
import {
  getOrderRowHighlight,
  orderRowHighlightClasses,
} from '../lib/orderDisplay'
import {
  loadOrdersColumnOrder,
  ORDERS_COLUMN_LABELS,
  reorderOrdersColumns,
  saveOrdersColumnOrder,
} from '../lib/ordersColumnOrder'
import {
  defaultSortDirectionForKey,
  sortOrders,
  type OrdersSortKey,
  type SortDirection,
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
  const [sortKey, setSortKey] = useState<OrdersSortKey>('created')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [columnOrder, setColumnOrder] = useState<OrdersSortKey[]>(() =>
    loadOrdersColumnOrder(),
  )
  const [draggedColumn, setDraggedColumn] = useState<OrdersSortKey | null>(null)
  const [dropTargetColumn, setDropTargetColumn] =
    useState<OrdersSortKey | null>(null)
  const [page, setPage] = useState(1)

  function handleSort(key: OrdersSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(defaultSortDirectionForKey(key))
    }
  }

  function handleColumnDrop(targetKey: OrdersSortKey) {
    if (!draggedColumn) return
    setColumnOrder((prev) => {
      const next = reorderOrdersColumns(prev, draggedColumn, targetKey)
      saveOrdersColumnOrder(next)
      return next
    })
    setDraggedColumn(null)
    setDropTargetColumn(null)
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
    setPage((p) => Math.min(Math.max(1, p), totalPages))
  }, [totalPages])

  useEffect(() => {
    setPage(1)
  }, [sortKey, sortDir])

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
        <Link
          to="/orders/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Нова заявка
        </Link>
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
              завершена.
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
                  {columnOrder.map((columnKey) => (
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
                    {columnOrder.map((columnKey) => (
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
                  onClick={() => setPage((p) => p - 1)}
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
                  onClick={() => setPage((p) => p + 1)}
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
