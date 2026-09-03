import { render, screen } from '@testing-library/react'
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

function renderNewProductForm() {
  return render(
    <MemoryRouter initialEntries={['/products/new']}>
      <Routes>
        <Route path="/products/new" element={<ProductFormPage />} />
        <Route path="/products" element={<div>Products list</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function selectCategory(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('combobox'))
  const option = await screen.findByRole('option', { name })
  await user.click(option)
}

describe('ProductFormPage', () => {
  it('submits a new product with the entered values', async () => {
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

    renderNewProductForm()

    await user.type(screen.getByLabelText(/^Product Name/i), 'Keyboard')
    await user.type(screen.getByLabelText(/^SKU/i), 'SKU-003')
    await user.clear(screen.getByLabelText(/^Price/i))
    await user.type(screen.getByLabelText(/^Price/i), '10')
    await user.clear(screen.getByLabelText(/^Stock Quantity/i))
    await user.type(screen.getByLabelText(/^Stock Quantity/i), '5')
    await selectCategory(user, 'Accessories')

    await user.click(screen.getByRole('button', { name: 'Save product' }))

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

  it('keeps the save button disabled until required fields are valid', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)
    vi.spyOn(api, 'getSuppliers').mockResolvedValue(suppliers)

    renderNewProductForm()

    await user.type(screen.getByLabelText(/^Product Name/i), 'Keyboard')
    await user.clear(screen.getByLabelText(/^Price/i))
    await user.type(screen.getByLabelText(/^Price/i), '10')
    await user.clear(screen.getByLabelText(/^Stock Quantity/i))
    await user.type(screen.getByLabelText(/^Stock Quantity/i), '5')
    await selectCategory(user, 'Accessories')

    expect(screen.getByRole('button', { name: 'Save product' })).toBeDisabled()

    await user.type(screen.getByLabelText(/^SKU/i), 'SKU-003')

    expect(screen.getByRole('button', { name: 'Save product' })).not.toBeDisabled()
  })

  it('updates the live summary as fields change without submitting', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)
    vi.spyOn(api, 'getSuppliers').mockResolvedValue(suppliers)

    const { container } = renderNewProductForm()

    await user.type(screen.getByLabelText(/^SKU/i), 'SKU-003')
    await user.clear(screen.getByLabelText(/^Price/i))
    await user.type(screen.getByLabelText(/^Price/i), '10')
    await user.clear(screen.getByLabelText(/^Stock Quantity/i))
    await user.type(screen.getByLabelText(/^Stock Quantity/i), '5')
    await selectCategory(user, 'Accessories')

    const summary = container.querySelector('.summary-card')
    expect(summary?.textContent).toContain('SKU-003')
    expect(summary?.textContent).toContain('Accessories')
    expect(summary?.textContent).toContain('5')
    expect(summary?.textContent).toContain('$10.00')
  })

  it('shows the real API error message when saving fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)
    vi.spyOn(api, 'getSuppliers').mockResolvedValue(suppliers)
    vi.spyOn(api, 'createProduct').mockRejectedValue(new Error('SKU already in use'))

    renderNewProductForm()

    await user.type(screen.getByLabelText(/^Product Name/i), 'Keyboard')
    await user.type(screen.getByLabelText(/^SKU/i), 'SKU-003')
    await user.clear(screen.getByLabelText(/^Price/i))
    await user.type(screen.getByLabelText(/^Price/i), '10')
    await user.clear(screen.getByLabelText(/^Stock Quantity/i))
    await user.type(screen.getByLabelText(/^Stock Quantity/i), '5')
    await selectCategory(user, 'Accessories')

    await user.click(screen.getByRole('button', { name: 'Save product' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('SKU already in use')
  })
})
