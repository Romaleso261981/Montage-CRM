import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type {
  CreateOrganizationInput,
  Organization,
  UpdateOrganizationInput,
} from '../types/organization'

const COLLECTION = 'organizations'

export async function createOrganization(
  data: CreateOrganizationInput,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    name: data.name,
    phone: data.phone ?? null,
    city: data.city ?? null,
    email: data.email ?? null,
    ownerId: data.ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getOrganizationById(
  organizationId: string,
): Promise<Organization | null> {
  const snap = await getDoc(doc(db, COLLECTION, organizationId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Organization
}

export async function updateOrganization(
  organizationId: string,
  data: UpdateOrganizationInput,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, organizationId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}
