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
import { profileLoadErrorMessage } from '../components/ProfileLoadErrorScreen'
import { auth } from '../lib/firebase'
import { getOrganizationById } from '../services/organizationsService'
import { getAppUserById } from '../services/usersService'
import type { Organization } from '../types/organization'
import type { AppUser } from '../types/user'
import { AuthContext } from './auth-context'

async function loadProfileWithRetry(
  load: (uid: string) => Promise<void>,
  uid: string,
  attempts = 3,
): Promise<void> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      await load(uid)
      return
    } catch (err) {
      lastError = err
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 350 * (i + 1)))
      }
    }
  }
  throw lastError
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState(
    () => auth.currentUser,
  )
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileRetrying, setProfileRetrying] = useState(false)

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

  const hydrateUser = useCallback(
    async (user: NonNullable<typeof auth.currentUser>) => {
      setProfileError(null)
      await loadProfileWithRetry(loadProfile, user.uid)
    },
    [loadProfile],
  )

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
      if (!user) {
        setAppUser(null)
        setOrganization(null)
        setProfileError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      void hydrateUser(user)
        .catch((err) => {
          setAppUser(null)
          setOrganization(null)
          setProfileError(profileLoadErrorMessage(err))
        })
        .finally(() => setLoading(false))
    })
    return unsubscribe
  }, [hydrateUser])

  const refreshProfile = useCallback(async () => {
    if (!firebaseUser) return
    setProfileRetrying(true)
    setProfileError(null)
    try {
      await loadProfileWithRetry(loadProfile, firebaseUser.uid)
    } catch (err) {
      setProfileError(profileLoadErrorMessage(err))
    } finally {
      setProfileRetrying(false)
    }
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
      profileError,
      profileRetrying,
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
      profileError,
      profileRetrying,
      register,
      login,
      logout,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
