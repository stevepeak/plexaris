'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface ActivityEntry {
  id: string
  action:
    | 'order_created'
    | 'item_added'
    | 'item_removed'
    | 'item_quantity_changed'
    | 'item_supplier_changed'
    | 'order_submitted'
    | 'order_confirmed'
    | 'order_cancelled'
    | 'note_updated'
  itemName: string
  detail: string
  timestamp: Date
  user?: {
    name: string
    avatarUrl?: string
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTimestamp(date: Date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const ACTION_LABELS: Record<ActivityEntry['action'], string> = {
  order_created: 'Order created',
  item_added: 'Added',
  item_removed: 'Removed',
  item_quantity_changed: 'Qty changed',
  item_supplier_changed: 'Supplier changed',
  order_submitted: 'Submitted',
  order_confirmed: 'Confirmed',
  order_cancelled: 'Cancelled',
  note_updated: 'Note updated',
}

interface ActivityLogProps {
  entries: ActivityEntry[]
}

export function ActivityLog({ entries }: ActivityLogProps) {
  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Time</TableHead>
              <TableHead className="min-w-[100px]">User</TableHead>
              <TableHead className="min-w-[120px]">Action</TableHead>
              <TableHead className="min-w-[160px]">Item</TableHead>
              <TableHead className="min-w-[180px]">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </TableCell>
                <TableCell>
                  {entry.user ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        {entry.user.avatarUrl && (
                          <AvatarImage
                            src={entry.user.avatarUrl}
                            alt={entry.user.name}
                          />
                        )}
                        <AvatarFallback className="text-[8px]">
                          {getInitials(entry.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-xs">
                        {entry.user.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-xs">{ACTION_LABELS[entry.action]}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium">{entry.itemName}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {entry.detail}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
