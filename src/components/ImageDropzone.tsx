import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024

interface ImageDropzoneProps {
  value?: string | null
  onChange: (file: File | null, previewUrl: string | null) => void
}

export function ImageDropzone({ value, onChange }: ImageDropzoneProps) {
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function validateAndSet(file: File) {
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
    onChange(file, previewUrl)
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndSet(file)
    e.target.value = ''
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndSet(file)
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(true)
  }

  function handleDragLeave() {
    setDragActive(false)
  }

  function handleRemove() {
    setError(null)
    onChange(null, null)
  }

  function openFileDialog() {
    inputRef.current?.click()
  }

  return (
    <div className="image-dropzone">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileInput}
        style={{ display: 'none' }}
        aria-label="Upload image"
      />
      {value ? (
        <div className="image-dropzone-preview">
          <img src={value} alt="Product preview" />
          <div className="image-dropzone-preview-actions">
            <button type="button" onClick={openFileDialog}>
              Replace
            </button>
            <button type="button" onClick={handleRemove}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`image-dropzone-area${dragActive ? ' image-dropzone-area-active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <span className="image-dropzone-icon" aria-hidden="true">
            ⬆
          </span>
          <p className="image-dropzone-label">Upload image</p>
          <p className="image-dropzone-hint">PNG, JPG or WEBP, max 2MB</p>
          <button type="button" onClick={openFileDialog}>
            Choose file
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="image-dropzone-error">
          {error}
        </p>
      )}
    </div>
  )
}
