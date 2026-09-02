import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../api/client'
import type { Category } from '../types'
import { CategoryCombobox } from './CategoryCombobox'

const categories: Category[] = [
  { id: 'cat1', name: 'Accessories', description: 'Computer accessories' },
  { id: 'cat2', name: 'Furniture', description: 'Office furniture' },
]

function Wrapper({ value = '', onChange = vi.fn() }: { value?: string; onChange?: (id: string) => void }) {
  return (
    <MemoryRouter>
      <CategoryCombobox value={value} onChange={onChange} />
    </MemoryRouter>
  )
}

describe('CategoryCombobox', () => {
  it('shows a loading state before categories resolve, then shows filtered options', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCategories').mockResolvedValue(categories)

    render(<Wrapper />)

    const combobox = screen.getByRole('combobox')
    await user.click(combobox)

    expect(screen.getByText('Loading categories…')).toBeInTheDocument()

    expect(await screen.findByRole('option', { name: 'Accessories' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Furniture' })).toBeInTheDocument()

    await user.type(combobox, 'Furn')

    expect(screen.queryByRole('option', { name: 'Accessories' })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Furniture' })).toBeInTheDocument()
  })

  it('shows an empty state with a create-category link when there are no categories', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'getCategories').mockResolvedValue([])

    render(<Wrapper />)

    await user.click(screen.getByRole('combobox'))

    expect(await screen.findByText('No categories found.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create category' })).toHaveAttribute(
      'href',
      '/categories/new',
    )
  })
})
