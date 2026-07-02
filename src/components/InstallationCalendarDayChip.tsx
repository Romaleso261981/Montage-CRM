import { formatMoneyDisplay } from '../lib/moneyFormat'
import type { InstallationCalendarTone } from '../lib/installationCalendar'
import type { Order } from '../types/order'

export function installationChipToneClass(
  tone: InstallationCalendarTone,
): string {
  switch (tone) {
    case 'completed':
      return 'border-green-300 bg-green-50 text-green-950'
    case 'upcoming':
      return 'border-sky-300 bg-sky-50 text-sky-950'
    case 'overdue':
      return 'border-orange-300 bg-orange-50 text-orange-950'
  }
}

function shortAddress(address: string): string {
  const t = address.trim()
  if (t.length <= 28) return t
  return `${t.slice(0, 26)}…`
}

function installPriceLabel(order: Order): string | null {
  if (order.installationPrice != null && order.installationPrice > 0) {
    return formatMoneyDisplay(order.installationPrice, 'UAH')
  }
  return null
}

type InstallationCalendarDayChipProps = {
  order: Order
  tone: InstallationCalendarTone
}

export function InstallationCalendarDayChip({
  order,
  tone,
}: InstallationCalendarDayChipProps) {
  const price = installPriceLabel(order)
  const time = order.installationTime?.trim()

  return (
    <div
      className={`rounded border px-1 py-0.5 text-[9px] leading-snug shadow-sm ${installationChipToneClass(tone)}`}
      title={`${order.clientName} — ${order.address}`}
    >
      <p className="truncate font-semibold">{order.clientName}</p>
      <p className="truncate opacity-90">
        {time ? `${time} · ` : ''}
        {shortAddress(order.address || '—')}
      </p>
      {price && <p className="truncate font-medium">{price}</p>}
    </div>
  )
}
