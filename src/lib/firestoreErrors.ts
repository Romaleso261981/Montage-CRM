import { FirebaseError } from 'firebase/app'

const FIRESTORE_ERROR_MESSAGES_UK: Record<string, string> = {
  'permission-denied':
    'Немає доступу до Firestore. Переконайтеся, що правила безпеки задеployені (firebase deploy --only firestore:rules).',
}

export function getFirestoreErrorMessage(error: unknown): string {
  if (
    error instanceof FirebaseError &&
    error.code in FIRESTORE_ERROR_MESSAGES_UK
  ) {
    return FIRESTORE_ERROR_MESSAGES_UK[error.code]
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Помилка Firestore'
}
