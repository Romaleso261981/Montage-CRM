import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { removeUndefinedFields } from '../lib/firestoreSanitize'
import type {
  CreateOrderInput,
  Order,
  UpdateOrderInput,
} from '../types/order'

const COLLECTION = 'orders'

export type CreateOrderPayload = CreateOrderInput & { createdBy: string }

export async function createOrder(
  organizationId: string,
  data: CreateOrderPayload,
): Promise<string> {
  const payload = removeUndefinedFields({
    organizationId,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  const ref = await addDoc(collection(db, COLLECTION), payload)
  return ref.id
}

export async function getOrdersByOrganizationId(
  organizationId: string,
): Promise<Order[]> {
  const q = query(
    collection(db, COLLECTION),
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order)
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COLLECTION, orderId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Order
}

export async function updateOrder(
  orderId: string,
  data: UpdateOrderInput,
): Promise<void> {
  await updateDoc(
    doc(db, COLLECTION, orderId),
    removeUndefinedFields({
      ...data,
      updatedAt: serverTimestamp(),
    }),
  )
}

export async function deleteOrder(orderId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, orderId))
}

/** Orders with scheduled installation (for /installations). */
export async function getInstallationsByOrganizationId(
  organizationId: string,
): Promise<Order[]> {
  const orders = await getOrdersByOrganizationId(organizationId)
  return orders.filter(
    (o) =>
      o.installationDate &&
      o.status !== 'cancelled' &&
      o.status !== 'completed',
  )
}
