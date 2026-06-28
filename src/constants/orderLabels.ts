import type { OrderStatus, PaymentStatus } from '../types/order'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Нова',
  confirmed: 'Підтверджена',
  scheduled: 'Запланована',
  in_progress: 'В роботі',
  completed: 'Завершена',
  cancelled: 'Скасована',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Не оплачено',
  partial: 'Частково',
  paid: 'Оплачено',
}
