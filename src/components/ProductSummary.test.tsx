import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../api/client'
import type { Category } from '../types'
import { ProductSummary } from './ProductSummary'

const categories: Category[] = [
  { id: 'cat1', name: 'Accessories', description: 'Computer accessories' },
]

describe('ProductSummary', () => {
  it('renders the category name (not the id), sku, stock, price, and a matching status badge', async () => {
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)

    render(
      <ProductSummary
        sku="SKU-001"
        categoryId="cat1"
        stock={42}
        price={19.5}
        status="active"
        trackInventory={false}
      />,
    )

    expect(await screen.findByText('Accessories')).toBeInTheDocument()
    expect(screen.queryByText('cat1')).not.toBeInTheDocument()
    expect(screen.getByText('SKU-001')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('$19.50')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('only renders the stock-tracking note when trackInventory is true', async () => {
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)

    const { rerender } = render(
      <ProductSummary
        sku="SKU-001"
        categoryId="cat1"
        stock={42}
        price={19.5}
        status="active"
        trackInventory={false}
      />,
    )

    await screen.findByText('Accessories')
    expect(screen.queryByText('Stock Tracking')).not.toBeInTheDocument()

    rerender(
      <ProductSummary
        sku="SKU-001"
        categoryId="cat1"
        stock={42}
        price={19.5}
        status="active"
        trackInventory={true}
      />,
    )

    expect(screen.getByText('Stock Tracking')).toBeInTheDocument()
    expect(
      screen.getByText(/Stock will be automatically updated when orders are placed/),
    ).toBeInTheDocument()
  })
})
