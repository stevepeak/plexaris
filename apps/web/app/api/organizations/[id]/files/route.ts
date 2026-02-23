import { uploadFile } from '@app/cloudinary'
import { createDb, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { checkMembership } from '@/lib/permissions'

const MAX_FILES = 10
const MAX_SIZE = 16 * 1024 * 1024 // 16 MB

const db = createDb()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: orgId } = await params
  const membership = await checkMembership(session.user.id, orgId)
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const files = formData.getAll('file') as File[]

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Too many files (max ${MAX_FILES})` },
      { status: 400 },
    )
  }

  for (const file of files) {
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${file.name} (max 16MB)` },
        { status: 400 },
      )
    }
  }

  const results: { id: string; name: string; url: string }[] = []

  for (const file of files) {
    const { url, publicId } = await uploadFile(file, 'documents')

    const [row] = await db
      .insert(schema.file)
      .values({
        organizationId: orgId,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        url,
        key: publicId,
        createdAt: new Date(),
      })
      .returning({ id: schema.file.id })

    results.push({ id: row.id, name: file.name, url })
  }

  return NextResponse.json({ files: results })
}
