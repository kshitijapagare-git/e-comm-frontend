import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createCustomer, getCustomer, updateCustomer } from '../api/client'
import type { CustomerInput } from '../types'

const emptyCustomer: CustomerInput = {
  name: '',
  email: '',
  phone: '',
  address: '',
}

export function CustomerFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<CustomerInput>(emptyCustomer)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getCustomer(id).then(setForm)
  }, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (isEdit && id) {
        await updateCustomer(id, form)
      } else {
        await createCustomer(form)
      }
      navigate('/customers')
    } catch {
      setError('Failed to save customer')
    }
  }

  return (
    <div>
      <h1>{isEdit ? 'Edit customer' : 'New customer'}</h1>
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
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Phone
          <input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label>
          Address
          <input
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
