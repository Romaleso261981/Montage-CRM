/** Firestore rejects `undefined` field values. */
export function removeUndefinedFields<T>(value: T): T {
  if (value === undefined) {
    return value
  }
  if (value === null || typeof value !== 'object') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedFields(item)) as T
  }
  const result: Record<string, unknown> = {}
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (nested === undefined) continue
    result[key] = removeUndefinedFields(nested)
  }
  return result as T
}
