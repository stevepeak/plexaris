'use i18n'
import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type KbdProps = {
  children: ReactNode
  className?: string
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd className={cn('rounded border px-1 font-mono text-[10px]', className)}>
      {children}
    </kbd>
  )
}
