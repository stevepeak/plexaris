'use client'

import {
  AlertTriangle,
  Bot,
  Lightbulb,
  type LucideIcon,
  RotateCcw,
  ShoppingCart,
  UserCheck,
  UserPlus,
  XCircle,
} from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { trpc } from '@/lib/trpc'

type NotificationType =
  | 'order_placed'
  | 'order_cancelled'
  | 'order_returned'
  | 'user_invited'
  | 'user_accepted_invite'
  | 'order_issues'
  | 'agent_suggestion_found'
  | 'agent_completed'

type Channel = 'email' | 'sms' | 'inApp'

type Preference = {
  notificationType: NotificationType
  email: boolean
  sms: boolean
  inApp: boolean
}

type NotificationItem = {
  type: NotificationType
  label: string
  description: string
  icon: LucideIcon
}

const NOTIFICATION_GROUPS: {
  label: string
  items: NotificationItem[]
}[] = [
  {
    label: 'Orders',
    items: [
      {
        type: 'order_placed',
        label: 'Order placed',
        description: 'When a new order is submitted',
        icon: ShoppingCart,
      },
      {
        type: 'order_cancelled',
        label: 'Order cancelled',
        description: 'When an order is cancelled',
        icon: XCircle,
      },
      {
        type: 'order_returned',
        label: 'Order returned',
        description: 'When an order is returned',
        icon: RotateCcw,
      },
      {
        type: 'order_issues',
        label: 'Order issues',
        description: 'When there are problems with an order',
        icon: AlertTriangle,
      },
    ],
  },
  {
    label: 'Team',
    items: [
      {
        type: 'user_invited',
        label: 'User invited',
        description: 'When a new member is invited',
        icon: UserPlus,
      },
      {
        type: 'user_accepted_invite',
        label: 'User accepted invite',
        description: 'When an invited member joins',
        icon: UserCheck,
      },
    ],
  },
  {
    label: 'Agents',
    items: [
      {
        type: 'agent_suggestion_found',
        label: 'Suggestion found',
        description: 'When an agent finds a new suggestion',
        icon: Lightbulb,
      },
      {
        type: 'agent_completed',
        label: 'Agent completed',
        description: 'When an agent finishes its task',
        icon: Bot,
      },
    ],
  },
]

export function NotificationSettingsFormFields({
  preferences,
  isPending,
  onToggle,
}: {
  preferences: Preference[]
  isPending: boolean
  onToggle: (type: NotificationType, channel: Channel, enabled: boolean) => void
}) {
  const prefMap = new Map(preferences.map((p) => [p.notificationType, p]))

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        <div className="h-px bg-border" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex gap-6">
              <div className="h-5 w-9 animate-pulse rounded-full bg-muted" />
              <div className="h-5 w-9 animate-pulse rounded-full bg-muted" />
              <div className="h-5 w-9 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Notifications</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        These are your personal notification preferences. They do not affect
        other members of this organization.
      </p>
      <Separator className="my-6" />

      <div className="space-y-8">
        {NOTIFICATION_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 className="mb-2 text-sm font-semibold">{group.label}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead className="w-16 text-center">Email</TableHead>
                  <TableHead className="w-16 text-center">SMS</TableHead>
                  <TableHead className="w-16 text-center">In-app</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.items.map((item) => {
                  const pref = prefMap.get(item.type) ?? {
                    email: true,
                    sms: true,
                    inApp: true,
                  }
                  const Icon = item.icon

                  return (
                    <TableRow key={item.type}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={pref.email}
                          onCheckedChange={(checked) =>
                            onToggle(item.type, 'email', checked)
                          }
                          aria-label={`${item.label} email`}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex">
                                <Switch
                                  checked={false}
                                  disabled
                                  aria-label={`${item.label} SMS`}
                                />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Coming soon</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={pref.inApp}
                          onCheckedChange={(checked) =>
                            onToggle(item.type, 'inApp', checked)
                          }
                          aria-label={`${item.label} in-app`}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </div>
  )
}

export function NotificationSettings({
  organizationId,
}: {
  organizationId: string
}) {
  const utils = trpc.useUtils()

  const { data, isLoading } = trpc.notification.getPreferences.useQuery({
    organizationId,
  })

  const updateMutation = trpc.notification.updatePreference.useMutation({
    onMutate: async (variables) => {
      await utils.notification.getPreferences.cancel({ organizationId })

      const previous = utils.notification.getPreferences.getData({
        organizationId,
      })

      utils.notification.getPreferences.setData({ organizationId }, (old) => {
        if (!old) return old
        return old.map((pref) =>
          pref.notificationType === variables.notificationType
            ? { ...pref, [variables.channel]: variables.enabled }
            : pref,
        )
      })

      return { previous }
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        utils.notification.getPreferences.setData(
          { organizationId },
          context.previous,
        )
      }
    },
    onSettled: () => {
      void utils.notification.getPreferences.invalidate({ organizationId })
    },
  })

  const handleToggle = (
    type: NotificationType,
    channel: Channel,
    enabled: boolean,
  ) => {
    updateMutation.mutate({
      organizationId,
      notificationType: type,
      channel,
      enabled,
    })
  }

  return (
    <NotificationSettingsFormFields
      preferences={data ?? []}
      isPending={isLoading}
      onToggle={handleToggle}
    />
  )
}
