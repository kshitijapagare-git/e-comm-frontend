import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024

interface ImageDropzoneProps {
  value?: string | null
  onChange: (dataUrl: string | null) => void
}

export function ImageDropzone({ value, onChange }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function validateAndLoad(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please upload a PNG, JPG or WEBP image.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('File is too large. Maximum size is 2MB.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      onChange(typeof reader.result === 'string' ? reader.result : null)
    }
    reader.readAsDataURL(file)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndLoad(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndLoad(file)
  }

  function handleRemove() {
    onChange(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="image-dropzone-wrapper">
      {value ? (
        <div className="image-preview">
          <img src={value} alt="Product preview" />
          <div className="image-preview-actions">
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
          className="image-dropzone"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
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
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        style={{ display: 'none' }}
        aria-label="Upload image"
      />
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
