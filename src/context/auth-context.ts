import { createContext } from 'react'
import type { User } from 'firebase/auth'
import type { Organization } from '../types/organization'
import type { AppUser } from '../types/user'

export type AuthContextValue = {
  firebaseUser: User | null
  appUser: AppUser | null
  organization: Organization | null
  loading: boolean
  register: (email: string, password: string) => Promise<User>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
