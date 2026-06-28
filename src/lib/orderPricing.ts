import {
  formatExchangeRate,
  formatMoneyDisplay,
} from './moneyFormat'

/** Сума в гривнях з USD і курсу (2 знаки після коми). */
export function uahFromUsd(usd: number, rate: number): number {
  return Math.round(usd * rate * 100) / 100
}

export function formatSupplierPurchaseCost(details: {
  supplierPaidAmount: number
  supplierPaidAmountUsd?: number
  supplierUsdExchangeRate?: number
}): string {
  const uah = formatMoneyDisplay(details.supplierPaidAmount, 'UAH')
  if (
    details.supplierPaidAmountUsd != null &&
    details.supplierUsdExchangeRate != null
  ) {
    return `${formatMoneyDisplay(details.supplierPaidAmountUsd, 'USD')} × ${formatExchangeRate(details.supplierUsdExchangeRate)} = ${uah}`
  }
  return uah
}
