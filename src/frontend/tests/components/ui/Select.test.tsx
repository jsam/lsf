import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Select from '../../../src/components/ui/Select'

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'disabled', label: 'Disabled Option', disabled: true }
]

describe('Select', () => {
  it('renders with placeholder', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} placeholder="Select option" />)
    expect(screen.getByText('Select option')).toBeInTheDocument()
  })

  it('renders with label', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} label="Test Label" />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('shows required asterisk when required', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} label="Required Field" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders with error message', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('renders with helper text', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} helperText="Choose an option" />)
    expect(screen.getByText('Choose an option')).toBeInTheDocument()
  })

  it('opens dropdown when clicked', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', async () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  it('selects option and calls onChange', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const option = screen.getByText('Option 1')
    fireEvent.click(option)

    expect(onChange).toHaveBeenCalledWith('option1')
  })

  it('displays selected option label', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} value="option1" onChange={onChange} />)
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('supports multiple selection', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} multiple onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const option1 = screen.getByText('Option 1')
    const option2 = screen.getByText('Option 2')

    fireEvent.click(option1)
    expect(onChange).toHaveBeenCalledWith(['option1'])

    fireEvent.click(option2)
    expect(onChange).toHaveBeenCalledWith(['option2'])
  })

  it('displays multiple selected values as tags', () => {
    const onChange = vi.fn()
    render(
      <Select
        options={mockOptions}
        value={['option1', 'option2']}
        multiple
        onChange={onChange}
      />
    )

    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('removes selected value when clicking remove button in multiple mode', () => {
    const onChange = vi.fn()
    render(
      <Select
        options={mockOptions}
        value={['option1', 'option2']}
        multiple
        onChange={onChange}
      />
    )

    const removeButtons = screen.getAllByText('×')
    fireEvent.click(removeButtons[0])

    expect(onChange).toHaveBeenCalledWith(['option2'])
  })

  it('shows searchable input when searchable is true', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} searchable onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    expect(screen.getByPlaceholderText('Search options...')).toBeInTheDocument()
  })

  it('filters options based on search term', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} searchable onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const searchInput = screen.getByPlaceholderText('Search options...')
    fireEvent.change(searchInput, { target: { value: 'Option 1' } })

    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.queryByText('Option 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Option 3')).not.toBeInTheDocument()
  })

  it('shows "No options found" when search has no results', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} searchable onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const searchInput = screen.getByPlaceholderText('Search options...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(screen.getByText('No options found')).toBeInTheDocument()
  })

  it('disables trigger when disabled prop is true', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} disabled onChange={onChange} />)

    const trigger = screen.getByRole('button')
    expect(trigger).toBeDisabled()
  })

  it('does not open dropdown when disabled', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} disabled onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows disabled styling for disabled options', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const disabledOption = screen.getByText('Disabled Option').closest('li')
    expect(disabledOption).toHaveClass('text-neutral-400', 'cursor-not-allowed')
  })

  it('does not select disabled options', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const disabledOption = screen.getByText('Disabled Option')
    fireEvent.click(disabledOption)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows checkmark for selected options in multiple mode', () => {
    const onChange = vi.fn()
    render(
      <Select
        options={mockOptions}
        value={['option1']}
        multiple
        onChange={onChange}
      />
    )

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    // Get all "Option 1" elements and find the one in the dropdown (the li element)
    const allOption1Elements = screen.getAllByText('Option 1')
    const dropdownOption = allOption1Elements.find(el => el.closest('li'))?.closest('li')
    expect(dropdownOption?.querySelector('svg')).toBeInTheDocument()
  })

  it('applies error styling when error is present', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} error="Error message" onChange={onChange} />)

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveClass('border-red-300')
  })

  it('applies custom className', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} className="custom-class" onChange={onChange} />)

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveClass('custom-class')
  })

  it('shows individual tags for multiple selections', () => {
    const onChange = vi.fn()
    render(
      <Select
        options={mockOptions}
        value={['option1', 'option2', 'option3']}
        multiple
        onChange={onChange}
      />
    )

    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} />)

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})