import {
  downloadInstallationExtractText,
  openInstallationExtractPrint,
} from '../lib/installationDayExtract'
import type { Order } from '../types/order'

type InstallationDayExtractActionsProps = {
  dateKey: string
  orders: Order[]
  /** Вузькі кнопки для шапки модалки. */
  compact?: boolean
  className?: string
}

export function InstallationDayExtractActions({
  dateKey,
  orders,
  compact = false,
  className = '',
}: InstallationDayExtractActionsProps) {
  const disabled = orders.length === 0

  const baseBtn =
    'rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'

  if (compact) {
    return (
      <div className={`flex shrink-0 items-center gap-1 ${className}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => openInstallationExtractPrint(dateKey, orders)}
          className={`${baseBtn} px-2.5 py-2`}
          title="Виписка — друк або PDF"
          aria-label="Виписка — друк або PDF"
        >
          PDF
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => downloadInstallationExtractText(dateKey, orders)}
          className={`${baseBtn} px-2.5 py-2`}
          title="Завантажити текстовий список"
          aria-label="Завантажити текстовий список"
        >
          TXT
        </button>
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => openInstallationExtractPrint(dateKey, orders)}
        className={`${baseBtn} px-3 py-1.5`}
      >
        Виписка (PDF)
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => downloadInstallationExtractText(dateKey, orders)}
        className={`${baseBtn} px-3 py-1.5`}
      >
        Список (TXT)
      </button>
    </div>
  )
}
