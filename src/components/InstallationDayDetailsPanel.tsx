import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../constants/orderLabels'
import {
  formatClientAmountDue,
  formatInstallationSchedule,
} from '../lib/orderDisplay'
import { formatMoneyDisplay } from '../lib/moneyFormat'
import {
  formatDayTitleUk,
  installationCalendarTone,
  type DayInstallationStats,
} from '../lib/installationCalendar'
import type { Order } from '../types/order'

type InstallationDayDetailsPanelProps = {
  selectedKey: string | null
  stats: DayInstallationStats | undefined
  todayKey: string
}

function toneBadgeClass(tone: 'completed' | 'upcoming' | 'overdue'): string {
  if (tone === 'completed') return 'bg-green-100 text-green-800'
  if (tone === 'upcoming') return 'bg-sky-100 text-sky-800'
  return 'bg-orange-100 text-orange-900'
}

function toneLabel(tone: 'completed' | 'upcoming' | 'overdue'): string {
  if (tone === 'completed') return 'Встановлено'
  if (tone === 'upcoming') return 'Заплановано'
  return 'Не встановлено'
}

export function InstallationDayDetailsPanel({
  selectedKey,
  stats,
  todayKey,
}: InstallationDayDetailsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedKey || !panelRef.current) return
    panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedKey, stats?.orders.length])

  if (!selectedKey) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        Натисніть на дату в календарі, щоб побачити монтажі.
      </p>
    )
  }

  const title = formatDayTitleUk(selectedKey)
  const count = stats?.orders.length ?? 0

  return (
    <div
      ref={panelRef}
      className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold capitalize text-slate-900">
          Монтажі: {title}
        </h3>
        {count > 0 && (
          <span className="text-sm text-slate-600">
            {count}{' '}
            {count === 1 ? 'заявка' : count < 5 ? 'заявки' : 'заявок'}
          </span>
        )}
      </div>

      {count === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          На цей день монтажів не заплановано.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
              <tr>
                <th className="px-3 py-2.5">Клієнт</th>
                <th className="px-3 py-2.5">Дата монтажу</th>
                <th className="px-3 py-2.5">Час</th>
                <th className="px-3 py-2.5">Телефон</th>
                <th className="px-3 py-2.5">Адреса</th>
                <th className="px-3 py-2.5">Сума</th>
                <th className="px-3 py-2.5">До сплати</th>
                <th className="px-3 py-2.5">Монтажник</th>
                <th className="px-3 py-2.5">Статус</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats!.orders.map((order) => (
                <InstallationDayRow
                  key={order.id}
                  order={order}
                  todayKey={todayKey}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function InstallationDayRow({
  order,
  todayKey,
}: {
  order: Order
  todayKey: string
}) {
  const tone = installationCalendarTone(order, todayKey)
  if (!tone) return null

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-3 py-3 font-medium text-slate-900">
        {order.clientName}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-slate-700">
        {formatInstallationSchedule(order).split(',')[0]}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-slate-700">
        {order.installationTime?.trim() || '—'}
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <a
          href={`tel:${order.phone.replace(/\s/g, '')}`}
          className="text-slate-800 hover:underline"
        >
          {order.phone}
        </a>
      </td>
      <td className="max-w-[12rem] px-3 py-3 text-slate-600">
        {order.address?.trim() || '—'}
      </td>
      <td className="px-3 py-3 whitespace-nowrap font-medium">
        {formatMoneyDisplay(order.salePrice, 'UAH')}
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        {order.paymentStatus === 'paid' ? (
          <span className="text-slate-500">Оплачено</span>
        ) : (
          <span className="font-medium text-slate-900">
            {formatClientAmountDue(order)}
          </span>
        )}
      </td>
      <td className="px-3 py-3 text-slate-600">
        {order.installerName?.trim() || '—'}
      </td>
      <td className="px-3 py-3">
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${toneBadgeClass(tone)}`}
        >
          {toneLabel(tone)}
        </span>
        <span className="mt-1 block text-xs text-slate-500">
          {ORDER_STATUS_LABELS[order.status]} ·{' '}
          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
        </span>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <Link
          to={`/orders/${order.id}`}
          className="text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
        >
          Відкрити
        </Link>
      </td>
    </tr>
  )
}
