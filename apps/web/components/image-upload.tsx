'use client'

import { Camera, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ImageUploadVariant = 'circle' | 'square'

export function ImageUpload({
  value,
  fallback,
  variant = 'circle',
  alt,
  disabled,
  onUpload,
}: {
  value?: string | null
  fallback: string
  variant?: ImageUploadVariant
  alt?: string
  disabled?: boolean
  onUpload?: (file: File | null) => Promise<{ error?: string }>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(value ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPreview(value ?? null)
  }, [value])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreview(url)

    if (onUpload) {
      setLoading(true)
      setError(null)
      const result = await onUpload(file)
      if (result.error) {
        setError(result.error)
        setPreview(value ?? null)
      }
      setLoading(false)
    }

    e.target.value = ''
  }

  const handleRemove = async () => {
    if (onUpload) {
      setLoading(true)
      setError(null)
      const result = await onUpload(null)
      if (result.error) {
        setError(result.error)
      } else {
        setPreview(null)
      }
      setLoading(false)
    } else {
      setPreview(null)
    }
  }

  const isCircle = variant === 'circle'
  const size = isCircle ? 'h-20 w-20' : 'h-16 w-16'
  const shapeClass = isCircle ? 'rounded-full' : 'rounded-lg'

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        disabled={disabled || loading}
        className={cn(
          'group relative shrink-0 overflow-hidden border bg-muted transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50',
          size,
          shapeClass,
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar className={cn('h-full w-full', shapeClass)}>
          {preview && (
            <AvatarImage
              src={preview}
              alt={alt ?? fallback}
              className="object-cover"
            />
          )}
          <AvatarFallback
            className={cn(
              shapeClass,
              isCircle ? 'text-xl' : 'text-lg font-medium',
            )}
          >
            {fallback}
          </AvatarFallback>
        </Avatar>
        {!disabled && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100',
              shapeClass,
            )}
          >
            <Camera className="h-5 w-5 text-white" />
          </div>
        )}
        {loading && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-black/40',
              shapeClass,
            )}
          >
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </button>
      <div className="grid gap-1.5">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || loading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="mr-2 h-4 w-4" />
            {preview ? 'Change photo' : 'Upload photo'}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || loading}
              onClick={handleRemove}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WebP. Max 2MB.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
