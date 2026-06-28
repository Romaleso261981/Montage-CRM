import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import {
  GuestRoute,
  OnboardingRoute,
  ProtectedRoute,
} from './components/RouteGuards'
import { DashboardPage } from './pages/DashboardPage'
import { InstallationsPage } from './pages/InstallationsPage'
import { NewOrderPage } from './pages/NewOrderPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { OrganizationSettingsPage } from './pages/OrganizationSettingsPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { OrdersPage } from './pages/OrdersPage'
import { UsersSettingsPage } from './pages/UsersSettingsPage'
import { LoginPage, RegisterPage } from './pages/authPages'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<OnboardingRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/new" element={<NewOrderPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/installations" element={<InstallationsPage />} />
          <Route
            path="/settings/organization"
            element={<OrganizationSettingsPage />}
          />
          <Route path="/settings/users" element={<UsersSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
