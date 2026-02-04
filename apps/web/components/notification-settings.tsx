'use client'

import {
  AlertTriangle,
  type LucideIcon,
  RotateCcw,
  ShoppingCart,
  UserCheck,
  UserPlus,
  XCircle,
} from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { trpc } from '@/lib/trpc'

type NotificationType =
  | 'order_placed'
  | 'order_cancelled'
  | 'order_returned'
  | 'user_invited'
  | 'user_accepted_invite'
  | 'order_issues'

type Channel = 'email' | 'sms' | 'inApp'

type Preference = {
  notificationType: NotificationType
  email: boolean
  sms: boolean
  inApp: boolean
}

const NOTIFICATION_CONFIG: {
  type: NotificationType
  label: string
  description: string
  icon: LucideIcon
  colorClass: string
}[] = [
  {
    type: 'order_placed',
    label: 'Order placed',
    description: 'When a new order is submitted',
    icon: ShoppingCart,
    colorClass:
      'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
  },
  {
    type: 'order_cancelled',
    label: 'Order cancelled',
    description: 'When an order is cancelled',
    icon: XCircle,
    colorClass: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  },
  {
    type: 'order_returned',
    label: 'Order returned',
    description: 'When an order is returned',
    icon: RotateCcw,
    colorClass:
      'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  },
  {
    type: 'user_invited',
    label: 'User invited',
    description: 'When a new member is invited',
    icon: UserPlus,
    colorClass:
      'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  },
  {
    type: 'user_accepted_invite',
    label: 'User accepted invite',
    description: 'When an invited member joins',
    icon: UserCheck,
    colorClass:
      'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
  },
  {
    type: 'order_issues',
    label: 'Order issues',
    description: 'When there are problems with an order',
    icon: AlertTriangle,
    colorClass:
      'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
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
          <div key={i} className="flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
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

      <div className="mb-4 hidden items-center sm:flex">
        <div className="flex-1" />
        <div className="flex w-[180px] shrink-0 justify-between text-xs font-medium text-muted-foreground">
          <span className="w-9 text-center">Email</span>
          <span className="w-9 text-center">SMS</span>
          <span className="w-9 text-center">In-app</span>
        </div>
      </div>

      <div className="grid gap-4">
        {NOTIFICATION_CONFIG.map((config) => {
          const pref = prefMap.get(config.type) ?? {
            email: true,
            sms: true,
            inApp: true,
          }
          const Icon = config.icon

          return (
            <div key={config.type} className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.colorClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{config.label}</p>
                <p className="text-xs text-muted-foreground">
                  {config.description}
                </p>
              </div>
              <div className="flex w-[180px] shrink-0 justify-between">
                <Switch
                  checked={pref.email}
                  onCheckedChange={(checked) =>
                    onToggle(config.type, 'email', checked)
                  }
                  aria-label={`${config.label} email`}
                />
                <Switch
                  checked={pref.sms}
                  onCheckedChange={(checked) =>
                    onToggle(config.type, 'sms', checked)
                  }
                  aria-label={`${config.label} SMS`}
                />
                <Switch
                  checked={pref.inApp}
                  onCheckedChange={(checked) =>
                    onToggle(config.type, 'inApp', checked)
                  }
                  aria-label={`${config.label} in-app`}
                />
              </div>
            </div>
          )
        })}
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
