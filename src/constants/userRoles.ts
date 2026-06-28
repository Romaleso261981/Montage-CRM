import type { UserRole } from '../types/user'

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Власник',
  admin: 'Адміністратор',
  manager: 'Менеджер',
  installer: 'Монтажник',
}

export function canManageOrganization(role: UserRole): boolean {
  return role === 'owner' || role === 'admin'
}
