import { getFirestoreErrorMessage } from '../lib/firestoreErrors'

type ProfileLoadErrorScreenProps = {
  message: string
  onRetry: () => void
  retrying: boolean
}

export function ProfileLoadErrorScreen({
  message,
  onRetry,
  retrying,
}: ProfileLoadErrorScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg font-medium text-slate-900">
        Не вдалося завантажити профіль
      </p>
      <p className="max-w-sm text-sm text-slate-600">{message}</p>
      <p className="max-w-sm text-xs text-slate-500">
        Часто це буває після оновлення сторінки на телефоні через слабкий
        інтернет. Спробуйте ще раз.
      </p>
      <button
        type="button"
        disabled={retrying}
        onClick={() => void onRetry()}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {retrying ? 'Завантаження…' : 'Спробувати знову'}
      </button>
    </div>
  )
}

export function profileLoadErrorMessage(err: unknown): string {
  return getFirestoreErrorMessage(err)
}
