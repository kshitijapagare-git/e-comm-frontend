import { useEffect, useMemo, useRef, useState } from 'react'
import type { FocusEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'

interface CategoryComboboxProps {
  value: string
  onChange: (categoryId: string) => void
  id?: string
  name?: string
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
  placeholder?: string
}

export function CategoryCombobox({
  value,
  onChange,
  id,
  name,
  onBlur,
  placeholder = 'Select a category',
}: CategoryComboboxProps) {
  const { categories, loading, error } = useCategories()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = categories.find((category) => category.id === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return categories
    return categories.filter((category) => category.name.toLowerCase().includes(normalized))
  }, [categories, query])

  function handleSelect(categoryId: string) {
    onChange(categoryId)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="category-combobox" ref={containerRef}>
      <input
        id={id}
        name={name}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={id ? `${id}-listbox` : undefined}
        autoComplete="off"
        value={open ? query : (selected?.name ?? '')}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true)
          setQuery('')
        }}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onBlur={onBlur}
      />
      {open && (
        <div className="category-combobox-panel" id={id ? `${id}-listbox` : undefined} role="listbox">
          {loading && <div className="category-combobox-message">Loading categories…</div>}
          {!loading && error && (
            <div className="category-combobox-message" role="alert">
              {error}
            </div>
          )}
          {!loading && !error && categories.length === 0 && (
            <div className="category-combobox-empty">
              <p>No categories yet.</p>
              <Link to="/categories/new" onMouseDown={(e) => e.preventDefault()}>
                + Create category
              </Link>
            </div>
          )}
          {!loading && !error && categories.length > 0 && filtered.length === 0 && (
            <div className="category-combobox-message">No categories match &quot;{query}&quot;</div>
          )}
          {!loading &&
            !error &&
            filtered.map((category) => (
              <button
                key={category.id}
                type="button"
                role="option"
                aria-selected={category.id === value}
                className="category-combobox-option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(category.id)}
              >
                {category.name}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
