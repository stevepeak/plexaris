import { appRouter, type Context } from '@app/api'
import { createDb, eq, schema } from '@app/db'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { auth } from '@/lib/auth'

const db = createDb()

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async (): Promise<Context> => {
      const result = await auth.api.getSession({ headers: req.headers })
      if (!result) return { db, session: null }

      const [row] = await db
        .select({ superAdmin: schema.user.superAdmin })
        .from(schema.user)
        .where(eq(schema.user.id, result.user.id))
        .limit(1)

      return {
        db,
        session: {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            superAdmin: row?.superAdmin ?? false,
          },
        },
      }
    },
  })

export { handler as GET, handler as POST }
