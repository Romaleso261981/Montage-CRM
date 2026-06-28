import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FormField, inputClass } from '../components/AuthShell'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../services/ordersService'
import type { OrderStatus, PaymentStatus } from '../types/order'

export function NewOrderPage() {
  const { appUser, firebaseUser } = useAuth()
  const navigate = useNavigate()

  const [clientName, setClientName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [status, setStatus] = useState<OrderStatus>('new')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid')
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!appUser?.organizationId || !firebaseUser) return

    const price = Number(salePrice)
    if (Number.isNaN(price) || price < 0) {
      setError('Вкажіть коректну суму')
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await createOrder(appUser.organizationId, {
        createdBy: firebaseUser.uid,
        clientName: clientName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        salePrice: price,
        status,
        paymentStatus,
        comment: comment.trim() || undefined,
      })
      navigate('/orders')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося створити заявку')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Нова заявка</h1>
        <Link to="/orders" className="text-sm text-slate-600 hover:text-slate-900">
          Назад до списку
        </Link>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <FormField label="Імʼя клієнта *">
          <input
            required
            className={inputClass}
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </FormField>
        <FormField label="Телефон *">
          <input
            required
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </FormField>
        <FormField label="Адреса *">
          <input
            required
            className={inputClass}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </FormField>
        <FormField label="Сума продажу (₴) *">
          <input
            required
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
          />
        </FormField>
        <FormField label="Статус">
          <select
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
          >
            <option value="new">Нова</option>
            <option value="confirmed">Підтверджена</option>
            <option value="scheduled">Запланована</option>
            <option value="in_progress">В роботі</option>
            <option value="completed">Завершена</option>
            <option value="cancelled">Скасована</option>
          </select>
        </FormField>
        <FormField label="Оплата">
          <select
            className={inputClass}
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
          >
            <option value="unpaid">Не оплачено</option>
            <option value="partial">Частково</option>
            <option value="paid">Оплачено</option>
          </select>
        </FormField>
        <FormField label="Коментар">
          <textarea
            className={inputClass}
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </FormField>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? 'Збереження…' : 'Створити заявку'}
        </button>
      </form>
    </div>
  )
}
