import { and, createDb, eq, schema } from '@app/db'
import { logger, task } from '@trigger.dev/sdk'

interface Exhibitor {
  id: number
  slug: string
  name: string
  description: string | null
  longDescription: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: string | null
  countryCode: string | null
  logo: string | null
  stands: string[]
}

const BATCH_SIZE = 50

export const seedSuppliersTask = task({
  id: 'seed-suppliers',
  run: async (payload: {
    exhibitors: Exhibitor[]
  }): Promise<{ created: number; skipped: number; failed: number }> => {
    const { exhibitors } = payload
    logger.log('Starting supplier seeding', { total: exhibitors.length })

    const db = createDb()
    let created = 0
    let skipped = 0
    let failed = 0

    for (let i = 0; i < exhibitors.length; i += BATCH_SIZE) {
      const batch = exhibitors.slice(i, i + BATCH_SIZE)

      for (const exhibitor of batch) {
        try {
          // Deduplication: match on company name + type, including email when available
          const conditions = [
            eq(schema.organization.name, exhibitor.name),
            eq(schema.organization.type, 'supplier'),
          ]
          if (exhibitor.email) {
            conditions.push(eq(schema.organization.email, exhibitor.email))
          }

          const existing = await db
            .select({ id: schema.organization.id })
            .from(schema.organization)
            .where(and(...conditions))
            .limit(1)

          if (existing.length > 0) {
            logger.log(`Skipping duplicate: ${exhibitor.name}`)
            skipped++
            continue
          }

          const now = new Date()

          await db.insert(schema.organization).values({
            name: exhibitor.name,
            type: 'supplier',
            claimed: false,
            description:
              exhibitor.longDescription ?? exhibitor.description ?? null,
            logoUrl: exhibitor.logo ?? null,
            phone: exhibitor.phone ?? null,
            email: exhibitor.email ?? null,
            address: exhibitor.address ?? null,
            createdAt: now,
            updatedAt: now,
          })

          created++
        } catch (error) {
          logger.error(`Failed to seed supplier: ${exhibitor.name}`, {
            error: String(error),
          })
          failed++
        }
      }

      logger.log(
        `Processed ${Math.min(i + BATCH_SIZE, exhibitors.length)}/${exhibitors.length}`,
        { created, skipped, failed },
      )
    }

    logger.log('Supplier seeding complete', { created, skipped, failed })
    return { created, skipped, failed }
  },
})
