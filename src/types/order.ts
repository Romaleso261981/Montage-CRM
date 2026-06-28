import type { Timestamp } from 'firebase/firestore'

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export type Order = {
  id: string
  organizationId: string
  createdBy: string

  clientName: string
  phone: string
  address: string
  salePrice: number

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
