import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { AppUser, CreateAppUserInput } from '../types/user'

const COLLECTION = 'users'

export async function createAppUser(data: CreateAppUserInput): Promise<void> {
  await setDoc(doc(db, COLLECTION, data.id), {
    email: data.email,
    displayName: data.displayName ?? null,
    organizationId: data.organizationId,
    role: data.role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getAppUserById(userId: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, COLLECTION, userId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as AppUser
}

export async function getUsersByOrganizationId(
  organizationId: string,
): Promise<AppUser[]> {
  const q = query(
    collection(db, COLLECTION),
    where('organizationId', '==', organizationId),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppUser)
}
