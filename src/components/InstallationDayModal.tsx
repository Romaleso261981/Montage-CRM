import { useEffect } from 'react'
import { InstallationDayDetailsPanel } from './InstallationDayDetailsPanel'
import { InstallationDayExtractActions } from './InstallationDayExtractActions'
import { formatDayTitleUk, type DayInstallationStats } from '../lib/installationCalendar'

type InstallationDayModalProps = {
  open: boolean
  onClose: () => void
  selectedKey: string | null
  stats: DayInstallationStats | undefined
  todayKey: string
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="size-5"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function InstallationDayModal({
  open,
  onClose,
  selectedKey,
  stats,
  todayKey,
}: InstallationDayModalProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !selectedKey) return null

  const title = formatDayTitleUk(selectedKey)
  const count = stats?.orders.length ?? 0

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="installation-day-modal-title"
    >
      <header className="shrink-0 border-b border-slate-200 bg-white pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2 px-3 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 active:bg-slate-200"
            aria-label="Закрити"
          >
            <CloseIcon />
          </button>
          <div className="min-w-0 flex-1">
            <h2
              id="installation-day-modal-title"
              className="truncate text-base font-semibold capitalize text-slate-900"
            >
              {title}
            </h2>
            {count > 0 && (
              <p className="text-xs text-slate-500">
                {count}{' '}
                {count === 1 ? 'заявка' : count < 5 ? 'заявки' : 'заявок'}
              </p>
            )}
          </div>
          <InstallationDayExtractActions
            dateKey={selectedKey}
            orders={stats?.orders ?? []}
            compact
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <InstallationDayDetailsPanel
          selectedKey={selectedKey}
          stats={stats}
          todayKey={todayKey}
          scrollOnSelect={false}
          showEmptyHint={false}
          showTitle={false}
          layout="cards"
          showExtractActions={false}
          className="border-0 bg-transparent p-0"
        />
      </div>
    </div>
  )
}
