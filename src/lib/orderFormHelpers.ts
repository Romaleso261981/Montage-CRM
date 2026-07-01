import {
  AC_BRAND_OTHER,
  AC_MODEL_OTHER,
  getModelsForBrand,
  isCatalogBrand,
} from '../constants/acCatalog'
import { normalizeMoneyInput, parseMoneyInput } from './moneyFormat'
import { uahFromUsd } from './orderPricing'
import type { Order, OrderSaleDetails } from '../types/order'
import { resolveAcBrandAndModel } from '../components/AcBrandModelFields'

export function moneyFieldFromNumber(value?: number): string {
  if (value == null || Number.isNaN(value)) return ''
  return normalizeMoneyInput(String(value))
}

export function initAcBrandFieldsFromOrder(acName: string, acModel: string) {
  if (isCatalogBrand(acName)) {
    const models = getModelsForBrand(acName)
    if (models.includes(acModel)) {
      return {
        brandSelection: acName,
        customBrand: '',
        modelSelection: acModel,
        customModel: '',
      }
    }
    return {
      brandSelection: acName,
      customBrand: '',
      modelSelection: AC_MODEL_OTHER,
      customModel: acModel,
    }
  }
  return {
    brandSelection: AC_BRAND_OTHER,
    customBrand: acName,
    modelSelection: AC_MODEL_OTHER,
    customModel: acModel,
  }
}

export type OrderFormValues = {
  clientName: string
  phone: string
  address: string
  acUnitPrice: string
  installationPrice: string
  dismantlingPrice: string
  refillPrice: string
  repairPrice: string
  drainCleaningPrice: string
  acCleaningPrice: string
  salePrice: string
  isMySale: boolean
  brandSelection: string
  customBrand: string
  modelSelection: string
  customModel: string
  productUrl: string
  retailPrice: string
  wholesalePrice: string
  supplierName: string
  supplierPaidInUsd: boolean
  supplierPaidAmountUsd: string
  supplierUsdExchangeRate: string
  supplierPaidAmount: string
  supplierPurchaseDate: string
  status: Order['status']
  paymentStatus: Order['paymentStatus']
  installationDate: string
  installationTime: string
  installerName: string
  comment: string
}

export const CLIENT_PAYMENT_FIELDS = [
  { key: 'acUnitPrice', label: 'Вартість кондиціонера' },
  { key: 'installationPrice', label: 'Вартість встановлення' },
  { key: 'dismantlingPrice', label: 'Демонтаж' },
  { key: 'refillPrice', label: 'Заправка' },
  { key: 'repairPrice', label: 'Ремонт' },
  { key: 'drainCleaningPrice', label: 'Чистка дренажу' },
  { key: 'acCleaningPrice', label: 'Чистка кондиціонера' },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<
    OrderFormValues,
    | 'acUnitPrice'
    | 'installationPrice'
    | 'dismantlingPrice'
    | 'refillPrice'
    | 'repairPrice'
    | 'drainCleaningPrice'
    | 'acCleaningPrice'
  >
  label: string
}>

export type ClientPriceFormKey = (typeof CLIENT_PAYMENT_FIELDS)[number]['key']

export function pickClientPriceStrings(
  values: OrderFormValues,
): Record<ClientPriceFormKey, string> {
  return {
    acUnitPrice: values.acUnitPrice,
    installationPrice: values.installationPrice,
    dismantlingPrice: values.dismantlingPrice,
    refillPrice: values.refillPrice,
    repairPrice: values.repairPrice,
    drainCleaningPrice: values.drainCleaningPrice,
    acCleaningPrice: values.acCleaningPrice,
  }
}

