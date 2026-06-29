import { useEffect, useRef, useState } from 'react'
import {
  isColumnVisible,
  ORDERS_COLUMN_LABELS,
  setColumnVisible,
  type OrdersTableColumnsSettings,
} from '../lib/ordersColumnOrder'
import type { OrdersSortKey } from '../lib/ordersTableSort'

type OrdersColumnsPickerProps = {
  settings: OrdersTableColumnsSettings
  onChange: (settings: OrdersTableColumnsSettings) => void
}

export function OrdersColumnsPicker({
  settings,
  onChange,
}: OrdersColumnsPickerProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  function toggle(key: OrdersSortKey) {
    const visible = isColumnVisible(settings, key)
    onChange(setColumnVisible(settings, key, !visible))
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Колонки
      </button>
      {open && (
        <div
          className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
          role="menu"
        >
          <p className="mb-2 text-xs font-medium text-slate-500">
            Відображати в таблиці
          </p>
          <ul className="max-h-72 space-y-1 overflow-y-auto">
            {settings.order.map((key) => {
              const checked = isColumnVisible(settings, key)
              const onlyOneLeft =
                checked &&
                settings.order.filter((k) => isColumnVisible(settings, k))
                  .length === 1
              return (
                <li key={key}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-slate-300"
                      checked={checked}
                      disabled={onlyOneLeft}
                      onChange={() => toggle(key)}
                    />
                    <span className="text-sm text-slate-800">
                      {ORDERS_COLUMN_LABELS[key]}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
          <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-400">
            Має залишитись хоча б одна колонка. Порядок — перетягніть ⠿ у
            заголовку.
          </p>
        </div>
      )}
    </div>
  )
}
