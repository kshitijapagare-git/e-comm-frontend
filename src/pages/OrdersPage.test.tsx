import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../api/client'
import type { Order, Product } from '../types'
import { OrderFormPage } from './OrderFormPage'
import { OrdersPage } from './OrdersPage'

const products: Product[] = [
  { id: 'p1', name: 'Wireless Mouse', sku: 'SKU-001', price: 25.99, stock: 120, status: 'active' },
]

const orders: Order[] = [
  { id: 'o1', customerName: 'Jane Doe', productId: 'p1', quantity: 2, unitPrice: 25.99, status: 'pending' },
]

describe('OrdersPage', () => {
  it('renders the order list with resolved product names', async () => {
    vi.spyOn(api, 'getOrders').mockResolvedValue(orders)
    vi.spyOn(api, 'getProducts').mockResolvedValue(products)

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
    const createOrder = vi.spyOn(api, 'createOrder').mockResolvedValue({
      id: 'o2',
      customerName: 'John Smith',
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

    await user.type(screen.getByLabelText('Customer name'), 'John Smith')
    await screen.findByText('Wireless Mouse')
    await user.selectOptions(screen.getByLabelText('Product'), 'p1')
    await user.clear(screen.getByLabelText('Quantity'))
    await user.type(screen.getByLabelText('Quantity'), '3')
    await user.clear(screen.getByLabelText('Unit price'))
    await user.type(screen.getByLabelText('Unit price'), '25.99')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(createOrder).toHaveBeenCalledWith({
      customerName: 'John Smith',
      productId: 'p1',
      quantity: 3,
      unitPrice: 25.99,
      status: 'pending',
    })
    expect(await screen.findByText('Orders list')).toBeInTheDocument()
  })
})
