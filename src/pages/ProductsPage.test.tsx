import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../api/client'
import type { Product } from '../types'
import { ProductFormPage } from './ProductFormPage'
import { ProductsPage } from './ProductsPage'

const products: Product[] = [
  { id: 'p1', name: 'Wireless Mouse', sku: 'SKU-001', price: 25.99, stock: 120, status: 'active' },
]

describe('ProductsPage', () => {
  it('renders the product list', async () => {
    vi.spyOn(api, 'getProducts').mockResolvedValue(products)

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument()
    expect(screen.getByText('SKU-001')).toBeInTheDocument()
  })
})

describe('ProductFormPage', () => {
  it('submits a new product', async () => {
    const user = userEvent.setup()
    const createProduct = vi.spyOn(api, 'createProduct').mockResolvedValue({
      id: 'p2',
      name: 'Keyboard',
      sku: 'SKU-003',
      price: 10,
      stock: 5,
      status: 'active',
    })

    render(
      <MemoryRouter initialEntries={['/products/new']}>
        <Routes>
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products" element={<div>Products list</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Name'), 'Keyboard')
    await user.type(screen.getByLabelText('SKU'), 'SKU-003')
    await user.clear(screen.getByLabelText('Price'))
    await user.type(screen.getByLabelText('Price'), '10')
    await user.clear(screen.getByLabelText('Stock'))
    await user.type(screen.getByLabelText('Stock'), '5')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(createProduct).toHaveBeenCalledWith({
      name: 'Keyboard',
      sku: 'SKU-003',
      price: 10,
      stock: 5,
      status: 'active',
    })
    expect(await screen.findByText('Products list')).toBeInTheDocument()
  })
})
