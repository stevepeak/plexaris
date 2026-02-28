'use i18n'
import { ProductImageManager } from '@/components/product-image-manager'
import { uploadFiles } from '@/lib/upload'

export function PhotosFields({
  data,
  u,
}: {
  data: Record<string, unknown>
  u: (p: string[], v: unknown) => void
}) {
  const photos = (data.photos as Record<string, unknown>) ?? {}
  const images = (photos.images as string[]) ?? []

  const handleAdd = async (files: File[]): Promise<{ error?: string }> => {
    const { urls, error } = await uploadFiles(files, 'products')
    if (error) return { error }
    u(['photos', 'images'], [...images, ...urls])
    return {}
  }

  const handleRemove = async (index: number): Promise<{ error?: string }> => {
    u(
      ['photos', 'images'],
      images.filter((_, i) => i !== index),
    )
    return {}
  }

  return (
    <ProductImageManager
      images={images}
      disabled={false}
      onAdd={handleAdd}
      onRemove={handleRemove}
    />
  )
}
