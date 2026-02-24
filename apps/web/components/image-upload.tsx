'use i18n'
'use client'

import { Camera, ImageUp, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
    <div className="flex flex-col items-start gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled || loading}>
          <button
            type="button"
            disabled={disabled || loading}
            className={cn(
              'group relative shrink-0 overflow-hidden border bg-muted transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50',
              size,
              shapeClass,
            )}
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
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
            <ImageUp />
            Upload a photo...
          </DropdownMenuItem>
          {preview && (
            <DropdownMenuItem onSelect={handleRemove}>
              <Trash2 />
              Remove photo
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
