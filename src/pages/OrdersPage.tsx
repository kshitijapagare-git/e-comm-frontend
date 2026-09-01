import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteOrder, getCustomers, getOrders, getProducts } from '../api/client'
import type { Customer, Order, Product } from '../types'

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)

  function load() {
    Promise.all([getOrders(), getProducts(), getCustomers()])
      .then(([orders, products, customers]) => {
        setOrders(orders)
        setProducts(products)
        setCustomers(customers)
      })
      .catch(() => setError('Failed to load orders'))
  }

  useEffect(load, [])

  async function handleDelete(id: string) {
    await deleteOrder(id)
    load()
  }

  function productName(productId: string) {
    return products.find((p) => p.id === productId)?.name ?? productId
  }

  function customerName(customerId: string) {
    return customers.find((c) => c.id === customerId)?.name ?? customerId
  }

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <Link to="/orders/new">New order</Link>
      </div>
      {error && <p role="alert">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit price</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{customerName(order.customerId)}</td>
              <td>{productName(order.productId)}</td>
              <td>{order.quantity}</td>
              <td>{order.unitPrice}</td>
              <td>{order.status}</td>
              <td>
                <Link to={`/orders/${order.id}/edit`}>Edit</Link>{' '}
                <button type="button" onClick={() => handleDelete(order.id)}>
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
