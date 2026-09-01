import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteCategory, getCategories } from '../api/client'
import { Toolbar } from '../components/Toolbar'
import type { Category } from '../types'

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  function load() {
    getCategories()
      .then(setCategories)
      .catch(() => setError('Failed to load categories'))
  }

  useEffect(load, [])

  async function handleDelete(id: string) {
    try {
      await deleteCategory(id)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return categories
    return categories.filter((category) => category.name.toLowerCase().includes(query))
  }, [categories, search])

  return (
    <div>
      <h1>Categories</h1>
      <Toolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search categories…">
        <Link to="/categories/new">New category</Link>
      </Toolbar>
      {error && <p role="alert">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.description}</td>
              <td>
                <Link to={`/categories/${category.id}/edit`}>Edit</Link>{' '}
                <button type="button" onClick={() => handleDelete(category.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
