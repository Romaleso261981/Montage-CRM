import { type FormEvent } from 'react'
import { FormField, inputClass } from './AuthShell'
import {
  AcBrandModelFields,
} from './AcBrandModelFields'
import { MoneyInput } from './MoneyInput'
import {
  applyClientTotal,
  applySupplierUahFromUsd,
  type OrderFormValues,
} from '../lib/orderFormHelpers'
import type { OrderStatus, PaymentStatus } from '../types/order'

type OrderFormEditorProps = {
  values: OrderFormValues
  onChange: (patch: Partial<OrderFormValues>) => void
  error: string | null
  submitting: boolean
  submitLabel: string
  onSubmit: (e: FormEvent) => void
}

export function OrderFormEditor({
  values,
  onChange,
  error,
  submitting,
  submitLabel,
  onSubmit,
}: OrderFormEditorProps) {
  const patch = onChange

  function recalcTotal(next: Partial<OrderFormValues>) {
    const merged = { ...values, ...next }
    return applyClientTotal(
      merged.acUnitPrice,
      merged.installationPrice,
      merged.dismantlingPrice,
      merged.refillPrice,
    )
  }

  function handleClientPriceChange(
    field:
      | 'acUnitPrice'
      | 'installationPrice'
      | 'dismantlingPrice'
      | 'refillPrice',
    value: string,
  ) {
    patch({
      [field]: value,
      salePrice: recalcTotal({ [field]: value }),
    })
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <FormField label="Імʼя клієнта *">
        <input
          required
          className={inputClass}
          value={values.clientName}
          onChange={(e) => patch({ clientName: e.target.value })}
        />
      </FormField>
      <FormField label="Телефон *">
        <input
          required
          className={inputClass}
          value={values.phone}
          onChange={(e) => patch({ phone: e.target.value })}
        />
      </FormField>
      <FormField label="Адреса *">
        <input
          required
          className={inputClass}
          value={values.address}
          onChange={(e) => patch({ address: e.target.value })}
        />
      </FormField>

      <div className="space-y-4 rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-900">Оплата від клієнта</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Вартість кондиціонера">
            <MoneyInput
              currency="UAH"
              value={values.acUnitPrice}
              onChange={(v) => handleClientPriceChange('acUnitPrice', v)}
            />
          </FormField>
          <FormField label="Вартість встановлення">
            <MoneyInput
              currency="UAH"
              value={values.installationPrice}
              onChange={(v) => handleClientPriceChange('installationPrice', v)}
            />
          </FormField>
          <FormField label="Демонтаж">
            <MoneyInput
              currency="UAH"
              value={values.dismantlingPrice}
              onChange={(v) => handleClientPriceChange('dismantlingPrice', v)}
            />
          </FormField>
          <FormField label="Заправка">
            <MoneyInput
              currency="UAH"
              value={values.refillPrice}
              onChange={(v) => handleClientPriceChange('refillPrice', v)}
            />
          </FormField>
        </div>
        <FormField label="Загальна сума для клієнта">
          <MoneyInput
            readOnly
            currency="UAH"
            value={values.salePrice}
            onChange={() => {}}
            placeholder="сума заповнених позицій"
          />
        </FormField>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <input
          type="checkbox"
          className="mt-0.5 size-4 rounded border-slate-300"
          checked={values.isMySale}
          onChange={(e) => patch({ isMySale: e.target.checked })}
        />
        <span>
          <span className="text-sm font-medium text-slate-900">Моя продажа</span>
        </span>
      </label>

      {values.isMySale && (
        <div className="space-y-4 rounded-lg border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-900">Дані про кондиціонер</p>
          <AcBrandModelFields
            required={values.isMySale}
            brandSelection={values.brandSelection}
            onBrandSelectionChange={(value) => {
              patch({
                brandSelection: value,
                modelSelection: '',
                customModel: '',
              })
            }}
            customBrand={values.customBrand}
            onCustomBrandChange={(v) => patch({ customBrand: v })}
            modelSelection={values.modelSelection}
            onModelSelectionChange={(v) => patch({ modelSelection: v })}
            customModel={values.customModel}
            onCustomModelChange={(v) => patch({ customModel: v })}
          />
          <FormField label="Посилання на товар в інтернеті">
            <input
              type="url"
              className={inputClass}
              value={values.productUrl}
              onChange={(e) => patch({ productUrl: e.target.value })}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Вартість роздрібна *">
              <MoneyInput
                required={values.isMySale}
                currency="UAH"
                value={values.retailPrice}
                onChange={(v) => patch({ retailPrice: v })}
              />
            </FormField>
            <FormField label="Вартість оптова *">
              <MoneyInput
                required={values.isMySale}
                currency="UAH"
                value={values.wholesalePrice}
                onChange={(v) => patch({ wholesalePrice: v })}
              />
            </FormField>
          </div>
          <p className="border-t border-slate-100 pt-4 text-sm font-medium text-slate-900">
            Закупівля у постачальника
          </p>
          <FormField label="Постачальник *">
            <input
              required={values.isMySale}
              className={inputClass}
              value={values.supplierName}
              onChange={(e) => patch({ supplierName: e.target.value })}
            />
          </FormField>
          <FormField label="Дата закупівлі *">
            <input
              required={values.isMySale}
              type="date"
              className={inputClass}
              value={values.supplierPurchaseDate}
              onChange={(e) => patch({ supplierPurchaseDate: e.target.value })}
            />
          </FormField>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-slate-300"
              checked={values.supplierPaidInUsd}
              onChange={(e) => patch({ supplierPaidInUsd: e.target.checked })}
            />
            <span className="text-sm text-slate-700">
              Платив постачальнику в USD
            </span>
          </label>
          {values.supplierPaidInUsd ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Сума постачальнику *">
                  <MoneyInput
                    required={values.isMySale}
                    currency="USD"
                    value={values.supplierPaidAmountUsd}
                    onChange={(v) =>
                      patch({
                        supplierPaidAmountUsd: v,
                        supplierPaidAmount: applySupplierUahFromUsd(
                          v,
                          values.supplierUsdExchangeRate,
                        ),
                      })
                    }
                  />
                </FormField>
                <FormField label="Курс (₴ за 1 $) *">
                  <MoneyInput
                    required={values.isMySale}
                    currency="UAH"
                    value={values.supplierUsdExchangeRate}
                    onChange={(v) =>
                      patch({
                        supplierUsdExchangeRate: v,
                        supplierPaidAmount: applySupplierUahFromUsd(
                          values.supplierPaidAmountUsd,
                          v,
                        ),
                      })
                    }
                  />
                </FormField>
              </div>
              <FormField label="Собівартість закупівлі">
                <MoneyInput
                  readOnly
                  currency="UAH"
                  value={values.supplierPaidAmount}
                  onChange={() => {}}
                />
              </FormField>
            </>
          ) : (
            <FormField label="Оплата постачальнику (₴) *">
              <MoneyInput
                required={values.isMySale}
                currency="UAH"
                value={values.supplierPaidAmount}
                onChange={(v) => patch({ supplierPaidAmount: v })}
              />
            </FormField>
          )}
        </div>
      )}

      <div className="space-y-4 rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-900">Монтаж</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Дата монтажу">
            <input
              type="date"
              className={inputClass}
              value={values.installationDate}
              onChange={(e) => patch({ installationDate: e.target.value })}
            />
          </FormField>
          <FormField label="Час">
            <input
              type="time"
              className={inputClass}
              value={values.installationTime}
              onChange={(e) => patch({ installationTime: e.target.value })}
            />
          </FormField>
        </div>
        <FormField label="Монтажник">
          <input
            className={inputClass}
            value={values.installerName}
            onChange={(e) => patch({ installerName: e.target.value })}
          />
        </FormField>
      </div>

      <FormField label="Статус">
        <select
          className={inputClass}
          value={values.status}
          onChange={(e) => patch({ status: e.target.value as OrderStatus })}
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
          value={values.paymentStatus}
          onChange={(e) =>
            patch({ paymentStatus: e.target.value as PaymentStatus })
          }
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
          value={values.comment}
          onChange={(e) => patch({ comment: e.target.value })}
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
        {submitting ? 'Збереження…' : submitLabel}
      </button>
    </form>
  )
}
