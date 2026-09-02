import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../api/client'
import type { Category, Product, Supplier } from '../types'
import { ProductFormPage } from './ProductFormPage'
import { ProductsPage } from './ProductsPage'

const categories: Category[] = [
  { id: 'cat1', name: 'Accessories', description: 'Computer accessories' },
]

const suppliers: Supplier[] = [
  { id: 'sup1', name: 'Acme Supplies' },
]

const products: Product[] = [
  { id: 'p1', name: 'Wireless Mouse', sku: 'SKU-001', price: 25.99, stock: 120, status: 'active', categoryId: 'cat1' },
]

describe('ProductsPage', () => {
  it('renders the product list', async () => {
    vi.spyOn(api, 'getProducts').mockResolvedValue(products)
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument()
    expect(screen.getByText('SKU-001')).toBeInTheDocument()
    expect(screen.getByText('Accessories')).toBeInTheDocument()
  })
})

describe('ProductFormPage', () => {
  async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
    await screen.findByText('Accessories')

    await user.type(screen.getByLabelText(/Product Name/i), 'Keyboard')
    await user.type(screen.getByLabelText(/^SKU/i), 'SKU-003')
    await user.type(screen.getByLabelText(/^Price/i), '10')
    await user.type(screen.getByLabelText(/Stock Quantity/i), '5')

    const categoryField = screen.getByLabelText(/Category/i)
    await user.type(categoryField, 'Access')
    await user.click(await screen.findByRole('option', { name: 'Accessories' }))
  }

  it('submits a new product with the extended field set', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)
    vi.spyOn(api, 'getSuppliers').mockResolvedValue(suppliers)
    const createProduct = vi.spyOn(api, 'createProduct').mockResolvedValue({
      id: 'p2',
      name: 'Keyboard',
      sku: 'SKU-003',
      price: 10,
      stock: 5,
      status: 'active',
      categoryId: 'cat1',
    })

    render(
      <MemoryRouter initialEntries={['/products/new']}>
        <Routes>
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products" element={<div>Products list</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await fillRequiredFields(user)

    await user.click(screen.getByRole('button', { name: /Save product/i }))

    expect(createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Keyboard',
        sku: 'SKU-003',
        price: 10,
        stock: 5,
        status: 'active',
        categoryId: 'cat1',
        featured: false,
        trackInventory: true,
      }),
    )
    expect(await screen.findByText('Products list')).toBeInTheDocument()
  })

  it('shows the API error message verbatim when saving fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)
    vi.spyOn(api, 'getSuppliers').mockResolvedValue(suppliers)
    vi.spyOn(api, 'createProduct').mockRejectedValue(
      new Error('Product with SKU "SKU-003" already exists'),
    )

    render(
      <MemoryRouter initialEntries={['/products/new']}>
        <Routes>
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products" element={<div>Products list</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await fillRequiredFields(user)

    await user.click(screen.getByRole('button', { name: /Save product/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Product with SKU "SKU-003" already exists',
    )
  })
})
