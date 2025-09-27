import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Input, { TextArea } from '../../../src/components/ui/Input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Test input" />)
    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Test Label" />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
  })

  it('shows required asterisk when required', () => {
    render(<Input label="Required Field" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders with error message', () => {
    render(<Input label="Test Field" error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByText('This field is required')).toHaveClass('text-red-600')
  })

  it('renders with helper text when no error', () => {
    render(<Input label="Test Field" helperText="This is helpful text" />)
    expect(screen.getByText('This is helpful text')).toBeInTheDocument()
    expect(screen.getByText('This is helpful text')).toHaveClass('text-neutral-500')
  })

  it('prioritizes error over helper text', () => {
    render(
      <Input
        label="Test Field"
        error="Error message"
        helperText="Helper text"
      />
    )
    expect(screen.getByText('Error message')).toBeInTheDocument()
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
  })

  it('applies error styling when error is present', () => {
    render(<Input error="Error message" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-300', 'focus:ring-red-500', 'focus:border-red-500')
  })

  it('applies normal styling when no error', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-neutral-300')
  })

  it('renders left icon', () => {
    const leftIcon = <span data-testid="left-icon">🔍</span>
    render(<Input leftIcon={leftIcon} />)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders right icon', () => {
    const rightIcon = <span data-testid="right-icon">👁️</span>
    render(<Input rightIcon={rightIcon} />)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('applies left padding when left icon is present', () => {
    const leftIcon = <span>🔍</span>
    render(<Input leftIcon={leftIcon} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('pl-10')
  })

  it('applies right padding when right icon is present', () => {
    const rightIcon = <span>👁️</span>
    render(<Input rightIcon={rightIcon} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('pr-10')
  })

  it('handles different input types', () => {
    render(<Input inputType="email" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:bg-neutral-100')
  })

  it('forwards change events', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'test value' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('applies full width by default', () => {
    const { container } = render(<Input />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('w-full')
  })

  it('can be set to not full width', () => {
    const { container } = render(<Input fullWidth={false} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).not.toHaveClass('w-full')
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('generates unique id when not provided', () => {
    render(<Input label="Test Label" />)
    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveAttribute('id')
  })

  it('uses provided id', () => {
    render(<Input label="Test Label" id="custom-id" />)
    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveAttribute('id', 'custom-id')
  })
})

describe('TextArea', () => {
  it('renders textarea element', () => {
    render(<TextArea placeholder="Test textarea" />)
    expect(screen.getByPlaceholderText('Test textarea')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<TextArea label="Test Label" />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
  })

  it('shows required asterisk when required', () => {
    render(<TextArea label="Required Field" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders with error message', () => {
    render(<TextArea label="Test Field" error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByText('This field is required')).toHaveClass('text-red-600')
  })

  it('renders with helper text', () => {
    render(<TextArea label="Test Field" helperText="This is helpful text" />)
    expect(screen.getByText('This is helpful text')).toBeInTheDocument()
    expect(screen.getByText('This is helpful text')).toHaveClass('text-neutral-500')
  })

  it('applies error styling when error is present', () => {
    render(<TextArea error="Error message" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('border-red-300', 'focus:ring-red-500', 'focus:border-red-500')
  })

  it('sets default rows to 4', () => {
    render(<TextArea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '4')
  })

  it('applies custom rows', () => {
    render(<TextArea rows={6} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '6')
  })

  it('is disabled when disabled prop is true', () => {
    render(<TextArea disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('forwards change events', () => {
    const handleChange = vi.fn()
    render(<TextArea onChange={handleChange} />)
    const textarea = screen.getByRole('textbox')

    fireEvent.change(textarea, { target: { value: 'test value' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('has resize-vertical class', () => {
    render(<TextArea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('resize-vertical')
  })

  it('applies custom className', () => {
    render(<TextArea className="custom-class" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('custom-class')
  })
})