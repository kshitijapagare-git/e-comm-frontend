import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createOrder, getCustomers, getOrder, getProducts, updateOrder } from '../api/client'
import type { Customer, OrderInput, OrderStatus, Product } from '../types'

const emptyOrder: OrderInput = {
  customerId: '',
  productId: '',
  quantity: 1,
  unitPrice: 0,
  status: 'pending',
}

export function OrderFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<OrderInput>(emptyOrder)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  useEffect(() => {
    getCustomers().then(setCustomers)
  }, [])

  useEffect(() => {
    if (!id) return
    getOrder(id).then(setForm)
  }, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (isEdit && id) {
        await updateOrder(id, form)
      } else {
        await createOrder(form)
      }
      navigate('/orders')
    } catch {
      setError('Failed to save order')
    }
  }

  return (
    <div>
      <h1>{isEdit ? 'Edit order' : 'New order'}</h1>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Customer
          <select
            required
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
          >
            <option value="" disabled>
              Select a customer
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Product
          <select
            required
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
          >
            <option value="" disabled>
              Select a product
            </option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quantity
          <input
            required
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          />
        </label>
        <label>
          Unit price
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.unitPrice}
            onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
          />
        </label>
        <label>
          Status
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
