import type { Order } from '../types/order'

export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '')
}

function normalizeClientName(name: string): string {
  return name.trim().toLocaleLowerCase('uk-UA')
}

/** Чи відповідає заявка рядку пошуку (імʼя або телефон). */
export function orderMatchesSearch(order: Order, query: string): boolean {
  const q = query.trim()
  if (!q) return true

  const qLower = q.toLocaleLowerCase('uk-UA')
  const name = normalizeClientName(order.clientName)
  if (name.includes(qLower)) return true

  const phone = order.phone ?? ''
  if (phone.toLowerCase().includes(qLower)) return true

  const qDigits = normalizePhoneDigits(q)
  if (qDigits.length > 0) {
    const phoneDigits = normalizePhoneDigits(phone)
    if (phoneDigits.includes(qDigits)) return true
  }

  return false
}

export function filterOrdersBySearch(orders: Order[], query: string): Order[] {
  const q = query.trim()
  if (!q) return orders
  return orders.filter((order) => orderMatchesSearch(order, q))
}
