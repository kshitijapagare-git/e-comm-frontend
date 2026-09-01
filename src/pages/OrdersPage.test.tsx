import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../api/client'
import type { Customer, Order, Product } from '../types'
import { OrderFormPage } from './OrderFormPage'
import { OrdersPage } from './OrdersPage'

const products: Product[] = [
  { id: 'p1', name: 'Wireless Mouse', sku: 'SKU-001', price: 25.99, stock: 120, status: 'active' },
]

const customers: Customer[] = [
  { id: 'c1', name: 'Jane Doe', email: 'jane.doe@example.com', phone: '555-0100', address: '123 Main St' },
]

const orders: Order[] = [
  { id: 'o1', customerId: 'c1', productId: 'p1', quantity: 2, unitPrice: 25.99, status: 'pending' },
]

describe('OrdersPage', () => {
  it('renders the order list with resolved product names', async () => {
    vi.spyOn(api, 'getOrders').mockResolvedValue(orders)
    vi.spyOn(api, 'getProducts').mockResolvedValue(products)
    vi.spyOn(api, 'getCustomers').mockResolvedValue(customers)

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument()
  })
})

describe('OrderFormPage', () => {
  it('submits a new order using the product select', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getProducts').mockResolvedValue(products)
    vi.spyOn(api, 'getCustomers').mockResolvedValue(customers)
    const createOrder = vi.spyOn(api, 'createOrder').mockResolvedValue({
      id: 'o2',
      customerId: 'c1',
      productId: 'p1',
      quantity: 3,
      unitPrice: 25.99,
      status: 'pending',
    })

    render(
      <MemoryRouter initialEntries={['/orders/new']}>
        <Routes>
          <Route path="/orders/new" element={<OrderFormPage />} />
          <Route path="/orders" element={<div>Orders list</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await screen.findByText('Wireless Mouse')
    await user.selectOptions(screen.getByLabelText('Customer'), 'c1')
    await user.selectOptions(screen.getByLabelText('Product'), 'p1')
    await user.clear(screen.getByLabelText('Quantity'))
    await user.type(screen.getByLabelText('Quantity'), '3')
    await user.clear(screen.getByLabelText('Unit price'))
    await user.type(screen.getByLabelText('Unit price'), '25.99')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(createOrder).toHaveBeenCalledWith({
      customerId: 'c1',
      productId: 'p1',
      quantity: 3,
      unitPrice: 25.99,
      status: 'pending',
    })
    expect(await screen.findByText('Orders list')).toBeInTheDocument()
  })
})
