import { uploadImage } from '@app/cloudinary'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
])

const SIZE_LIMITS: Record<string, number> = {
  avatars: 10 * 1024 * 1024,
  logos: 10 * 1024 * 1024,
  products: 10 * 1024 * 1024,
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const folder = formData.get('folder') as string | null

  if (!folder || !SIZE_LIMITS[folder]) {
    return NextResponse.json(
      { error: 'Invalid folder. Use: avatars, logos, or products' },
      { status: 400 },
    )
  }

  const maxSize = SIZE_LIMITS[folder]
  const files = formData.getAll('file') as File[]

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}` },
        { status: 400 },
      )
    }
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large (max ${maxSize / 1024 / 1024}MB)` },
        { status: 400 },
      )
    }
  }

  const urls: string[] = []

  for (const file of files) {
    const url = await uploadImage(file, folder)
    urls.push(url)
  }

  return NextResponse.json({ urls })
}
