import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AuthShell,
  FormField,
  inputClass,
} from '../components/AuthShell'
import { useAuth } from '../context/useAuth'
import { getFirestoreErrorMessage } from '../lib/firestoreErrors'
import { createOrganization } from '../services/organizationsService'
import { createAppUser } from '../services/usersService'

export function OnboardingPage() {
  const { firebaseUser, refreshProfile, logout } = useAuth()
  const navigate = useNavigate()

  const [orgName, setOrgName] = useState('')
  const [orgPhone, setOrgPhone] = useState('')
  const [orgCity, setOrgCity] = useState('')
  const [orgEmail, setOrgEmail] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [signingIn, setSigningIn] = useState(false)

  async function handleGoToLogin() {
    setSigningIn(true)
    setError(null)
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getFirestoreErrorMessage(err))
    } finally {
      setSigningIn(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!firebaseUser) return

    setError(null)
    setSubmitting(true)
    try {
      const organizationId = await createOrganization({
        name: orgName.trim(),
        phone: orgPhone.trim() || undefined,
        city: orgCity.trim() || undefined,
        email: orgEmail.trim() || undefined,
        ownerId: firebaseUser.uid,
      })

      await createAppUser({
        id: firebaseUser.uid,
        email: firebaseUser.email ?? orgEmail.trim(),
        displayName: ownerName.trim() || undefined,
        organizationId,
        role: 'owner',
      })

      await refreshProfile()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getFirestoreErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Створення організації"
      subtitle="Заповніть дані вашої компанії. Пізніше сюди можна буде додати запрошення для працівників."
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <FormField label="Назва організації *">
          <input
            required
            className={inputClass}
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
        </FormField>
        <FormField label="Телефон організації">
          <input
            type="tel"
            className={inputClass}
            value={orgPhone}
            onChange={(e) => setOrgPhone(e.target.value)}
            placeholder="+380…"
          />
        </FormField>
        <FormField label="Місто">
          <input
            className={inputClass}
            value={orgCity}
            onChange={(e) => setOrgCity(e.target.value)}
          />
        </FormField>
        <FormField label="Email організації">
          <input
            type="email"
            className={inputClass}
            value={orgEmail}
            onChange={(e) => setOrgEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Власник організації *">
          <input
            required
            className={inputClass}
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="ПІБ власника"
          />
        </FormField>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting || signingIn}
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? 'Створення…' : 'Створити організацію'}
        </button>
        <button
          type="button"
          disabled={submitting || signingIn}
          onClick={() => void handleGoToLogin()}
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60"
        >
          {signingIn ? 'Перехід…' : 'Увійти (організація вже створена)'}
        </button>
      </form>
      <p className="mt-4 text-xs text-slate-500">
        Якщо компанію вже створено раніше, натисніть «Увійти» і авторизуйтеся тим
        email, під яким реєстрували організацію.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Запрошення в існуючу організацію з’явиться пізніше (колекція{' '}
        <code className="rounded bg-slate-100 px-1">organizationInvites</code>
        ).
      </p>
    </AuthShell>
  )
}
