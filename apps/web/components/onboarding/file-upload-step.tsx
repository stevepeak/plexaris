'use client'

import { Building2, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUploadStep({
  files,
  onFilesChange,
  onBack,
  onSubmit,
  isLoading,
  error,
}: {
  files: File[]
  onFilesChange: (files: File[]) => void
  onBack: () => void
  onSubmit: () => void
  isLoading: boolean
  error: string | null
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setFileError(null)
      const toAdd: File[] = []
      for (const file of newFiles) {
        if (file.size > MAX_FILE_SIZE) {
          setFileError(`"${file.name}" exceeds the 5MB file size limit`)
          continue
        }
        if (!files.some((f) => f.name === file.name && f.size === file.size)) {
          toAdd.push(file)
        }
      }
      if (toAdd.length > 0) {
        onFilesChange([...files, ...toAdd])
      }
    },
    [files, onFilesChange],
  )

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files)
      }
    },
    [addFiles],
  )

  return (
    <div className="grid w-full max-w-md gap-4">
      <div className="grid gap-2">
        <Label>Upload documents</Label>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              CSV, Excel, PDF, images — all types accepted. 5MB max per file.
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              addFiles(e.target.files)
              e.target.value = ''
            }
          }}
        />
      </div>

      {(fileError ?? error) && (
        <p className="text-sm text-destructive">{fileError ?? error}</p>
      )}

      {files.length > 0 && (
        <ul className="grid gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span className="truncate">{file.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4" />
              Create organization
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
