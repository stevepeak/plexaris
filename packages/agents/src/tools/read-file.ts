import { createDb, eq, schema } from '@app/db'
import { tool } from 'ai'
import { z } from 'zod'

/**
 * Tool that reads an uploaded file from the `file` table by ID and returns
 * its metadata plus content as a UTF-8 string.
 */
export function createReadFileTool() {
  return tool({
    description:
      'Read an uploaded file from the database by its ID. Returns the file name, MIME type, and content as text.',
    inputSchema: z.object({
      fileId: z.string().uuid().describe('The UUID of the file to read'),
    }),
    execute: async ({ fileId }) => {
      const db = createDb()
      const rows = await db
        .select({
          id: schema.file.id,
          name: schema.file.name,
          mimeType: schema.file.mimeType,
          size: schema.file.size,
          content: schema.file.content,
        })
        .from(schema.file)
        .where(eq(schema.file.id, fileId))
        .limit(1)

      if (rows.length === 0) {
        return JSON.stringify({ error: `File not found: ${fileId}` })
      }

      const row = rows[0]
      return JSON.stringify({
        id: row.id,
        name: row.name,
        mimeType: row.mimeType,
        size: row.size,
        content: row.content.toString('utf-8'),
      })
    },
  })
}
