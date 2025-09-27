import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Card from '../../../src/components/ui/Card'

describe('Card', () => {
  it('renders children content', () => {
    render(
      <Card>
        <p>Test content</p>
      </Card>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(
      <Card title="Test Title">
        <p>Content</p>
      </Card>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Title')
  })

  it('renders with actions', () => {
    const actions = <button>Action Button</button>

    render(
      <Card actions={actions}>
        <p>Content</p>
      </Card>
    )

    expect(screen.getByText('Action Button')).toBeInTheDocument()
  })

  it('renders with title and actions', () => {
    const actions = <button>Action</button>

    render(
      <Card title="Test Title" actions={actions}>
        <p>Content</p>
      </Card>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('bg-white', 'border', 'border-neutral-200')
  })

  it('applies elevated variant classes', () => {
    const { container } = render(
      <Card variant="elevated">
        <p>Content</p>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('bg-white', 'shadow-lg', 'border-neutral-100')
  })

  it('applies flat variant classes', () => {
    const { container } = render(
      <Card variant="flat">
        <p>Content</p>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('bg-neutral-50')
  })

  it('applies outlined variant classes', () => {
    const { container } = render(
      <Card variant="outlined">
        <p>Content</p>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('bg-white', 'border-2', 'border-neutral-300')
  })

  it('applies small padding classes', () => {
    const { container } = render(
      <Card padding="small">
        <p>Content</p>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('p-3')
  })

  it('applies medium padding classes (default)', () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('p-6')
  })

  it('applies large padding classes', () => {
    const { container } = render(
      <Card padding="large">
        <p>Content</p>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('p-8')
  })

  it('applies no padding classes', () => {
    const { container } = render(
      <Card padding="none">
        <p>Content</p>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('p-0')
  })

  it('applies elevated shadow when elevated prop is true', () => {
    const { container } = render(
      <Card elevated>
        <p>Content</p>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('shadow-md')
  })

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <p>Content</p>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('custom-class')
  })

  it('applies rounded corners by default', () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('rounded-lg')
  })
})