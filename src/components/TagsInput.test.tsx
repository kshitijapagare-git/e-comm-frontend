import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TagsInput } from './TagsInput'

describe('TagsInput', () => {
  it('adds a chip when pressing Enter and removes it when clicking its remove control', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    function ControlledTagsInput() {
      return <TagsInput value={[]} onChange={onChange} />
    }

    const { rerender } = render(<ControlledTagsInput />)

    const input = screen.getByPlaceholderText('Add a tag and press Enter')
    await user.type(input, 'electronics{Enter}')

    expect(onChange).toHaveBeenCalledWith(['electronics'])

    rerender(<TagsInput value={['electronics']} onChange={onChange} />)

    expect(screen.getByText('electronics')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove electronics' }))

    expect(onChange).toHaveBeenCalledWith([])
  })

  it('does not add an empty or duplicate tag', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<TagsInput value={['sale']} onChange={onChange} />)

    const input = screen.getByPlaceholderText('Add a tag and press Enter')
    await user.type(input, '{Enter}')
    expect(onChange).not.toHaveBeenCalled()

    await user.type(input, 'sale{Enter}')
    expect(onChange).not.toHaveBeenCalled()
  })
})
