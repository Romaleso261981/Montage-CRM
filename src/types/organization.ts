import type { Timestamp } from 'firebase/firestore'

export type Organization = {
  id: string
  name: string
  phone?: string
  city?: string
  email?: string
  ownerId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type CreateOrganizationInput = {
  name: string
  phone?: string
  city?: string
  email?: string
  ownerId: string
}

export type UpdateOrganizationInput = Partial<
  Pick<Organization, 'name' | 'phone' | 'city' | 'email'>
>
