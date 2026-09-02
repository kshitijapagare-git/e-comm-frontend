import { useState } from 'react'
import type { KeyboardEvent } from 'react'

interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagsInput({ value, onChange, placeholder = 'Add a tag and press Enter' }: TagsInputProps) {
  const [draft, setDraft] = useState('')

  function commitDraft() {
    const tag = draft.trim()
    if (!tag) return
    if (!value.includes(tag)) {
      onChange([...value, tag])
    }
    setDraft('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitDraft()
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className="tags-input">
      <div className="tags-input-chips">
        {value.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => removeTag(tag)}>
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
