import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { auth } from '../lib/firebase'
import { getOrganizationById } from '../services/organizationsService'
import { getAppUserById } from '../services/usersService'
import type { Organization } from '../types/organization'
import type { AppUser } from '../types/user'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState(
    () => auth.currentUser,
  )
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (uid: string) => {
    const profile = await getAppUserById(uid)
    setAppUser(profile)
    if (profile?.organizationId) {
      const org = await getOrganizationById(profile.organizationId)
      setOrganization(org)
    } else {
      setOrganization(null)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        try {
          await loadProfile(user.uid)
        } catch {
          setAppUser(null)
          setOrganization(null)
        }
      } else {
        setAppUser(null)
        setOrganization(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [loadProfile])

  const refreshProfile = useCallback(async () => {
    if (!firebaseUser) return
    await loadProfile(firebaseUser.uid)
  }, [firebaseUser, loadProfile])

  const register = useCallback(async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    return cred.user
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  const value = useMemo(
    () => ({
      firebaseUser,
      appUser,
      organization,
      loading,
      register,
      login,
      logout,
      refreshProfile,
    }),
    [
      firebaseUser,
      appUser,
      organization,
      loading,
      register,
      login,
      logout,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
