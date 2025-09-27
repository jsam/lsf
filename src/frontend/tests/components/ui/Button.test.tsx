import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from '../../../src/components/ui/Button'

describe('Button', () => {
  it('renders children content', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies primary variant classes by default', () => {
    render(<Button>Primary Button</Button>)
    const button = screen.getByText('Primary Button')
    expect(button).toHaveClass('bg-primary-600', 'text-white')
  })

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    const button = screen.getByText('Secondary Button')
    expect(button).toHaveClass('bg-neutral-100', 'text-neutral-900')
  })

  it('applies outline variant classes', () => {
    render(<Button variant="outline">Outline Button</Button>)
    const button = screen.getByText('Outline Button')
    expect(button).toHaveClass('bg-transparent', 'text-primary-600', 'border-primary-600')
  })

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    const button = screen.getByText('Ghost Button')
    expect(button).toHaveClass('bg-transparent', 'text-neutral-600')
  })

  it('applies danger variant classes', () => {
    render(<Button variant="danger">Danger Button</Button>)
    const button = screen.getByText('Danger Button')
    expect(button).toHaveClass('bg-red-600', 'text-white')
  })

  it('applies small size classes', () => {
    render(<Button size="small">Small Button</Button>)
    const button = screen.getByText('Small Button')
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
  })

  it('applies medium size classes by default', () => {
    render(<Button>Medium Button</Button>)
    const button = screen.getByText('Medium Button')
    expect(button).toHaveClass('px-4', 'py-2', 'text-base')
  })

  it('applies large size classes', () => {
    render(<Button size="large">Large Button</Button>)
    const button = screen.getByText('Large Button')
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('shows loading spinner when loading', () => {
    render(<Button loading>Loading Button</Button>)
    const button = screen.getByText('Loading Button')
    expect(button.querySelector('svg')).toBeInTheDocument()
    expect(button.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('is disabled when loading', () => {
    render(<Button loading>Loading Button</Button>)
    const button = screen.getByText('Loading Button')
    expect(button).toBeDisabled()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByText('Disabled Button')
    expect(button).toBeDisabled()
  })

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>)

    fireEvent.click(screen.getByText('Disabled Button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn()
    render(<Button loading onClick={handleClick}>Loading Button</Button>)

    fireEvent.click(screen.getByText('Loading Button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders icon when provided', () => {
    const icon = <span data-testid="icon">🚀</span>
    render(<Button icon={icon}>Button with Icon</Button>)

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('🚀')).toBeInTheDocument()
  })

  it('does not render icon when loading', () => {
    const icon = <span data-testid="icon">🚀</span>
    render(<Button loading icon={icon}>Loading Button</Button>)

    expect(screen.queryByTestId('icon')).not.toBeInTheDocument()
  })

  it('applies full width classes when fullWidth is true', () => {
    render(<Button fullWidth>Full Width Button</Button>)
    const button = screen.getByText('Full Width Button')
    expect(button).toHaveClass('w-full')
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    const button = screen.getByText('Custom Button')
    expect(button).toHaveClass('custom-class')
  })

  it('forwards other HTML button props', () => {
    render(<Button type="submit" data-testid="submit-button">Submit</Button>)
    const button = screen.getByTestId('submit-button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('has base accessibility classes', () => {
    render(<Button>Accessible Button</Button>)
    const button = screen.getByText('Accessible Button')
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2')
  })
})