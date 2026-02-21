import { createUploadRouter } from '@app/uploadthing'

import { auth } from '@/lib/auth'

export const uploadRouter = createUploadRouter({
  authenticate: async (req) => {
    const session = await auth.api.getSession({ headers: req.headers })
    return session ? { userId: session.user.id } : null
  },
})

export type UploadRouter = typeof uploadRouter
