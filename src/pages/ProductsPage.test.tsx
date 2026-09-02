import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../api/client'
import type { Category, Product } from '../types'
import { ProductFormPage } from './ProductFormPage'
import { ProductsPage } from './ProductsPage'

const categories: Category[] = [
  { id: 'cat1', name: 'Accessories', description: 'Computer accessories' },
]

const products: Product[] = [
  { id: 'p1', name: 'Wireless Mouse', sku: 'SKU-001', price: 25.99, stock: 120, status: 'active', categoryId: 'cat1' },
]

async function selectCategory(user: ReturnType<typeof userEvent.setup>, name: string) {
  const categoryInput = screen.getByRole('combobox', { name: 'Category' })
  await user.type(categoryInput, name)
  const option = await screen.findByRole('option', { name })
  await user.click(option)
}

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
  it('keeps the save button disabled until required fields are filled', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)
    vi.spyOn(api, 'getSuppliers').mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={['/products/new']}>
        <Routes>
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products" element={<div>Products list</div>} />
        </Routes>
      </MemoryRouter>,
    )

    const saveButton = screen.getByRole('button', { name: 'Save product' })
    expect(saveButton).toBeDisabled()

    await user.type(screen.getByLabelText(/Product Name/), 'Keyboard')
    await user.type(screen.getByLabelText(/SKU/), 'SKU-003')
    await user.type(screen.getByLabelText(/Price/), '10')
    await user.type(screen.getByLabelText(/Stock Quantity/), '5')

    expect(saveButton).toBeDisabled()

    await selectCategory(user, 'Accessories')

    expect(saveButton).not.toBeDisabled()
  })

  it('submits a new product with the extended payload', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)
    vi.spyOn(api, 'getSuppliers').mockResolvedValue([])
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

    await user.type(screen.getByLabelText(/Product Name/), 'Keyboard')
    await user.type(screen.getByLabelText(/SKU/), 'SKU-003')
    await user.type(screen.getByLabelText(/Price/), '10')
    await user.type(screen.getByLabelText(/Stock Quantity/), '5')
    await selectCategory(user, 'Accessories')

    const saveButton = screen.getByRole('button', { name: 'Save product' })
    await user.click(saveButton)

    expect(createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Keyboard',
        sku: 'SKU-003',
        price: 10,
        stock: 5,
        status: 'active',
        categoryId: 'cat1',
      }),
    )
    expect(await screen.findByText('Products list')).toBeInTheDocument()
  })

  it('shows the API error message when saving fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)
    vi.spyOn(api, 'getSuppliers').mockResolvedValue([])
    vi.spyOn(api, 'createProduct').mockRejectedValue(new Error('SKU "SKU-003" already exists'))

    render(
      <MemoryRouter initialEntries={['/products/new']}>
        <Routes>
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products" element={<div>Products list</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/Product Name/), 'Keyboard')
    await user.type(screen.getByLabelText(/SKU/), 'SKU-003')
    await user.type(screen.getByLabelText(/Price/), '10')
    await user.type(screen.getByLabelText(/Stock Quantity/), '5')
    await selectCategory(user, 'Accessories')

    await user.click(screen.getByRole('button', { name: 'Save product' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('SKU "SKU-003" already exists')
  })

  it('reflects typed values live in the product summary sidebar', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)
    vi.spyOn(api, 'getSuppliers').mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={['/products/new']}>
        <Routes>
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products" element={<div>Products list</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Product Summary')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/SKU/), 'SKU-003')
    await user.type(screen.getByLabelText(/Stock Quantity/), '5')
    await selectCategory(user, 'Accessories')

    expect(await screen.findByText('SKU-003')).toBeInTheDocument()
    expect(screen.getAllByText('Accessories').length).toBeGreaterThan(0)
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
