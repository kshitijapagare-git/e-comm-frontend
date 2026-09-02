import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'

interface CategoryComboboxProps {
  value: string
  onChange: (categoryId: string) => void
  id?: string
}

export function CategoryCombobox({ value, onChange, id = 'category-combobox' }: CategoryComboboxProps) {
  const { categories, loading, error } = useCategories()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selectedName = useMemo(
    () => categories.find((c) => c.id === value)?.name ?? '',
    [categories, value],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(q))
  }, [categories, query])

  function handleSelect(categoryId: string, name: string) {
    onChange(categoryId)
    setQuery(name)
    setOpen(false)
  }

  return (
    <div className="category-combobox">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        value={open ? query : selectedName}
        placeholder="Search category…"
        onFocus={() => {
          setOpen(true)
          setQuery('')
        }}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setOpen(false)}
      />
      {open && (
        <ul className="category-combobox-list">
          {loading && <li className="category-combobox-status">Loading categories…</li>}
          {!loading && error && <li className="category-combobox-status" role="alert">{error}</li>}
          {!loading && !error && filtered.length === 0 && (
            <li className="category-combobox-status">
              No categories found. <Link to="/categories/new">Create category</Link>
            </li>
          )}
          {!loading &&
            !error &&
            filtered.map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(category.id, category.name)}
                >
                  {category.name}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
