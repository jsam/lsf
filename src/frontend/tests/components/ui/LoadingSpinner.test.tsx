import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner, { SkeletonLine, SkeletonCard } from '../../../src/components/ui/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders inline spinner by default', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders with medium size by default', () => {
    const { container } = render(<LoadingSpinner />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('h-8', 'w-8')
  })

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="small" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('h-4', 'w-4')
  })

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="large" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('h-12', 'w-12')
  })

  it('applies custom color class', () => {
    const { container } = render(<LoadingSpinner color="text-red-500" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-red-500')
  })

  it('applies default primary color', () => {
    const { container } = render(<LoadingSpinner />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-primary-600')
  })

  it('renders loading text when provided', () => {
    render(<LoadingSpinner text="Loading..." />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('applies correct text size for small spinner', () => {
    render(<LoadingSpinner size="small" text="Loading..." />)
    const text = screen.getByText('Loading...')
    expect(text).toHaveClass('text-sm')
  })

  it('applies correct text size for medium spinner', () => {
    render(<LoadingSpinner size="medium" text="Loading..." />)
    const text = screen.getByText('Loading...')
    expect(text).toHaveClass('text-base')
  })

  it('applies correct text size for large spinner', () => {
    render(<LoadingSpinner size="large" text="Loading..." />)
    const text = screen.getByText('Loading...')
    expect(text).toHaveClass('text-lg')
  })

  it('renders overlay variant with backdrop', () => {
    const { container } = render(<LoadingSpinner variant="overlay" />)
    const overlay = container.firstChild as HTMLElement
    expect(overlay).toHaveClass('fixed', 'inset-0', 'bg-white', 'bg-opacity-75', 'z-50')
  })

  it('renders skeleton variant with animated placeholders', () => {
    const { container } = render(<LoadingSpinner variant="skeleton" />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('animate-pulse')
    expect(container.querySelectorAll('.bg-neutral-200')).toHaveLength(3)
  })

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-class')
  })

  it('centers content by default', () => {
    const { container } = render(<LoadingSpinner />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center')
  })
})

describe('SkeletonLine', () => {
  it('renders with default full width', () => {
    const { container } = render(<SkeletonLine />)
    const line = container.firstChild as HTMLElement
    expect(line).toHaveClass('w-full', 'animate-pulse', 'bg-neutral-200', 'rounded-md', 'h-4')
  })

  it('applies custom width', () => {
    const { container } = render(<SkeletonLine width="w-1/2" />)
    const line = container.firstChild as HTMLElement
    expect(line).toHaveClass('w-1/2')
  })

  it('applies custom className', () => {
    const { container } = render(<SkeletonLine className="custom-class" />)
    const line = container.firstChild as HTMLElement
    expect(line).toHaveClass('custom-class')
  })
})

describe('SkeletonCard', () => {
  it('renders card skeleton with header and content lines', () => {
    const { container } = render(<SkeletonCard />)
    const card = container.firstChild as HTMLElement

    expect(card).toHaveClass('animate-pulse', 'p-6', 'border', 'border-neutral-200', 'rounded-lg')

    // Header skeleton
    expect(container.querySelector('.h-6.w-1\\/3')).toBeInTheDocument()

    // Content lines (only 3 content lines have h-4 class)
    expect(container.querySelectorAll('.h-4')).toHaveLength(3)
  })

  it('applies custom className', () => {
    const { container } = render(<SkeletonCard className="custom-class" />)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('custom-class')
  })
})