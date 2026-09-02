import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../api/client'
import type { Category, Product } from '../types'
import { ProductsPage } from './ProductsPage'

const categories: Category[] = [
  { id: 'cat1', name: 'Accessories', description: 'Computer accessories' },
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
