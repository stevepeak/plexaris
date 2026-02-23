'use client'

import { useRouter } from 'next/navigation'

import { RelativeTime } from '@/components/relative-time'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type AdminOrg = {
  id: string
  name: string
  type: 'supplier' | 'horeca'
  logoUrl: string | null
  claimed: boolean
  createdAt: string
  lastInteraction: string
  orderCount: number
  suggestionCount: number
  productCount: number
  memberCount: number
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function AdminOrgsTable({ orgs }: { orgs: AdminOrg[] }) {
  const router = useRouter()

  if (orgs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No organizations found.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organization</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Members</TableHead>
          <TableHead className="text-right">Orders</TableHead>
          <TableHead className="text-right">Suggestions</TableHead>
          <TableHead className="text-right">Products</TableHead>
          <TableHead>Last Interaction</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orgs.map((org) => (
          <TableRow
            key={org.id}
            className="cursor-pointer"
            onClick={() => router.push(`/orgs/${org.id}/settings`)}
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 rounded-md text-xs">
                  {org.logoUrl && (
                    <AvatarImage src={org.logoUrl} alt={org.name} />
                  )}
                  <AvatarFallback className="rounded-md text-xs">
                    {getInitials(org.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{org.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {org.type}
              </Badge>
            </TableCell>
            <TableCell className="text-right">{org.memberCount}</TableCell>
            <TableCell className="text-right">{org.orderCount}</TableCell>
            <TableCell className="text-right">{org.suggestionCount}</TableCell>
            <TableCell className="text-right">{org.productCount}</TableCell>
            <TableCell>
              <RelativeTime date={org.lastInteraction} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
