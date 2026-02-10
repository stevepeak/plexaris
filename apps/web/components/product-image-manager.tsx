'use client'

import { ImagePlus, X } from 'lucide-react'
import { useRef } from 'react'

import { cn } from '@/lib/utils'

type ProductImageManagerProps = {
  images: string[]
  onAdd?: (files: File[]) => Promise<{ error?: string }>
  onRemove?: (index: number) => Promise<{ error?: string }>
  disabled?: boolean
  max?: number
}

export function ProductImageManager({
  images,
  onAdd,
  onRemove,
  disabled = true,
  max = 8,
}: ProductImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !onAdd) return
    await onAdd(Array.from(files))
    e.target.value = ''
  }

  const canAdd = images.length < max

  if (images.length === 0 && disabled) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 opacity-50">
        <ImagePlus className="h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Image uploads coming soon
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-4 gap-3',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      {images.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
        >
          <img
            src={src}
            alt={`Product image ${index + 1}`}
            className="h-full w-full object-cover"
          />
          {!disabled && onRemove && (
            <button
              type="button"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
              onClick={() => onRemove(index)}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
      {canAdd && (
        <button
          type="button"
          disabled={disabled}
          className="flex aspect-square items-center justify-center rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-muted-foreground"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-6 w-6" />
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
      />
    </div>
  )
}
