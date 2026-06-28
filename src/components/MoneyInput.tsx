import {
  normalizeMoneyInput,
  type MoneyCurrency,
} from '../lib/moneyFormat'

const CURRENCY_SUFFIX: Record<MoneyCurrency, string> = {
  USD: '$',
  UAH: '₴',
}

type MoneyInputProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  currency: MoneyCurrency
  required?: boolean
  readOnly?: boolean
  placeholder?: string
  className?: string
}

export function MoneyInput({
  id,
  value,
  onChange,
  currency,
  required,
  readOnly,
  placeholder,
  className = '',
}: MoneyInputProps) {
  const suffix = CURRENCY_SUFFIX[currency]

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        required={required}
        readOnly={readOnly}
        placeholder={placeholder ?? '0,00'}
        className={`w-full rounded-lg border border-slate-300 py-2 pl-3 pr-10 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${readOnly ? 'bg-slate-50' : ''} ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (readOnly || !value.trim()) return
          onChange(normalizeMoneyInput(value))
        }}
      />
      <span
        className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-slate-500"
        aria-hidden
      >
        {suffix}
      </span>
    </div>
  )
}
