import { createDb, schema } from '@app/db'
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { z } from 'zod'

interface AuthResult {
  userId: string
}

interface CreateUploadRouterOptions {
  authenticate: (req: Request) => Promise<AuthResult | null>
}

export function createUploadRouter({
  authenticate,
}: CreateUploadRouterOptions): FileRouter {
  const f = createUploadthing()
  const db = createDb()

  return {
    organizationDocument: f({
      pdf: { maxFileSize: '16MB', maxFileCount: 10 },
      image: { maxFileSize: '16MB', maxFileCount: 10 },
      text: { maxFileSize: '16MB', maxFileCount: 10 },
      blob: { maxFileSize: '16MB', maxFileCount: 10 },
    })
      .input(z.object({ organizationId: z.string().uuid() }))
      .middleware(async ({ req, input }) => {
        const auth = await authenticate(req)
        if (!auth) {
          throw new UploadThingError('Unauthorized')
        }
        return { userId: auth.userId, organizationId: input.organizationId }
      })
      .onUploadComplete(async ({ metadata, file }) => {
        await db.insert(schema.file).values({
          organizationId: metadata.organizationId,
          name: file.name,
          mimeType: file.type ?? 'application/octet-stream',
          size: file.size,
          url: file.ufsUrl,
          key: file.key,
          createdAt: new Date(),
        })
        return { name: file.name }
      }),
  } satisfies FileRouter
}
