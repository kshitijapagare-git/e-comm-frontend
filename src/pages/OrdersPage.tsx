import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteOrder, getCustomers, getOrders, getProducts } from '../api/client'
import { Pagination } from '../components/Pagination'
import { StatusBadge } from '../components/StatusBadge'
import { Toolbar } from '../components/Toolbar'
import { usePagination } from '../hooks/usePagination'
import type { Customer, Order, Product } from '../types'

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return orders
    return orders.filter(
      (order) =>
        customerName(order.customerId).toLowerCase().includes(query) ||
        productName(order.productId).toLowerCase().includes(query),
    )
  }, [orders, products, customers, search])

  const { page, setPage, totalPages, pageItems } = usePagination(filtered)

  return (
    <div>
      <h1>Orders</h1>
      <Toolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search orders…">
        <Link to="/orders/new">New order</Link>
      </Toolbar>
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
          {pageItems.map((order) => (
            <tr key={order.id}>
              <td>{customerName(order.customerId)}</td>
              <td>{productName(order.productId)}</td>
              <td>{order.quantity}</td>
              <td>{order.unitPrice}</td>
              <td>
                <StatusBadge status={order.status} />
              </td>
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
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
