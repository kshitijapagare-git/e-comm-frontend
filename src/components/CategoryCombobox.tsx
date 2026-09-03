import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'

interface CategoryComboboxProps {
  id?: string
  name?: string
  value: string
  onChange: (categoryId: string) => void
  onBlur?: () => void
  placeholder?: string
}

export function CategoryCombobox({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder = 'Search categories…',
}: CategoryComboboxProps) {
  const { categories, loading, error } = useCategories()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedCategory = categories.find((c) => c.id === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  )

  function handleSelect(categoryId: string) {
    onChange(categoryId)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="combobox" ref={containerRef}>
      <input
        id={id}
        name={name}
        type="text"
        role="combobox"
        aria-expanded={open}
        autoComplete="off"
        className="combobox-input"
        placeholder={selectedCategory ? selectedCategory.name : placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={onBlur}
      />
      {open && (
        <div className="combobox-listbox" role="listbox">
          {loading && <div className="combobox-status">Loading categories…</div>}
          {!loading && error && <div className="combobox-status combobox-status-error">{error}</div>}
          {!loading && !error && categories.length === 0 && (
            <div className="combobox-empty">
              <p>No categories yet.</p>
              <Link to="/categories/new" onClick={() => setOpen(false)}>
                + Create category
              </Link>
            </div>
          )}
          {!loading && !error && categories.length > 0 && filteredCategories.length === 0 && (
            <div className="combobox-empty">
              <p>No categories match "{query}".</p>
              <Link to="/categories/new" onClick={() => setOpen(false)}>
                + Create category
              </Link>
            </div>
          )}
          {!loading &&
            !error &&
            filteredCategories.map((category) => (
              <div
                key={category.id}
                role="option"
                aria-selected={category.id === value}
                className={`combobox-option${category.id === value ? ' combobox-option-selected' : ''}`}
                onClick={() => handleSelect(category.id)}
              >
                {category.name}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
