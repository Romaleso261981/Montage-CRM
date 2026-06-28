/** Сума в гривнях з USD і курсу (2 знаки після коми). */
export function uahFromUsd(usd: number, rate: number): number {
  return Math.round(usd * rate * 100) / 100
}

export function formatSupplierPurchaseCost(details: {
  supplierPaidAmount: number
  supplierPaidAmountUsd?: number
  supplierUsdExchangeRate?: number
}): string {
  const uah = `${details.supplierPaidAmount} ₴`
  if (
    details.supplierPaidAmountUsd != null &&
    details.supplierUsdExchangeRate != null
  ) {
    return `${details.supplierPaidAmountUsd} $ × ${details.supplierUsdExchangeRate} = ${uah}`
  }
  return uah
}