export function orderToFormValues(order: Order): OrderFormValues {
  const brand = order.saleDetails
    ? initAcBrandFieldsFromOrder(
        order.saleDetails.acName,
        order.saleDetails.acModel,
      )
    : {
        brandSelection: '',
        customBrand: '',
        modelSelection: '',
        customModel: '',
      }

  const sd = order.saleDetails
  const paidUsd = sd?.supplierPaidAmountUsd != null

  return {
    clientName: order.clientName,
    phone: order.phone,
    address: order.address,
    acUnitPrice: moneyFieldFromNumber(order.acUnitPrice),
    installationPrice: moneyFieldFromNumber(order.installationPrice),
    dismantlingPrice: moneyFieldFromNumber(order.dismantlingPrice),
    refillPrice: moneyFieldFromNumber(order.refillPrice),
    repairPrice: moneyFieldFromNumber(order.repairPrice),
    drainCleaningPrice: moneyFieldFromNumber(order.drainCleaningPrice),
    acCleaningPrice: moneyFieldFromNumber(order.acCleaningPrice),
    salePrice: moneyFieldFromNumber(order.salePrice),
    isMySale: order.isMySale ?? false,
    ...brand,
    productUrl: sd?.productUrl ?? '',
    retailPrice: moneyFieldFromNumber(sd?.retailPrice),
    wholesalePrice: moneyFieldFromNumber(sd?.wholesalePrice),
    supplierName: sd?.supplierName ?? '',
    supplierPaidInUsd: paidUsd || !sd ? true : false,
    supplierPaidAmountUsd: moneyFieldFromNumber(sd?.supplierPaidAmountUsd),
    supplierUsdExchangeRate: moneyFieldFromNumber(sd?.supplierUsdExchangeRate),
    supplierPaidAmount: moneyFieldFromNumber(sd?.supplierPaidAmount),
    supplierPurchaseDate: sd?.supplierPurchaseDate ?? '',
    status: order.status,
    paymentStatus: order.paymentStatus,
    installationDate: order.installationDate ?? '',
    installationTime: order.installationTime ?? '',
    installerName: order.installerName ?? '',
    comment: order.comment ?? '',
  }
}

function parseOptionalMoney(value: string): number | null {
  if (!value.trim()) return null
  return parseMoneyInput(value)
}

function parseRequiredMoney(value: string): number | null {
  return parseMoneyInput(value)
}

function sumClientLineItems(
  ...parts: (number | null)[]
): number {
  const nums = parts.filter((p): p is number => p !== null)
  if (nums.length === 0) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) * 100) / 100
}

export type ParsedOrderForm =
  | {
      ok: true
      data: {
        clientName: string
        phone: string
        address: string
        acUnitPrice?: number
        installationPrice?: number
        dismantlingPrice?: number
        refillPrice?: number
        repairPrice?: number
        drainCleaningPrice?: number
        acCleaningPrice?: number
        salePrice: number
        isMySale: boolean
        saleDetails?: OrderSaleDetails
        status: Order['status']
        paymentStatus: Order['paymentStatus']
        installationDate?: string
        installationTime?: string
        installerName?: string
        comment?: string
      }
    }
  | { ok: false; error: string }

