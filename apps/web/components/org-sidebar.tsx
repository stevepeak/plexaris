'use client'

import {
  Activity,
  BarChart3,
  Bell,
  Cable,
  Calendar,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  type LucideIcon,
  Package,
  Plug,
  ScrollText,
  Settings,
  Shield,
  ShoppingCart,
  TriangleAlert,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useOrg } from '@/components/org-context'
import { Separator } from '@/components/ui/separator'
import { hasPermission } from '@/lib/permissions-client'
import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'

type NavItem =
  | {
      kind: 'link'
      path: string
      label: string
      icon: LucideIcon
      iconColor: string
      parent?: boolean
      orgType?: 'supplier' | 'horeca'
      permission?: string
    }
  | { kind: 'separator' }
  | {
      kind: 'label'
      label: string
      icon: LucideIcon
      iconColor: string
      orgType?: 'supplier' | 'horeca'
    }

const NAV_CONFIG: NavItem[] = [
  {
    kind: 'link',
    path: '',
    label: 'Dashboard',
    icon: LayoutDashboard,
    iconColor: 'text-blue-500',
  },
  { kind: 'separator' },
  {
    kind: 'link',
    path: '/orders',
    label: 'Orders',
    icon: ShoppingCart,
    iconColor: 'text-emerald-500',
  },
  {
    kind: 'link',
    path: '/products',
    label: 'Products',
    icon: Package,
    iconColor: 'text-amber-500',
    orgType: 'supplier',
  },
  { kind: 'separator' },
  {
    kind: 'link',
    path: '/insights',
    label: 'Insights',
    icon: BarChart3,
    iconColor: 'text-indigo-500',
  },
  {
    kind: 'link',
    path: '/suggestions',
    label: 'Suggestions',
    icon: Lightbulb,
    iconColor: 'text-yellow-500',
  },
  {
    kind: 'link',
    path: '/align',
    label: 'Align',
    icon: FlaskConical,
    iconColor: 'text-orange-500',
    orgType: 'supplier',
  },
  { kind: 'separator' },
  {
    kind: 'link',
    path: '/integrations',
    label: 'Integrations',
    icon: Plug,
    iconColor: 'text-pink-500',
  },
  {
    kind: 'link',
    path: '/mcp',
    label: 'MCP',
    icon: Cable,
    iconColor: 'text-teal-500',
  },
  {
    kind: 'label',
    label: 'Agents',
    icon: Zap,
    iconColor: 'text-violet-500',
    orgType: 'supplier',
  },
  {
    kind: 'link',
    path: '/agents/schedules',
    label: 'Schedules',
    icon: Calendar,
    iconColor: 'text-violet-400',
    parent: true,
    orgType: 'supplier',
  },
  {
    kind: 'link',
    path: '/agents/runs',
    label: 'Runs',
    icon: Activity,
    iconColor: 'text-violet-400',
    parent: true,
    orgType: 'supplier',
  },
  { kind: 'separator' },
  {
    kind: 'link',
    path: '/roles',
    label: 'Roles',
    icon: Shield,
    iconColor: 'text-orange-500',
    permission: 'manage_roles',
  },
  {
    kind: 'link',
    path: '/members',
    label: 'Team',
    icon: Users,
    iconColor: 'text-cyan-500',
  },
  {
    kind: 'link',
    path: '/audit',
    label: 'Audit',
    icon: ScrollText,
    iconColor: 'text-slate-500',
  },
  { kind: 'separator' },
  {
    kind: 'link',
    path: '/notifications',
    label: 'Notifications',
    icon: Bell,
    iconColor: 'text-rose-500',
  },
  {
    kind: 'link',
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    iconColor: 'text-gray-500',
  },
  { kind: 'separator' },
  {
    kind: 'link',
    path: '/danger-zone',
    label: 'Danger zone',
    icon: TriangleAlert,
    iconColor: 'text-rose-500',
  },
]

export function OrgSidebar() {
  const { organizationId, orgType, permissions, isAdmin } = useOrg()
  const pathname = usePathname()
  const basePath = `/orgs/${organizationId}`

  const { data: pendingCount } = trpc.suggestion.pendingCount.useQuery(
    { organizationId },
    { refetchInterval: 10000 },
  )

  const visibleItems = NAV_CONFIG.filter((item) => {
    if (item.kind === 'separator') return true
    if (item.kind === 'label') {
      return !item.orgType || item.orgType === orgType
    }
    if (item.orgType && item.orgType !== orgType) return false
    if (
      item.permission &&
      !isAdmin &&
      !hasPermission(permissions, item.permission)
    ) {
      return false
    }
    return true
  })

  return (
    <nav className="flex h-auto w-48 shrink-0 flex-col items-stretch gap-1 p-0">
      {visibleItems.map((item, i) => {
        if (item.kind === 'separator') {
          return <Separator key={`sep-${i}`} className="my-2" />
        }
        if (item.kind === 'label') {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="flex items-center gap-2 px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground"
            >
              <Icon className={cn('h-4 w-4', item.iconColor)} />
              {item.label}
            </div>
          )
        }
        const Icon = item.icon
        const href = `${basePath}${item.path}`
        const isActive =
          item.path === ''
            ? pathname === basePath || pathname === `${basePath}/`
            : pathname.startsWith(href)

        return (
          <Link
            key={item.path}
            href={href}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50',
              isActive && 'bg-muted',
              item.parent && 'pl-9',
            )}
          >
            <Icon className={cn('h-4 w-4', item.iconColor)} />
            {item.label}
            {item.path === '/suggestions' &&
              pendingCount &&
              pendingCount.count > 0 && (
                <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground">
                  {pendingCount.count}
                </span>
              )}
          </Link>
        )
      })}
    </nav>
  )
}
