'use client'

import { ChefHat, Package, Store, X } from 'lucide-react'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

import { type TabItem, tabKey } from './types'

const TAB_ICONS = {
  product: Package,
  supplier: Store,
  recipe: ChefHat,
} as const

interface TabBarProps {
  tabs: TabItem[]
  activeTabKey: string | null
  onSelect: (key: string) => void
  onClose: (key: string) => void
}

export function TabBar({ tabs, activeTabKey, onSelect, onClose }: TabBarProps) {
  return (
    <ScrollArea className="border-b">
      <div className="flex">
        {tabs.map((tab, index) => {
          const key = tabKey(tab)
          const isActive = key === activeTabKey
          const Icon = TAB_ICONS[tab.type]

          return (
            <div
              key={key}
              className={`group flex shrink-0 items-center gap-1.5 border-r px-3 py-2 text-sm ${
                isActive
                  ? 'bg-background text-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <button
                type="button"
                className="flex items-center gap-1.5"
                onClick={() => onSelect(key)}
              >
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <Icon className="h-3.5 w-3.5 group-hover:opacity-0" />
                  {index < 9 && (
                    <kbd className="absolute inset-0 flex items-center justify-center rounded border text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100">
                      {index + 1}
                    </kbd>
                  )}
                </span>
                <span className="max-w-[120px] truncate">{tab.label}</span>
              </button>
              <button
                type="button"
                className="rounded-sm opacity-0 hover:bg-accent group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose(key)
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
