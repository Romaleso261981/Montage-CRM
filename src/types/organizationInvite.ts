import type { Timestamp } from 'firebase/firestore'
import type { UserRole } from './user'

/** Reserved for future employee invites — not wired in UI yet. */
export type OrganizationInvite = {
  id: string
  organizationId: string
  email: string
  role: UserRole
  inviteCode: string
  status: 'pending' | 'accepted' | 'expired'
  createdAt: Timestamp
  expiresAt?: Timestamp
}
