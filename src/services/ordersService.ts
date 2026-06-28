import { FirebaseError } from 'firebase/app'
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
  type FieldValue,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { removeUndefinedFields } from '../lib/firestoreSanitize'
import type {
  CreateOrderInput,
  Order,
  OrderSaleDetails,
  UpdateOrderInput,
} from '../types/order'

const COLLECTION = 'orders'

function mapOrderDocs(docs: { id: string; data: () => unknown }[]): Order[] {
  return docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Order)
}

function sortOrdersByCreatedAtDesc(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0
    const tb = b.createdAt?.toMillis?.() ?? 0
    return tb - ta
  })
}

export type CreateOrderPayload = CreateOrderInput & { createdBy: string }

export async function createOrder(
  organizationId: string,
  data: CreateOrderPayload,
): Promise<string> {
  if (!organizationId?.trim()) {
    throw new Error('organizationId is required')
  }
  if (!data.createdBy?.trim()) {
    throw new Error('createdBy is required')
  }

  const ref = await addDoc(collection(db, COLLECTION), {
    ...removeUndefinedFields({
      organizationId: organizationId.trim(),
      ...data,
    }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getOrdersByOrganizationId(
  organizationId: string,
): Promise<Order[]> {
  const base = collection(db, COLLECTION)
  const filtered = query(base, where('organizationId', '==', organizationId))

  try {
    const q = query(filtered, orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return mapOrderDocs(snap.docs)
  } catch (err) {
    if (err instanceof FirebaseError && err.code === 'failed-precondition') {
      const snap = await getDocs(filtered)
      return sortOrdersByCreatedAtDesc(mapOrderDocs(snap.docs))
    }
    throw err
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COLLECTION, orderId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Order
}

export type OrderUpdatePayload = Omit<UpdateOrderInput, 'saleDetails'> & {
  saleDetails?: OrderSaleDetails | FieldValue
}

export async function updateOrder(
  orderId: string,
  data: OrderUpdatePayload,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, orderId), {
    ...removeUndefinedFields(data),
    updatedAt: serverTimestamp(),
  })
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
