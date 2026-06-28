import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'owner' | 'admin' | 'manager' | 'installer'

export type AppUser = {
  id: string
  email: string
  displayName?: string
  organizationId: string
  role: UserRole
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type CreateAppUserInput = {
  id: string
  email: string
  displayName?: string
  organizationId: string
  role: UserRole
}
