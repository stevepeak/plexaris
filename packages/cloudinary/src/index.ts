import { getConfig } from '@app/config'
import crypto from 'node:crypto'

let _parsed: { apiKey: string; apiSecret: string; cloudName: string } | null =
  null

function getCloudinaryConfig() {
  if (!_parsed) {
    const url = new URL(getConfig().CLOUDINARY_URL)
    _parsed = {
      apiKey: url.username,
      apiSecret: url.password,
      cloudName: url.hostname,
    }
  }
  return _parsed
}

function sign(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return crypto
    .createHash('sha1')
    .update(sorted + getCloudinaryConfig().apiSecret)
    .digest('hex')
}

export async function uploadFile(
  file: File,
  folder: string,
): Promise<{ url: string; publicId: string }> {
  const timestamp = String(Math.floor(Date.now() / 1000))
  const params = { folder: `leftman/${folder}`, timestamp }
  const signature = sign(params)

  const body = new FormData()
  body.append('file', file)
  body.append('folder', params.folder)
  body.append('timestamp', timestamp)
  const { apiKey, cloudName } = getCloudinaryConfig()
  body.append('api_key', apiKey)
  body.append('signature', signature)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: 'POST', body },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Cloudinary upload failed: ${text}`)
  }

  const json = (await res.json()) as {
    secure_url: string
    public_id: string
  }
  return { url: json.secure_url, publicId: json.public_id }
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const timestamp = String(Math.floor(Date.now() / 1000))
  const params = { folder: `leftman/${folder}`, timestamp }
  const signature = sign(params)

  const body = new FormData()
  body.append('file', file)
  body.append('folder', params.folder)
  body.append('timestamp', timestamp)
  const { apiKey, cloudName } = getCloudinaryConfig()
  body.append('api_key', apiKey)
  body.append('signature', signature)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Cloudinary upload failed: ${text}`)
  }

  const json = (await res.json()) as { secure_url: string }
  return json.secure_url
}

export function buildImageUrl(
  publicId: string,
  options?: { width?: number; height?: number; crop?: string },
): string {
  const { cloudName } = getCloudinaryConfig()
  const transforms: string[] = []
  if (options?.width) transforms.push(`w_${options.width}`)
  if (options?.height) transforms.push(`h_${options.height}`)
  if (options?.crop) transforms.push(`c_${options.crop}`)
  const transformStr = transforms.length > 0 ? `${transforms.join(',')}/` : ''
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}${publicId}`
}
