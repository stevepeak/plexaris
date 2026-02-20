import { createDb, schema } from '@app/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

const db = createDb()

export const auth = betterAuth({
  // eslint-disable-next-line no-process-env
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
})
