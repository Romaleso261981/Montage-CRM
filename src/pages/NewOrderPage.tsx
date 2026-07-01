import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FormField, inputClass } from '../components/AuthShell'
import {
  AcBrandModelFields,
} from '../components/AcBrandModelFields'
import { useAuth } from '../context/useAuth'
import { MoneyInput } from '../components/MoneyInput'
import { getFirestoreErrorMessage } from '../lib/firestoreErrors'
import { normalizeMoneyInput, parseMoneyInput } from '../lib/moneyFormat'
import {
  applyClientTotalFromValues,
  CLIENT_PAYMENT_FIELDS,
  parseOrderForm,
  type ClientPriceFormKey,
} from '../lib/orderFormHelpers'
import { uahFromUsd } from '../lib/orderPricing'
import { createOrder } from '../services/ordersService'
import type { OrderStatus, PaymentStatus } from '../types/order'

export function NewOrderPage() {
  const { appUser, firebaseUser } = useAuth()
  const navigate = useNavigate()

  const [clientName, setClientName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [acUnitPrice, setAcUnitPrice] = useState('')
  const [installationPrice, setInstallationPrice] = useState('')
  const [dismantlingPrice, setDismantlingPrice] = useState('')
  const [refillPrice, setRefillPrice] = useState('')
  const [repairPrice, setRepairPrice] = useState('')
  const [drainCleaningPrice, setDrainCleaningPrice] = useState('')
  const [acCleaningPrice, setAcCleaningPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [isMySale, setIsMySale] = useState(false)
  const [brandSelection, setBrandSelection] = useState('')
  const [customBrand, setCustomBrand] = useState('')
  const [modelSelection, setModelSelection] = useState('')
  const [customModel, setCustomModel] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [retailPrice, setRetailPrice] = useState('')
  const [wholesalePrice, setWholesalePrice] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [supplierPaidInUsd, setSupplierPaidInUsd] = useState(true)
  const [supplierPaidAmountUsd, setSupplierPaidAmountUsd] = useState('')
  const [supplierUsdExchangeRate, setSupplierUsdExchangeRate] = useState('')
  const [supplierPaidAmount, setSupplierPaidAmount] = useState('')
  const [supplierPurchaseDate, setSupplierPurchaseDate] = useState('')
  const [status, setStatus] = useState<OrderStatus>('new')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid')
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function applySupplierUahFromUsd(usdStr: string, rateStr: string) {
    const usd = parseMoneyInput(usdStr)
    const rate = parseMoneyInput(rateStr)
    if (usd === null || rate === null || rate === 0) return
    setSupplierPaidAmount(normalizeMoneyInput(String(uahFromUsd(usd, rate))))
  }

  const clientPriceState: Record<ClientPriceFormKey, string> = {
    acUnitPrice,
    installationPrice,
    dismantlingPrice,
    refillPrice,
    repairPrice,
    drainCleaningPrice,
    acCleaningPrice,
  }

  const clientPriceSetters: Record<
    ClientPriceFormKey,
    (value: string) => void
  > = {
    acUnitPrice: setAcUnitPrice,
    installationPrice: setInstallationPrice,
    dismantlingPrice: setDismantlingPrice,
    refillPrice: setRefillPrice,
    repairPrice: setRepairPrice,
    drainCleaningPrice: setDrainCleaningPrice,
    acCleaningPrice: setAcCleaningPrice,
  }

  function handleClientPriceChange(key: ClientPriceFormKey, value: string) {
    clientPriceSetters[key](value)
    const next = { ...clientPriceState, [key]: value }
    setSalePrice(applyClientTotalFromValues(next))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!appUser?.organizationId || !firebaseUser) return

    const parsed = parseOrderForm({
      clientName,
      phone,
      address,
      acUnitPrice,
      installationPrice,
      dismantlingPrice,
      refillPrice,
      repairPrice,
      drainCleaningPrice,
      acCleaningPrice,
      salePrice,
      isMySale,
      brandSelection,
      customBrand,
      modelSelection,
      customModel,
      productUrl,
      retailPrice,
      wholesalePrice,
      supplierName,
      supplierPaidInUsd,
      supplierPaidAmountUsd,
      supplierUsdExchangeRate,
      supplierPaidAmount,
      supplierPurchaseDate,
      status,
      paymentStatus,
      installationDate: '',
      installationTime: '',
      installerName: '',
      comment,
    })
    if (!parsed.ok) {
      setError(parsed.error)
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await createOrder(appUser.organizationId, {
        createdBy: firebaseUser.uid,
        ...parsed.data,
      })
      navigate('/orders')
    } catch (err) {
      setError(getFirestoreErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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
        <div className="space-y-4 rounded-lg border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-900">Оплата від клієнта</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {CLIENT_PAYMENT_FIELDS.map(({ key, label }) => (
              <FormField key={key} label={label}>
                <MoneyInput
                  currency="UAH"
                  value={clientPriceState[key]}
                  onChange={(v) => handleClientPriceChange(key, v)}
                />
              </FormField>
            ))}
          </div>
          <FormField label="Загальна сума для клієнта">
            <MoneyInput
              readOnly
              currency="UAH"
              value={salePrice}
              onChange={() => {}}
              placeholder="сума заповнених позицій"
            />
          </FormField>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-slate-300"
            checked={isMySale}
            onChange={(e) => setIsMySale(e.target.checked)}
          />
          <span>
            <span className="text-sm font-medium text-slate-900">Моя продажа</span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Клієнт купує кондиціонер у вас — модель, постачальник і собівартість
            </span>
          </span>
        </label>

        {isMySale && (
          <div className="space-y-4 rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-900">Дані про кондиціонер</p>
            <AcBrandModelFields
              required={isMySale}
              brandSelection={brandSelection}
              onBrandSelectionChange={(value) => {
                setBrandSelection(value)
                setModelSelection('')
                setCustomModel('')
              }}
              customBrand={customBrand}
              onCustomBrandChange={setCustomBrand}
              modelSelection={modelSelection}
              onModelSelectionChange={setModelSelection}
              customModel={customModel}
              onCustomModelChange={setCustomModel}
            />
            <FormField label="Посилання на товар в інтернеті">
              <input
                type="url"
                className={inputClass}
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://…"
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Вартість роздрібна *">
                <MoneyInput
                  required={isMySale}
                  currency="UAH"
                  value={retailPrice}
                  onChange={setRetailPrice}
                />
              </FormField>
              <FormField label="Вартість оптова *">
                <MoneyInput
                  required={isMySale}
                  currency="UAH"
                  value={wholesalePrice}
                  onChange={setWholesalePrice}
                />
              </FormField>
            </div>

            <p className="border-t border-slate-100 pt-4 text-sm font-medium text-slate-900">
              Закупівля у постачальника
            </p>
            <FormField label="У кого купили (постачальник) *">
              <input
                required={isMySale}
                className={inputClass}
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </FormField>
            <FormField label="Дата закупівлі *">
              <input
                required={isMySale}
                type="date"
                className={inputClass}
                value={supplierPurchaseDate}
                onChange={(e) => setSupplierPurchaseDate(e.target.value)}
              />
            </FormField>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-slate-300"
                checked={supplierPaidInUsd}
                onChange={(e) => setSupplierPaidInUsd(e.target.checked)}
              />
              <span className="text-sm text-slate-700">
                Платив постачальнику в доларах (USD)
              </span>
            </label>

            {supplierPaidInUsd ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Сума постачальнику *">
                    <MoneyInput
                      required={isMySale}
                      currency="USD"
                      value={supplierPaidAmountUsd}
                      onChange={(value) => {
                        setSupplierPaidAmountUsd(value)
                        applySupplierUahFromUsd(value, supplierUsdExchangeRate)
                      }}
                    />
                  </FormField>
                  <FormField label="Курс (₴ за 1 $) *">
                    <MoneyInput
                      required={isMySale}
                      currency="UAH"
                      value={supplierUsdExchangeRate}
                      onChange={(value) => {
                        setSupplierUsdExchangeRate(value)
                        applySupplierUahFromUsd(supplierPaidAmountUsd, value)
                      }}
                      placeholder="41,50"
                    />
                  </FormField>
                </div>
                <FormField label="Собівартість закупівлі — розрахунок">
                  <MoneyInput
                    readOnly
                    currency="UAH"
                    value={supplierPaidAmount}
                    onChange={() => {}}
                    placeholder="USD × курс"
                  />
                </FormField>
                <button
                  type="button"
                  className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
                  onClick={() =>
                    applySupplierUahFromUsd(
                      supplierPaidAmountUsd,
                      supplierUsdExchangeRate,
                    )
                  }
                >
                  Перерахувати ₴
                </button>
              </>
            ) : (
              <FormField label="Скільки заплатили постачальнику *">
                <MoneyInput
                  required={isMySale}
                  currency="UAH"
                  value={supplierPaidAmount}
                  onChange={setSupplierPaidAmount}
                />
              </FormField>
            )}
          </div>
        )}

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
