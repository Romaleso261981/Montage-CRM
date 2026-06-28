import { FirebaseError } from 'firebase/app'

const FIRESTORE_ERROR_MESSAGES_UK: Record<string, string> = {
  'permission-denied':
    'Немає доступу до Firestore. Вийдіть і увійдіть знову, зачекайте ~1 хв (правила оновлено) і спробуйте ще раз.',
  'failed-precondition':
    'Потрібен індекс Firestore для заявок. Відкрийте консоль браузера (F12) — там буде посилання на створення індексу.',
}

export function getFirestoreErrorMessage(error: unknown): string {
  if (
    error instanceof FirebaseError &&
    error.code in FIRESTORE_ERROR_MESSAGES_UK
  ) {
    return FIRESTORE_ERROR_MESSAGES_UK[error.code]
  }
  if (error instanceof FirebaseError) {
    return `${error.message} (${error.code})`
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Помилка Firestore'
}
