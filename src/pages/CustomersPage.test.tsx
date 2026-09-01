import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../api/client'
import type { Customer } from '../types'
import { CustomerFormPage } from './CustomerFormPage'
import { CustomersPage } from './CustomersPage'

const customers: Customer[] = [
  { id: 'c1', name: 'Jane Doe', email: 'jane.doe@example.com', phone: '555-0100', address: '123 Main St' },
]

describe('CustomersPage', () => {
  it('renders the customer list', async () => {
    vi.spyOn(api, 'getCustomers').mockResolvedValue(customers)

    render(
      <MemoryRouter>
        <CustomersPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument()
  })

  it('shows an alert when deletion is blocked because the customer is referenced by orders', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCustomers').mockResolvedValue(customers)
    vi.spyOn(api, 'deleteCustomer').mockRejectedValue(
      new Error('Customer c1 is referenced by existing orders'),
    )

    render(
      <MemoryRouter>
        <CustomersPage />
      </MemoryRouter>,
    )

    await screen.findByText('Jane Doe')
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Customer c1 is referenced by existing orders',
    )
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })
})

describe('CustomerFormPage', () => {
  it('submits a new customer', async () => {
    const user = userEvent.setup()
    const createCustomer = vi.spyOn(api, 'createCustomer').mockResolvedValue({
      id: 'c2',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '555-0101',
      address: '456 Oak Ave',
    })

    render(
      <MemoryRouter initialEntries={['/customers/new']}>
        <Routes>
          <Route path="/customers/new" element={<CustomerFormPage />} />
          <Route path="/customers" element={<div>Customers list</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Name'), 'John Smith')
    await user.type(screen.getByLabelText('Email'), 'john.smith@example.com')
    await user.type(screen.getByLabelText('Phone'), '555-0101')
    await user.type(screen.getByLabelText('Address'), '456 Oak Ave')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(createCustomer).toHaveBeenCalledWith({
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '555-0101',
      address: '456 Oak Ave',
    })
    expect(await screen.findByText('Customers list')).toBeInTheDocument()
  })
})
