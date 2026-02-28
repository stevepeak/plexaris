import { createDb, eq, schema } from '@app/db'
import { tool } from 'ai'
import * as XLSX from 'xlsx'
import { z } from 'zod'

const EXCEL_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
])

/**
 * Tool that reads an uploaded file by ID. Fetches the file content from
 * Cloudinary and returns metadata plus content as a UTF-8 string.
 */
export function createReadFileTool() {
  return tool({
    description:
      'Read an uploaded file by its ID. Returns the file name, MIME type, and content as text.',
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
          url: schema.file.url,
        })
        .from(schema.file)
        .where(eq(schema.file.id, fileId))
        .limit(1)

      if (rows.length === 0) {
        return JSON.stringify({ error: `File not found: ${fileId}` })
      }

      const row = rows[0]
      const res = await fetch(row.url)
      if (!res.ok) {
        return JSON.stringify({
          error: `Failed to fetch file content: ${res.status}`,
        })
      }

      let content: string

      if (EXCEL_MIME_TYPES.has(row.mimeType)) {
        try {
          const buffer = await res.arrayBuffer()
          const workbook = XLSX.read(buffer, { type: 'array' })
          content = workbook.SheetNames.map((name) => {
            const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name])
            return `--- Sheet: ${name} ---\n${csv}`
          }).join('\n\n')
        } catch {
          return JSON.stringify({
            error: `Failed to parse Excel file: ${row.name}. The file may be corrupted or password-protected.`,
          })
        }
      } else {
        content = await res.text()
      }

      return JSON.stringify({
        id: row.id,
        name: row.name,
        mimeType: row.mimeType,
        size: row.size,
        content,
      })
    },
  })
}
