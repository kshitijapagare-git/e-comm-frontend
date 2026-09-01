import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createCategory, getCategory, updateCategory } from '../api/client'
import type { CategoryInput } from '../types'

const emptyCategory: CategoryInput = {
  name: '',
  description: '',
}

export function CategoryFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<CategoryInput>(emptyCategory)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getCategory(id).then(setForm)
  }, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (isEdit && id) {
        await updateCategory(id, form)
      } else {
        await createCategory(form)
      }
      navigate('/categories')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category')
    }
  }

  return (
    <div>
      <h1>{isEdit ? 'Edit category' : 'New category'}</h1>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Description
          <input
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
