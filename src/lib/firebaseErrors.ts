import { FirebaseError } from 'firebase/app'

const AUTH_ERROR_MESSAGES_UK: Record<string, string> = {
  'auth/configuration-not-found':
    'Authentication не налаштовано в Firebase. Відкрийте Firebase Console → проєкт climate-crm → Authentication → «Get started» / «Почати», потім увімкніть «Email/Password».',
  'auth/email-already-in-use': 'Цей email уже зареєстровано.',
  'auth/invalid-email': 'Некоректний email.',
  'auth/weak-password': 'Пароль занадто слабкий (мінімум 6 символів).',
  'auth/invalid-credential': 'Невірний email або пароль.',
  'auth/user-not-found': 'Користувача з таким email не знайдено.',
  'auth/wrong-password': 'Невірний пароль.',
  'auth/too-many-requests': 'Забагато спроб. Спробуйте пізніше.',
  'auth/network-request-failed': 'Помилка мережі. Перевірте інтернет.',
}

export function getFirebaseAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError && error.code in AUTH_ERROR_MESSAGES_UK) {
    return AUTH_ERROR_MESSAGES_UK[error.code]
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Сталася невідома помилка'
}

export function isFirebaseConfigMissing(error: unknown): boolean {
  return error instanceof FirebaseError && error.code === 'auth/configuration-not-found'
}
