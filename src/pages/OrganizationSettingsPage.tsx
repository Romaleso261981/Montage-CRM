import { type FormEvent, useEffect, useState } from 'react'
import { FormField, inputClass } from '../components/AuthShell'
import { canManageOrganization } from '../constants/userRoles'
import { useAuth } from '../context/useAuth'
import { updateOrganization } from '../services/organizationsService'

export function OrganizationSettingsPage() {
  const { organization, appUser, refreshProfile } = useAuth()
  const canEdit = appUser ? canManageOrganization(appUser.role) : false

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!organization) return
    setName(organization.name)
    setPhone(organization.phone ?? '')
    setCity(organization.city ?? '')
    setEmail(organization.email ?? '')
  }, [organization])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!organization || !canEdit) return

    setError(null)
    setSaved(false)
    setSubmitting(true)
    try {
      await updateOrganization(organization.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        email: email.trim() || undefined,
      })
      await refreshProfile()
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти')
    } finally {
      setSubmitting(false)
    }
  }

  if (!organization) {
    return <p className="text-slate-500">Організацію не знайдено.</p>
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Налаштування організації</h1>

      {!canEdit && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Редагування доступне лише власнику або адміністратору.
        </p>
      )}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <FormField label="Назва">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canEdit}
            required
          />
        </FormField>
        <FormField label="Телефон">
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!canEdit}
          />
        </FormField>
        <FormField label="Місто">
          <input
            className={inputClass}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={!canEdit}
          />
        </FormField>
        <FormField label="Email">
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!canEdit}
          />
        </FormField>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {saved && (
          <p className="text-sm text-green-700">Зміни збережено.</p>
        )}
        {canEdit && (
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? 'Збереження…' : 'Зберегти'}
          </button>
        )}
      </form>
    </div>
  )
}
