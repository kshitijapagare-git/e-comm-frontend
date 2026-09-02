import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../api/client'
import type { Category, Supplier } from '../types'
import { ProductFormPage } from './ProductFormPage'

const categories: Category[] = [
  { id: 'cat1', name: 'Accessories', description: 'Computer accessories' },
]

const suppliers: Supplier[] = [{ id: 'sup1', name: 'Acme Supplies' }]

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/products/new']}>
      <Routes>
        <Route path="/products/new" element={<ProductFormPage />} />
        <Route path="/products" element={<div>Products list</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Product Name/i), 'Keyboard')
  await user.type(screen.getByLabelText(/^SKU/i), 'SKU-003')

  const categoryInput = screen.getByLabelText(/^Category/i)
  await user.click(categoryInput)
  const option = await screen.findByRole('option', { name: 'Accessories' })
  await user.click(option)

  const priceInput = screen.getByLabelText(/^Price/i)
  await user.clear(priceInput)
  await user.type(priceInput, '10')

  const stockInput = screen.getByLabelText(/^Stock Quantity/i)
  await user.clear(stockInput)
  await user.type(stockInput, '5')
}

describe('ProductFormPage', () => {
  it('submits a new product once the required fields are filled in', async () => {
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

    renderPage()

    await fillRequiredFields(user)

    await user.click(screen.getByRole('button', { name: /save product/i }))

    await waitFor(() => expect(createProduct).toHaveBeenCalledTimes(1))
    expect(createProduct.mock.calls[0][0]).toMatchObject({
      name: 'Keyboard',
      sku: 'SKU-003',
      price: 10,
      stock: 5,
      status: 'active',
      categoryId: 'cat1',
    })
    expect(await screen.findByText('Products list')).toBeInTheDocument()
  })

  it('keeps save disabled and blocks submit while required fields are missing', async () => {
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)
    vi.spyOn(api, 'getSuppliers').mockResolvedValue(suppliers)
    const createProduct = vi.spyOn(api, 'createProduct')

    renderPage()

    await screen.findByLabelText(/^Category/i)

    expect(screen.getByRole('button', { name: /save product/i })).toBeDisabled()
    expect(createProduct).not.toHaveBeenCalled()
  })

  it('surfaces the API error message when saving fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)
    vi.spyOn(api, 'getSuppliers').mockResolvedValue(suppliers)
    vi.spyOn(api, 'createProduct').mockRejectedValue(new Error('SKU already exists'))

    renderPage()

    await fillRequiredFields(user)

    await user.click(screen.getByRole('button', { name: /save product/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('SKU already exists')
  })
})
