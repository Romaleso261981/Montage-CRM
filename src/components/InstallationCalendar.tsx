import { useMemo, useState } from 'react'
import { InstallationCalendarDayChip } from './InstallationCalendarDayChip'
import { InstallationDayDetailsPanel } from './InstallationDayDetailsPanel'
import { InstallationDayModal } from './InstallationDayModal'
import {
  buildInstallationMap,
  formatMonthYearUk,
  getMonthCalendarCells,
  installationCalendarTone,
  localDateKey,
} from '../lib/installationCalendar'
import type { Order } from '../types/order'

const WEEKDAYS_UK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const MAX_CHIPS_PER_DAY = 3
const MOBILE_MAX_WIDTH = '(max-width: 767px)'

function installationCountLabel(count: number): string {
  if (count === 1) return '1 монт.'
  if (count >= 2 && count <= 4) return `${count} монт.`
  return `${count} монт.`
}

type InstallationCalendarProps = {
  orders: Order[]
}

export function InstallationCalendar({ orders }: InstallationCalendarProps) {
  const today = useMemo(() => new Date(), [])
  const todayKey = localDateKey(today)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedKey, setSelectedKey] = useState<string | null>(todayKey)
  const [dayModalOpen, setDayModalOpen] = useState(false)

  function handleDayClick(dateKey: string) {
    setSelectedKey(dateKey)
    if (window.matchMedia(MOBILE_MAX_WIDTH).matches) {
      setDayModalOpen(true)
    }
  }

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
          const dayOrders = stats?.orders ?? []
          const visibleOrders = dayOrders.slice(0, MAX_CHIPS_PER_DAY)
          const hiddenCount = dayOrders.length - visibleOrders.length
          const isToday = cell.dateKey === todayKey
          const isSelected = cell.dateKey === selectedKey
          const hasInstalls = dayOrders.length > 0

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => handleDayClick(cell.dateKey)}
              className={`flex min-h-[3.25rem] flex-col rounded-lg border p-1 text-left transition-colors ${
                hasInstalls ? 'md:min-h-[7.5rem]' : ''
              } ${
                cell.inCurrentMonth ? 'bg-white' : 'bg-slate-50/80 text-slate-400'
              } ${isSelected ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300'} ${
                isToday && !isSelected ? 'border-slate-400' : ''
              }`}
            >
              <span
                className={`shrink-0 text-xs font-semibold ${
                  cell.inCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {cell.date.getDate()}
              </span>
              {hasInstalls && (
                <>
                  <div className="mt-0.5 hidden min-h-0 flex-1 flex-col gap-0.5 overflow-hidden md:flex">
                    {visibleOrders.map((order) => {
                      const tone = installationCalendarTone(order, todayKey)
                      if (!tone) return null
                      return (
                        <InstallationCalendarDayChip
                          key={order.id}
                          order={order}
                          tone={tone}
                        />
                      )
                    })}
                    {hiddenCount > 0 && (
                      <span className="text-[9px] font-medium text-slate-500">
                        + ще {hiddenCount}
                      </span>
                    )}
                  </div>
                  <span className="mt-auto text-[10px] font-semibold leading-tight text-slate-600 md:hidden">
                    {installationCountLabel(dayOrders.length)}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6 hidden md:block">
        <InstallationDayDetailsPanel
          selectedKey={selectedKey}
          stats={selectedStats}
          todayKey={todayKey}
        />
      </div>

      <InstallationDayModal
        open={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        selectedKey={selectedKey}
        stats={selectedStats}
        todayKey={todayKey}
      />
    </section>
  )
}
