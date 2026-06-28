import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function ProtectedRoute() {
  const { firebaseUser, appUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Завантаження…
      </div>
    )
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />
  }

  if (!appUser) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

export function OnboardingRoute() {
  const { firebaseUser, appUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Завантаження…
      </div>
    )
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />
  }

  if (appUser) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { firebaseUser, appUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Завантаження…
      </div>
    )
  }

  if (firebaseUser) {
    return <Navigate to={appUser ? '/dashboard' : '/onboarding'} replace />
  }

  return <Outlet />
}
