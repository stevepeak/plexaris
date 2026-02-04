import { appRouter, type Context } from '@app/api'
import { createDb } from '@app/db'
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
      return {
        db,
        session: result
          ? {
              user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
              },
            }
          : null,
      }
    },
  })

export { handler as GET, handler as POST }
