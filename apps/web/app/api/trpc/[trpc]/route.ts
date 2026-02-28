import { appRouter, type Context } from '@app/api'
import { createDb, eq, schema } from '@app/db'
import { identifyPostHogUser } from '@app/posthog'
import * as Sentry from '@sentry/nextjs'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { auth } from '@/lib/auth'

const db = createDb()

const CLIENT_ERROR_CODES = new Set([
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'PARSE_ERROR',
])

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async (): Promise<Context> => {
      const result = await auth.api.getSession({ headers: req.headers })
      if (!result) {
        return { db, session: null, captureException: Sentry.captureException }
      }

      const [row] = await db
        .select({ superAdmin: schema.user.superAdmin })
        .from(schema.user)
        .where(eq(schema.user.id, result.user.id))
        .limit(1)

      const superAdmin = row?.superAdmin ?? false

      identifyPostHogUser(result.user.id, {
        email: result.user.email,
        name: result.user.name,
        is_employee: superAdmin,
      })

      return {
        db,
        session: {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            superAdmin,
          },
        },
        captureException: Sentry.captureException,
      }
    },
    onError: ({ error, path }) => {
      if (CLIENT_ERROR_CODES.has(error.code)) return
      Sentry.captureException(error, { extra: { path } })
    },
  })

export { handler as GET, handler as POST }
