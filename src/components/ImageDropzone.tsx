import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024

interface ImageDropzoneProps {
  onFileSelected?: (file: File | null) => void
}

export function ImageDropzone({ onFileSelected }: ImageDropzoneProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function validateAndSet(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please choose a PNG, JPG or WEBP image.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('File is too large. Maximum size is 2MB.')
      return
    }
    setError(null)
    setFileName(file.name)
    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return URL.createObjectURL(file)
    })
    onFileSelected?.(file)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndSet(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndSet(file)
  }

  function handleRemove() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setFileName(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
    onFileSelected?.(null)
  }

  return (
    <div className="image-dropzone-wrapper">
      {previewUrl ? (
        <div className="image-preview">
          <img src={previewUrl} alt={fileName ?? 'Selected product image'} className="image-preview-thumb" />
          <div className="image-preview-actions">
            <button type="button" className="btn-secondary" onClick={() => inputRef.current?.click()}>
              Replace
            </button>
            <button type="button" className="btn-secondary" onClick={handleRemove}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`image-dropzone${isDragOver ? ' image-dropzone-active' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="image-dropzone-icon"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="image-dropzone-label">Upload image</p>
          <p className="image-dropzone-hint">PNG, JPG or WEBP, max 2MB</p>
          <button type="button" className="btn-secondary" onClick={() => inputRef.current?.click()}>
            Choose file
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="visually-hidden"
        onChange={handleInputChange}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
