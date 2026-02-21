'use client'

import {
  AlertTriangle,
  Bot,
  Lightbulb,
  type LucideIcon,
  Mail,
  RotateCcw,
  ShoppingCart,
  Smartphone,
  UserCheck,
  UserPlus,
  XCircle,
} from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'

type NotificationType =
  | 'order_placed'
  | 'order_cancelled'
  | 'order_returned'
  | 'user_invited'
  | 'user_accepted_invite'
  | 'order_issues'
  | 'agent_suggestion_found'
  | 'agent_completed'

type Channel = 'email' | 'sms'

type Preference = {
  notificationType: NotificationType
  email: boolean
  sms: boolean
}

type NotificationItem = {
  type: NotificationType
  label: string
  description: string
  icon: LucideIcon
}

const NOTIFICATION_GROUPS: {
  label: string
  description: string
  items: NotificationItem[]
}[] = [
  {
    label: 'Orders',
    description: 'Activity on orders you manage',
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
    description: 'Members joining your organization',
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
    description: 'Updates from your AI agents',
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

function ChannelToggle({
  icon,
  label,
  checked,
  disabled,
  tooltip,
  onCheckedChange,
  ariaLabel,
}: {
  icon: LucideIcon
  label: string
  checked: boolean
  disabled?: boolean
  tooltip?: string
  onCheckedChange?: (checked: boolean) => void
  ariaLabel: string
}) {
  const IconComponent = icon
  const content = (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors',
        disabled && 'cursor-not-allowed opacity-50',
        checked
          ? 'border-primary/20 bg-primary/5'
          : 'border-transparent bg-muted/50',
      )}
    >
      <IconComponent className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={ariaLabel}
        className="scale-[0.85]"
      />
    </label>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return content
}

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
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="flex items-center gap-4 py-2">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
                  <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Notifications</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose how you want to be notified. These preferences are personal and
        do not affect other members.
      </p>
      <Separator className="my-6" />

      <div className="space-y-6">
        {NOTIFICATION_GROUPS.map((group) => (
          <div key={group.label} className="rounded-xl border">
            <div className="flex items-center gap-3 border-b px-5 py-3.5">
              <h3 className="text-sm font-semibold">{group.label}</h3>
              <span className="text-xs text-muted-foreground">
                {group.description}
              </span>
            </div>
            <div className="divide-y">
              {group.items.map((item) => {
                const pref = prefMap.get(item.type) ?? {
                  email: true,
                  sms: true,
                }
                const Icon = item.icon

                return (
                  <div
                    key={item.type}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <ChannelToggle
                        icon={Mail}
                        label="Email"
                        checked={pref.email}
                        onCheckedChange={(checked) =>
                          onToggle(item.type, 'email', checked)
                        }
                        ariaLabel={`${item.label} email`}
                      />
                      <ChannelToggle
                        icon={Smartphone}
                        label="SMS"
                        checked={false}
                        disabled
                        tooltip="Coming soon"
                        ariaLabel={`${item.label} SMS`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
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
