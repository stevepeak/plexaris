import { and, createDb, eq, isNull, schema } from '@app/db'
import { logger, task } from '@trigger.dev/sdk'

const CLAIM_BASE_URL = 'https://leftman.com/claim'

export const exportOutreachCsvTask = task({
  id: 'export-outreach-csv',
  run: async (payload?: {
    claimBaseUrl?: string
  }): Promise<{
    csv: string
    totalRows: number
  }> => {
    const db = createDb()
    const baseUrl = payload?.claimBaseUrl ?? CLAIM_BASE_URL

    // Join unclaimed suppliers with their unused claim tokens
    const rows = await db
      .select({
        companyName: schema.organization.name,
        email: schema.claimToken.email,
        token: schema.claimToken.token,
      })
      .from(schema.claimToken)
      .innerJoin(
        schema.organization,
        eq(schema.claimToken.organizationId, schema.organization.id),
      )
      .where(
        and(
          eq(schema.organization.type, 'supplier'),
          eq(schema.organization.claimed, false),
          isNull(schema.claimToken.usedAt),
        ),
      )

    logger.log('Found unclaimed suppliers with tokens', { total: rows.length })

    // Build CSV
    const header = 'company_name,email,claim_url'
    const csvRows = rows.map((row) => {
      const name = escapeCsvField(row.companyName)
      const email = escapeCsvField(row.email)
      const claimUrl = `${baseUrl}/${row.token}`
      return `${name},${email},${claimUrl}`
    })

    const csv = [header, ...csvRows].join('\n')

    logger.log('CSV export complete', { totalRows: rows.length })
    return { csv, totalRows: rows.length }
  },
})

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
