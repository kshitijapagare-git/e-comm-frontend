import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createProduct, getProduct, updateProduct } from '../api/client'
import type { ProductInput, ProductStatus } from '../types'

const emptyProduct: ProductInput = {
  name: '',
  sku: '',
  price: 0,
  stock: 0,
  status: 'active',
}

export function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<ProductInput>(emptyProduct)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getProduct(id).then(setForm)
  }, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (isEdit && id) {
        await updateProduct(id, form)
      } else {
        await createProduct(form)
      }
      navigate('/products')
    } catch {
      setError('Failed to save product')
    }
  }

  return (
    <div>
      <h1>{isEdit ? 'Edit product' : 'New product'}</h1>
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
          SKU
          <input
            required
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
          />
        </label>
        <label>
          Price
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
        </label>
        <label>
          Stock
          <input
            required
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          />
        </label>
        <label>
          Status
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
