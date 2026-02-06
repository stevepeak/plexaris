import { createDb, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: organizationId } = await params

  const formData = await request.formData()
  const files = formData.getAll('files') as File[]

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  const now = new Date()
  const inserted = []

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File "${file.name}" exceeds the 5MB size limit` },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const [row] = await db
      .insert(schema.file)
      .values({
        organizationId,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        content: buffer,
        createdAt: now,
      })
      .returning({ id: schema.file.id, name: schema.file.name })

    inserted.push(row)
  }

  return NextResponse.json({ files: inserted }, { status: 201 })
}
