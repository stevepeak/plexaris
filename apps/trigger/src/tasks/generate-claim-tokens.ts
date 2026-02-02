import { and, createDb, eq, isNull, schema } from '@app/db'
import { logger, task } from '@trigger.dev/sdk'

const BATCH_SIZE = 50
const EXPIRY_DAYS = 90

export const generateClaimTokensTask = task({
  id: 'generate-claim-tokens',
  run: async (): Promise<{
    generated: number
    skipped: number
    failed: number
  }> => {
    const db = createDb()
    let generated = 0
    let skipped = 0
    let failed = 0

    // Find all unclaimed supplier organizations
    const suppliers = await db
      .select({
        id: schema.organization.id,
        name: schema.organization.name,
        email: schema.organization.email,
      })
      .from(schema.organization)
      .where(
        and(
          eq(schema.organization.type, 'supplier'),
          eq(schema.organization.status, 'unclaimed'),
        ),
      )

    logger.log('Found unclaimed suppliers', { total: suppliers.length })

    for (let i = 0; i < suppliers.length; i += BATCH_SIZE) {
      const batch = suppliers.slice(i, i + BATCH_SIZE)

      for (const supplier of batch) {
        try {
          if (!supplier.email) {
            logger.log(`Skipping supplier without email: ${supplier.name}`)
            skipped++
            continue
          }

          // Check if an unused token already exists for this organization
          const existingToken = await db
            .select({ id: schema.claimToken.id })
            .from(schema.claimToken)
            .where(
              and(
                eq(schema.claimToken.organizationId, supplier.id),
                isNull(schema.claimToken.usedAt),
              ),
            )
            .limit(1)

          if (existingToken.length > 0) {
            logger.log(
              `Skipping supplier with existing token: ${supplier.name}`,
            )
            skipped++
            continue
          }

          const now = new Date()
          const expiresAt = new Date(now)
          expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS)

          await db.insert(schema.claimToken).values({
            id: crypto.randomUUID(),
            organizationId: supplier.id,
            email: supplier.email,
            token: crypto.randomUUID(),
            expiresAt,
            createdAt: now,
          })

          generated++
        } catch (error) {
          logger.error(`Failed to generate token for: ${supplier.name}`, {
            error: String(error),
          })
          failed++
        }
      }

      logger.log(
        `Processed ${Math.min(i + BATCH_SIZE, suppliers.length)}/${suppliers.length}`,
        { generated, skipped, failed },
      )
    }

    logger.log('Claim token generation complete', {
      generated,
      skipped,
      failed,
    })
    return { generated, skipped, failed }
  },
})
