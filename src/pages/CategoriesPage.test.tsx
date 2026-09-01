import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../api/client'
import type { Category } from '../types'
import { CategoriesPage } from './CategoriesPage'
import { CategoryFormPage } from './CategoryFormPage'

const categories: Category[] = [
  { id: 'cat1', name: 'Accessories', description: 'Computer accessories' },
]

describe('CategoriesPage', () => {
  it('renders the category list', async () => {
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)

    render(
      <MemoryRouter>
        <CategoriesPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Accessories')).toBeInTheDocument()
    expect(screen.getByText('Computer accessories')).toBeInTheDocument()
  })

  it('shows an alert when deletion is blocked because the category is referenced by products', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)
    vi.spyOn(api, 'deleteCategory').mockRejectedValue(
      new Error('Category cat1 is referenced by existing products'),
    )

    render(
      <MemoryRouter>
        <CategoriesPage />
      </MemoryRouter>,
    )

    await screen.findByText('Accessories')
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Category cat1 is referenced by existing products',
    )
    expect(screen.getByText('Accessories')).toBeInTheDocument()
  })
})

describe('CategoryFormPage', () => {
  it('submits a new category', async () => {
    const user = userEvent.setup()
    const createCategory = vi.spyOn(api, 'createCategory').mockResolvedValue({
      id: 'cat2',
      name: 'Furniture',
      description: 'Office furniture',
    })

    render(
      <MemoryRouter initialEntries={['/categories/new']}>
        <Routes>
          <Route path="/categories/new" element={<CategoryFormPage />} />
          <Route path="/categories" element={<div>Categories list</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Name'), 'Furniture')
    await user.type(screen.getByLabelText('Description'), 'Office furniture')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(createCategory).toHaveBeenCalledWith({
      name: 'Furniture',
      description: 'Office furniture',
    })
    expect(await screen.findByText('Categories list')).toBeInTheDocument()
  })

  it('shows an alert when the category name is a duplicate', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'createCategory').mockRejectedValue(
      new Error('Category with name "Accessories" already exists'),
    )

    render(
      <MemoryRouter initialEntries={['/categories/new']}>
        <Routes>
          <Route path="/categories/new" element={<CategoryFormPage />} />
          <Route path="/categories" element={<div>Categories list</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Name'), 'Accessories')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Category with name "Accessories" already exists',
    )
  })
})
