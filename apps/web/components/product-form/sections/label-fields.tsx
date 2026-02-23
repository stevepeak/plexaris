import { ProductImageManager } from '@/components/product-image-manager'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { uploadFiles } from '@/lib/upload'

import { FieldLabel } from '../field-primitives'
import { ci, type FCProp } from '../types'

export function LabelFields({
  g,
  u,
  data,
  fc,
  undo,
}: {
  g: (p: string[]) => string
  u: (p: string[], v: unknown) => void
  data: Record<string, unknown>
} & FCProp) {
  const labelData = (data.label as Record<string, unknown>) ?? {}
  const labelImages = (labelData.labelImages as string[]) ?? []

  const handleAddLabelImages = async (
    files: File[],
  ): Promise<{ error?: string }> => {
    const { urls, error } = await uploadFiles(files, 'products')
    if (error) return { error }
    u(['label', 'labelImages'], [...labelImages, ...urls])
    return {}
  }

  const handleRemoveLabelImage = async (
    index: number,
  ): Promise<{ error?: string }> => {
    u(
      ['label', 'labelImages'],
      labelImages.filter((_, i) => i !== index),
    )
    return {}
  }

  return (
    <>
      <div className="grid gap-2">
        <Label>Label images</Label>
        <ProductImageManager
          images={labelImages}
          disabled={false}
          onAdd={handleAddLabelImages}
          onRemove={handleRemoveLabelImage}
        />
      </div>
      <div className="grid gap-2" id="field-label-cartonPrint">
        <FieldLabel change={ci(fc, undo, ['label', 'cartonPrint'])}>
          Carton print
        </FieldLabel>
        <Textarea
          value={g(['label', 'cartonPrint'])}
          onChange={(e) => u(['label', 'cartonPrint'], e.target.value)}
          rows={3}
          placeholder="Text/info printed on outer carton"
        />
      </div>
    </>
  )
}
