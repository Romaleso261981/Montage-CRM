import { type FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { OrderFormEditor } from '../components/OrderFormEditor'
import { useAuth } from '../context/useAuth'
import { getFirestoreErrorMessage } from '../lib/firestoreErrors'
import {
  orderToFormValues,
  parseOrderForm,
  type OrderFormValues,
} from '../lib/orderFormHelpers'
import { getOrderById, updateOrder, deleteOrder } from '../services/ordersService'
import type { Order } from '../types/order'
import { deleteField } from 'firebase/firestore'

const emptyForm: OrderFormValues = {
  clientName: '',
  phone: '',
  address: '',
  acUnitPrice: '',
  installationPrice: '',
  dismantlingPrice: '',
  refillPrice: '',
  repairPrice: '',
  drainCleaningPrice: '',
  acCleaningPrice: '',
  salePrice: '',
  isMySale: false,
  brandSelection: '',
  customBrand: '',
  modelSelection: '',
  customModel: '',
  productUrl: '',
  retailPrice: '',
  wholesalePrice: '',
  supplierName: '',
  supplierPaidInUsd: true,
  supplierPaidAmountUsd: '',
  supplierUsdExchangeRate: '',
  supplierPaidAmount: '',
  supplierPurchaseDate: '',
  status: 'new',
  paymentStatus: 'unpaid',
  installationDate: '',
  installationTime: '',
  installerName: '',
  comment: '',
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { appUser } = useAuth()
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [values, setValues] = useState<OrderFormValues>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!orderId || !appUser?.organizationId) return
    setLoading(true)
    void getOrderById(orderId)
      .then((doc) => {
        if (!doc || doc.organizationId !== appUser.organizationId) {
          setNotFound(true)
          return
        }
        setOrder(doc)
        setValues(orderToFormValues(doc))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [orderId, appUser?.organizationId])

  function patchForm(patch: Partial<OrderFormValues>) {
    setValues((prev) => ({ ...prev, ...patch }))
    setSaved(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!orderId || !order) return

    const parsed = parseOrderForm(values)
    if (!parsed.ok) {
      setError(parsed.error)
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      const { saleDetails, isMySale, ...rest } = parsed.data
      await updateOrder(orderId, {
        ...rest,
        isMySale,
        ...(isMySale && saleDetails
          ? { saleDetails }
          : { saleDetails: deleteField() }),
      })
      setSaved(true)
      navigate('/orders')
    } catch (err) {
      setError(getFirestoreErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!orderId) return
    setError(null)
    setDeleting(true)
    try {
      await deleteOrder(orderId)
      navigate('/orders')
    } catch (err) {
      setError(getFirestoreErrorMessage(err))
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  if (!orderId) {
    return <Navigate to="/orders" replace />
  }

  if (loading) {
    return <p className="text-slate-500">Завантаження заявки…</p>
  }

  if (notFound || !order) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600">Заявку не знайдено або немає доступу.</p>
        <Link to="/orders" className="text-sm font-medium text-slate-900 underline">
          Назад до списку
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Заявка</h1>
          <p className="mt-1 text-sm text-slate-500">ID: {order.id}</p>
        </div>
        <Link to="/orders" className="text-sm text-slate-600 hover:text-slate-900">
          Назад до списку
        </Link>
      </div>

      {saved && (
        <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
          Зміни збережено.
        </p>
      )}

      <OrderFormEditor
        values={values}
        onChange={patchForm}
        error={error}
        submitting={submitting}
        submitLabel="Зберегти зміни"
        onSubmit={handleSubmit}
      />

      <section className="rounded-xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="text-sm font-semibold text-red-900">Небезпечна зона</h2>
        <p className="mt-1 text-sm text-red-800">
          Видалення заявки безповоротне. Дані клієнта та суми будуть втрачені.
        </p>
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Видалити заявку
          </button>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-red-900">
              Видалити заявку «{order.clientName}»?
            </p>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void handleDelete()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Видалення…' : 'Так, видалити'}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Скасувати
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
