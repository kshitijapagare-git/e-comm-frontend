import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ImageDropzone } from './ImageDropzone'

function makeFile(name: string, type: string, sizeInBytes: number) {
  const file = new File([new Uint8Array(sizeInBytes)], name, { type })
  return file
}

describe('ImageDropzone', () => {
  it('shows an inline error for an oversized file', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ImageDropzone value={null} onChange={onChange} />)

    const input = screen.getByLabelText('Upload image')
    const bigFile = makeFile('big.png', 'image/png', 3 * 1024 * 1024)
    await user.upload(input, bigFile)

    expect(await screen.findByRole('alert')).toHaveTextContent('Maximum size is 2MB')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows an inline error for an unsupported file type', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ImageDropzone value={null} onChange={onChange} />)

    const input = screen.getByLabelText('Upload image')
    const badFile = makeFile('doc.pdf', 'application/pdf', 1024)
    await user.upload(input, badFile)

    expect(await screen.findByRole('alert')).toHaveTextContent('Unsupported file type')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('produces a preview and calls onChange for a valid file', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')

    render(<ImageDropzone value={null} onChange={onChange} />)

    const input = screen.getByLabelText('Upload image')
    const goodFile = makeFile('logo.png', 'image/png', 1024)
    await user.upload(input, goodFile)

    expect(onChange).toHaveBeenCalledWith('blob:mock-url')
  })

  it('renders a preview thumbnail with remove action when value is set', () => {
    const onChange = vi.fn()
    render(<ImageDropzone value="blob:existing" onChange={onChange} />)

    expect(screen.getByAltText('Product preview')).toHaveAttribute('src', 'blob:existing')
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })
})
