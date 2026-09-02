import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024

interface ImageDropzoneProps {
  value?: string | null
  onChange: (previewUrl: string | null) => void
}

export function ImageDropzone({ value, onChange }: ImageDropzoneProps) {
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function validateAndSet(file: File | undefined) {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please upload a PNG, JPG or WEBP image.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('File is too large. Maximum size is 2MB.')
      return
    }
    setError(null)
    const previewUrl = URL.createObjectURL(file)
    onChange(previewUrl)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    validateAndSet(e.target.files?.[0])
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    validateAndSet(e.dataTransfer.files?.[0])
  }

  function handleRemove() {
    setError(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="image-dropzone">
      {value ? (
        <div className="image-dropzone-preview">
          <img src={value} alt="Product preview" />
          <div className="image-dropzone-preview-actions">
            <button type="button" onClick={() => inputRef.current?.click()}>
              Replace
            </button>
            <button type="button" onClick={handleRemove}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className="image-dropzone-area"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <p className="image-dropzone-label">Upload image</p>
          <p className="image-dropzone-hint">PNG, JPG or WEBP, max 2MB</p>
          <button type="button" onClick={() => inputRef.current?.click()}>
            Choose file
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        aria-label="Upload image"
      />
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
