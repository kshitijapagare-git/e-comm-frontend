import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteCustomer, getCustomers } from '../api/client'
import { AvatarTile } from '../components/AvatarTile'
import { Pagination } from '../components/Pagination'
import { Toolbar } from '../components/Toolbar'
import { usePagination } from '../hooks/usePagination'
import type { Customer } from '../types'

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return customers
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query),
    )
  }, [customers, search])

  const { page, setPage, totalPages, pageItems } = usePagination(filtered)

  return (
    <div>
      <h1>Customers</h1>
      <Toolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search customers…">
        <Link to="/customers/new">New customer</Link>
      </Toolbar>
      {error && <p role="alert">{error}</p>}
      <table>
        <thead>
          <tr>
            <th className="avatar-col"></th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((customer) => (
            <tr key={customer.id}>
              <td className="avatar-col">
                <AvatarTile label={customer.name} shape="circle" />
              </td>
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
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
