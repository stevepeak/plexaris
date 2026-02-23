export async function uploadOrganizationFiles(
  files: File[],
  organizationId: string,
): Promise<{ files: { id: string; name: string; url: string }[] }> {
  const formData = new FormData()
  for (const file of files) {
    formData.append('file', file)
  }

  const res = await fetch(`/api/organizations/${organizationId}/files`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error ?? 'File upload failed')
  }

  return res.json()
}
