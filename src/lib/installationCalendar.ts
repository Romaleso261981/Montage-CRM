import type { Order } from '../types/order'

export type InstallationCalendarTone = 'completed' | 'upcoming' | 'overdue'

export type DayInstallationStats = {
  completed: number
  upcoming: number
  overdue: number
  orders: Order[]
}

export function installationDateKey(order: Order): string | null {
  const raw = order.installationDate?.trim()
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  return raw
}

export function localDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function installationCalendarTone(
  order: Order,
  todayKey: string,
): InstallationCalendarTone | null {
  const key = installationDateKey(order)
  if (!key) return null
  if (order.status === 'cancelled') return null
  if (order.status === 'completed') return 'completed'
  if (key < todayKey) return 'overdue'
  return 'upcoming'
}

export function buildInstallationMap(
  orders: Order[],
  today: Date = new Date(),
): Map<string, DayInstallationStats> {
  const todayKey = localDateKey(today)
  const map = new Map<string, DayInstallationStats>()

  for (const order of orders) {
    const key = installationDateKey(order)
    if (!key) continue
    const tone = installationCalendarTone(order, todayKey)
    if (!tone) continue

    let day = map.get(key)
    if (!day) {
      day = { completed: 0, upcoming: 0, overdue: 0, orders: [] }
      map.set(key, day)
    }
    day.orders.push(order)
    if (tone === 'completed') day.completed += 1
    else if (tone === 'upcoming') day.upcoming += 1
    else day.overdue += 1
  }

  for (const day of map.values()) {
    day.orders.sort((a, b) => {
      const ta = a.installationTime ?? ''
      const tb = b.installationTime ?? ''
      return ta.localeCompare(tb)
    })
  }

  return map
}

export type CalendarCell = {
  date: Date
  dateKey: string
  inCurrentMonth: boolean
}

/** Сітка понеділок → неділя. */
export function getMonthCalendarCells(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - startOffset)

  const cells: CalendarCell[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    cells.push({
      date,
      dateKey: localDateKey(date),
      inCurrentMonth: date.getMonth() === month,
    })
  }
  return cells
}

export function formatMonthYearUk(year: number, month: number): string {
  return new Intl.DateTimeFormat('uk-UA', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1))
}

export function formatDayTitleUk(dateKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  if (!match) return dateKey
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}
