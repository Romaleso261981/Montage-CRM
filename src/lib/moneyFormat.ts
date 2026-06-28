export type MoneyCurrency = 'USD' | 'UAH'

const CURRENCY_SUFFIX: Record<MoneyCurrency, string> = {
  USD: '$',
  UAH: '₴',
}

export function normalizeMoneyInput(value: string): string {
  const cleaned = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!cleaned) return ''
  const n = Number(cleaned)
  if (Number.isNaN(n) || n < 0) return value.trim()
  return n.toLocaleString('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function parseMoneyInput(value: string): number | null {
  const cleaned = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!cleaned) return null
  const n = Number(cleaned)
  if (Number.isNaN(n) || n < 0) return null
  return n
}

export function formatMoneyDisplay(
  amount: number,
  currency: MoneyCurrency,
): string {
  const formatted = amount.toLocaleString('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${formatted} ${CURRENCY_SUFFIX[currency]}`
}

/** Курс: ₴ за 1 USD (без суфікса ₴ в кінці, з поясненням). */
export function formatExchangeRate(rate: number): string {
  const formatted = rate.toLocaleString('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${formatted} ₴/1 $`
}
