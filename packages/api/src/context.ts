import { type DB } from '@app/db'

export interface Context {
  db: DB
  session: {
    user: {
      id: string
      name: string
      email: string
      superAdmin: boolean
    }
  } | null
  captureException: (error: unknown, extra?: Record<string, unknown>) => void
}
