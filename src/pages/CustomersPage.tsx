import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteCustomer, getCustomers } from '../api/client'
import type { Customer } from '../types'

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)

  function load() {
    getCustomers()
      .then(setCustomers)
      .catch(() => setError('Failed to load customers'))
  }

  useEffect(load, [])

  async function handleDelete(id: string) {
    try {
      await deleteCustomer(id)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <Link to="/customers/new">New customer</Link>
      </div>
      {error && <p role="alert">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
              <td>{customer.address}</td>
              <td>
                <Link to={`/customers/${customer.id}/edit`}>Edit</Link>{' '}
                <button type="button" onClick={() => handleDelete(customer.id)}>
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
