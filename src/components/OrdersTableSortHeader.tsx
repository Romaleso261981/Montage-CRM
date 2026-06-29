import type { OrdersSortKey, SortDirection } from '../lib/ordersTableSort'

type OrdersTableSortHeaderProps = {
  label: string
  columnKey: OrdersSortKey
  activeKey: OrdersSortKey
  direction: SortDirection
  onSort: (key: OrdersSortKey) => void
  isDropTarget: boolean
  isDragging: boolean
  onDragStart: (key: OrdersSortKey) => void
  onDragEnd: () => void
  onDragOver: (key: OrdersSortKey) => void
  onDrop: (key: OrdersSortKey) => void
}

export function OrdersTableSortHeader({
  label,
  columnKey,
  activeKey,
  direction,
  onSort,
  isDropTarget,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: OrdersTableSortHeaderProps) {
  const active = activeKey === columnKey
  const arrow = active ? (direction === 'asc' ? '↑' : '↓') : null

  return (
    <th
      className={`px-4 py-3 font-medium transition-colors ${
        isDropTarget ? 'bg-slate-200' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
      scope="col"
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver(columnKey)
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop(columnKey)
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', columnKey)
            e.dataTransfer.effectAllowed = 'move'
            onDragStart(columnKey)
          }}
          onDragEnd={onDragEnd}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab touch-none select-none text-slate-400 active:cursor-grabbing hover:text-slate-600"
          title="Перетягніть, щоб змінити порядок колонок"
          aria-label={`Перетягнути колонку ${label}`}
        >
          ⠿
        </span>
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-md py-0.5 pr-1 text-left transition-colors hover:text-slate-900 ${
            active ? 'text-slate-900' : 'text-slate-600'
          }`}
          onClick={() => onSort(columnKey)}
          aria-sort={
            active
              ? direction === 'asc'
                ? 'ascending'
                : 'descending'
              : 'none'
          }
        >
          <span>{label}</span>
          {arrow && (
            <span className="text-base leading-none text-slate-900" aria-hidden>
              {arrow}
            </span>
          )}
        </button>
      </div>
    </th>
  )
}