export function parseOrderForm(values: OrderFormValues): ParsedOrderForm {
  const ac = parseOptionalMoney(values.acUnitPrice)
  const install = parseOptionalMoney(values.installationPrice)
  const dismantling = parseOptionalMoney(values.dismantlingPrice)
  const refill = parseOptionalMoney(values.refillPrice)
  const repair = parseOptionalMoney(values.repairPrice)
  const drainCleaning = parseOptionalMoney(values.drainCleaningPrice)
  const acCleaning = parseOptionalMoney(values.acCleaningPrice)

  const expectedTotal = sumClientLineItems(
    ac,
    install,
    dismantling,
    refill,
    repair,
    drainCleaning,
    acCleaning,
  )

  const price = parseOptionalMoney(values.salePrice)
  const salePrice = price !== null ? price : expectedTotal

  let saleDetails: OrderSaleDetails | undefined

  if (values.isMySale) {
    const resolved = resolveAcBrandAndModel(
      values.brandSelection,
      values.customBrand,
      values.modelSelection,
      values.customModel,
    )
    if (!resolved) {
      return {
        ok: false,
        error: 'Оберіть бренд і модель кондиціонера зі списку або вкажіть вручну',
      }
    }

    if (!values.supplierName.trim()) {
      return { ok: false, error: 'Вкажіть постачальника' }
    }
    if (!values.supplierPurchaseDate) {
      return { ok: false, error: 'Вкажіть дату закупівлі у постачальника' }
    }

    const retail = parseOptionalMoney(values.retailPrice)
    const wholesale = parseOptionalMoney(values.wholesalePrice)
    if (retail === null || wholesale === null) {
      return { ok: false, error: 'Перевірте роздрібну та оптову вартість' }
    }

    let paidUah: number
    let paidUsd: number | undefined
    let paidRate: number | undefined

    if (values.supplierPaidInUsd) {
      const usd = parseRequiredMoney(values.supplierPaidAmountUsd)
      const rate = parseRequiredMoney(values.supplierUsdExchangeRate)
      if (usd === null || rate === null || rate === 0) {
        return { ok: false, error: 'Вкажіть суму оплати постачальнику в USD і курс' }
      }
      paidUsd = usd
      paidRate = rate
      const manualUah = parseOptionalMoney(values.supplierPaidAmount)
      paidUah = manualUah ?? uahFromUsd(usd, rate)
    } else {
      const paid = parseRequiredMoney(values.supplierPaidAmount)
      if (paid === null) {
        return { ok: false, error: 'Вкажіть суму оплати постачальнику в гривнях' }
      }
      paidUah = paid
    }

    saleDetails = {
      acName: resolved.acName,
      acModel: resolved.acModel,
      productUrl: values.productUrl.trim() || undefined,
      retailPrice: retail,
      wholesalePrice: wholesale,
      supplierName: values.supplierName.trim(),
      supplierPaidAmount: paidUah,
      ...(paidUsd != null && paidRate != null
        ? {
            supplierPaidAmountUsd: paidUsd,
            supplierUsdExchangeRate: paidRate,
          }
        : {}),
      supplierPurchaseDate: values.supplierPurchaseDate,
    }
  }

  return {
    ok: true,
    data: {
      clientName: values.clientName.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      acUnitPrice: ac ?? undefined,
      installationPrice: install ?? undefined,
      dismantlingPrice: dismantling ?? undefined,
      refillPrice: refill ?? undefined,
      repairPrice: repair ?? undefined,
      drainCleaningPrice: drainCleaning ?? undefined,
      acCleaningPrice: acCleaning ?? undefined,
      salePrice,
      isMySale: values.isMySale,
      saleDetails: values.isMySale ? saleDetails : undefined,
      status: values.status,
      paymentStatus: values.paymentStatus,
      installationDate: values.installationDate.trim() || undefined,
      installationTime: values.installationTime.trim() || undefined,
      installerName: values.installerName.trim() || undefined,
      comment: values.comment.trim() || undefined,
    },
  }
}

export function applyClientTotalFromValues(
  prices: Record<ClientPriceFormKey, string>,
): string {
  const parts = CLIENT_PAYMENT_FIELDS.map(({ key }) =>
    parseOptionalMoney(prices[key]),
  )
  const total = sumClientLineItems(...parts)
  const anyFilled = CLIENT_PAYMENT_FIELDS.some(({ key }) => prices[key].trim())
  if (!anyFilled) return ''
  return normalizeMoneyInput(String(total))
}

/** @deprecated use applyClientTotalFromValues */
export function applyClientTotal(
  acStr: string,
  installStr: string,
  dismantlingStr: string,
  refillStr: string,
): string {
  return applyClientTotalFromValues({
    acUnitPrice: acStr,
    installationPrice: installStr,
    dismantlingPrice: dismantlingStr,
    refillPrice: refillStr,
    repairPrice: '',
    drainCleaningPrice: '',
    acCleaningPrice: '',
  })
}

export function applySupplierUahFromUsd(usdStr: string, rateStr: string): string {
  const usd = parseMoneyInput(usdStr)
  const rate = parseMoneyInput(rateStr)
  if (usd === null || rate === null || rate === 0) return ''
  return normalizeMoneyInput(String(uahFromUsd(usd, rate)))
}
