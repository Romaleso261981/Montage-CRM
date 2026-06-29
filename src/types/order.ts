import type { Timestamp } from 'firebase/firestore'

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

/** Дані про продаж кондиціонера (коли увімкнено «Моя продажа»). */
export type OrderSaleDetails = {
  acName: string
  acModel: string
  productUrl?: string
  retailPrice: number
  wholesalePrice: number
  supplierName: string
  /** Скільки заплатили постачальнику в гривнях (фактична собівартість). */
  supplierPaidAmount: number
  /** Оплата постачальнику в USD (якщо платили в доларах). */
  supplierPaidAmountUsd?: number
  /** Курс USD → UAH на момент оплати постачальнику. */
  supplierUsdExchangeRate?: number
  /** Дата закупівлі у постачальника (YYYY-MM-DD). */
  supplierPurchaseDate: string
}

export type Order = {
  id: string
  organizationId: string
  createdBy: string

  clientName: string
  phone: string
  address: string
  /** Вартість кондиціонера для клієнта (₴). */
  acUnitPrice?: number
  /** Вартість встановлення для клієнта (₴). */
  installationPrice?: number
  /** Демонтаж (₴). */
  dismantlingPrice?: number
  /** Заправка (₴). */
  refillPrice?: number
  /** Загальна сума для клієнта в гривнях. */
  salePrice: number

  /** Продаж обладнання через вашу компанію. */
  isMySale: boolean
  saleDetails?: OrderSaleDetails

  status: OrderStatus
  installationDate?: string
  installationTime?: string
  installerId?: string
  installerName?: string

  paymentStatus: PaymentStatus
  comment?: string

  createdAt: Timestamp
  updatedAt: Timestamp
}

export type CreateOrderInput = Omit<
  Order,
  'id' | 'organizationId' | 'createdBy' | 'createdAt' | 'updatedAt'
>

export type UpdateOrderInput = Partial<
  Omit<Order, 'id' | 'organizationId' | 'createdBy' | 'createdAt' | 'updatedAt'>
>
