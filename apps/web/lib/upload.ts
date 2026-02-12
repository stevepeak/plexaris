type UploadFolder = 'avatars' | 'logos' | 'products'

export async function uploadFiles(
  files: File[],
  folder: UploadFolder,
): Promise<{ urls: string[]; error?: string }> {
  const formData = new FormData()
  formData.set('folder', folder)
  for (const file of files) {
    formData.append('file', file)
  }

  const res = await fetch('/api/upload', { method: 'POST', body: formData })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    return { urls: [], error: json.error ?? 'Upload failed' }
  }

  const json = await res.json()
  return { urls: json.urls }
}
