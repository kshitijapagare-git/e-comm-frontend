import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'

interface CategoryComboboxProps {
  value: string
  onChange: (categoryId: string) => void
  id?: string
  placeholder?: string
}

export function CategoryCombobox({
  value,
  onChange,
  id,
  placeholder = 'Select a category',
}: CategoryComboboxProps) {
  const { categories, loading } = useCategories()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selected = categories.find((category) => category.id === value)

  useEffect(() => {
    if (selected) setQuery(selected.name)
  }, [selected?.id, selected?.name])

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return categories
    return categories.filter((category) => category.name.toLowerCase().includes(trimmed))
  }, [categories, query])

  function handleSelect(categoryId: string, name: string) {
    onChange(categoryId)
    setQuery(name)
    setOpen(false)
  }

  return (
    <div className="combobox">
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
      />
      {open && (
        <ul className="combobox-list" role="listbox">
          {loading ? (
            <li className="combobox-status">Loading categories…</li>
          ) : filtered.length === 0 ? (
            <li className="combobox-empty">
              No categories found.{' '}
              <Link to="/categories/new" onClick={() => setOpen(false)}>
                Create category
              </Link>
            </li>
          ) : (
            filtered.map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={category.id === value}
                  onClick={() => handleSelect(category.id, category.name)}
                >
                  {category.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
