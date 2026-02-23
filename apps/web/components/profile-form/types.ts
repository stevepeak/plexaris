export type PasskeyItem = {
  id: string
  name: string | null
  aaguid: string | null
  createdAt: string | null
}

export type OrgMembership = {
  id: string
  name: string
  roleName: string
  isAdmin: boolean
  soleAdmin: boolean
}

export type ContactPreference = 'message' | 'call'
