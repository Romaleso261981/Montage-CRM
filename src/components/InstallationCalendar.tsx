import { useMemo, useState } from 'react'
import { InstallationDayDetailsPanel } from './InstallationDayDetailsPanel'
import {
  buildInstallationMap,
  formatMonthYearUk,
  getMonthCalendarCells,
  localDateKey,
} from '../lib/installationCalendar'
import type { Order } from '../types/order'

const WEEKDAYS_UK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

type InstallationCalendarProps = {
  orders: Order[]
}

export function InstallationCalendar({ orders }: InstallationCalendarProps) {
  const today = useMemo(() => new Date(), [])
  const todayKey = localDateKey(today)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedKey, setSelectedKey] = useState<string | null>(todayKey)

  const installationMap = useMemo(
    () => buildInstallationMap(orders, today),
    [orders, today],
  )

  const cells = useMemo(
    () => getMonthCalendarCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  )

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  const selectedStats = selectedKey
    ? installationMap.get(selectedKey)
    : undefined

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-slate-900">Календар монтажів</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
            aria-label="Попередній місяць"
          >
            ←
          </button>
          <span className="min-w-[10rem] text-center text-sm font-medium capitalize">
            {formatMonthYearUk(viewYear, viewMonth)}
          </span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
            aria-label="Наступний місяць"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-green-500" />
          Встановлено (завершено)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-sky-400" />
          Заплановано
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-orange-400" />
          Не встановлено (дата минула)
        </span>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {WEEKDAYS_UK.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const stats = installationMap.get(cell.dateKey)
          const total =
            (stats?.completed ?? 0) +
            (stats?.upcoming ?? 0) +
            (stats?.overdue ?? 0)
          const isToday = cell.dateKey === todayKey
          const isSelected = cell.dateKey === selectedKey

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => setSelectedKey(cell.dateKey)}
              className={`flex min-h-[4.5rem] flex-col rounded-lg border p-1.5 text-left transition-colors ${
                cell.inCurrentMonth ? 'bg-white' : 'bg-slate-50/80 text-slate-400'
              } ${isSelected ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300'} ${
                isToday && !isSelected ? 'border-slate-400' : ''
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  cell.inCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {cell.date.getDate()}
              </span>
              {total > 0 && stats && (
                <div className="mt-auto flex flex-wrap gap-0.5 pt-1">
                  {stats.completed > 0 && (
                    <span
                      className="rounded bg-green-100 px-1 text-[10px] font-semibold text-green-800"
                      title="Встановлено"
                    >
                      {stats.completed}
                    </span>
                  )}
                  {stats.upcoming > 0 && (
                    <span
                      className="rounded bg-sky-100 px-1 text-[10px] font-semibold text-sky-800"
                      title="Заплановано"
                    >
                      {stats.upcoming}
                    </span>
                  )}
                  {stats.overdue > 0 && (
                    <span
                      className="rounded bg-orange-100 px-1 text-[10px] font-semibold text-orange-900"
                      title="Прострочено"
                    >
                      {stats.overdue}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <InstallationDayDetailsPanel
        selectedKey={selectedKey}
        stats={selectedStats}
        todayKey={todayKey}
      />
    </section>
  )
}
