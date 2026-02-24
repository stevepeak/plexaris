'use client'

import { LingoProvider as Base } from '@lingo.dev/compiler/react'
import { type ReactNode } from 'react'

export function LingoProvider({ children }: { children: ReactNode }) {
  return <Base>{children}</Base>
}
