import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NavItem from '../src/components/navigation/NavItem'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('NavItem', () => {
  const defaultProps = {
    label: 'Dashboard',
    href: '/dashboard'
  }

  it('renders with label and href', () => {
    renderWithRouter(<NavItem {...defaultProps} />)

    const link = screen.getByRole('link', { name: /dashboard/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('renders with icon when provided', () => {
    renderWithRouter(
      <NavItem {...defaultProps} icon="📊" />
    )

    expect(screen.getByText('📊')).toBeInTheDocument()
  })

  it('applies active class when active', () => {
    renderWithRouter(
      <NavItem {...defaultProps} active={true} />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('active')
    expect(link).toHaveAttribute('aria-current', 'page')
  })

  it('applies collapsed class when collapsed', () => {
    renderWithRouter(
      <NavItem {...defaultProps} collapsed={true} />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveClass('collapsed')
    expect(link).toHaveAttribute('title', defaultProps.label)
  })

  it('renders badge when provided and not collapsed', () => {
    renderWithRouter(
      <NavItem {...defaultProps} badge="5" />
    )

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('hides badge when collapsed', () => {
    renderWithRouter(
      <NavItem {...defaultProps} badge="5" collapsed={true} />
    )

    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })

  it('shows submenu indicator when submenu is true and not collapsed', () => {
    renderWithRouter(
      <NavItem {...defaultProps} submenu={true} />
    )

    expect(screen.getByText('▼')).toBeInTheDocument()
  })

  it('hides submenu indicator when collapsed', () => {
    renderWithRouter(
      <NavItem {...defaultProps} submenu={true} collapsed={true} />
    )

    expect(screen.queryByText('▼')).not.toBeInTheDocument()
  })

  it('calls onClick when provided', () => {
    const mockClick = vi.fn()
    renderWithRouter(
      <NavItem {...defaultProps} onClick={mockClick} />
    )

    fireEvent.click(screen.getByRole('link'))
    expect(mockClick).toHaveBeenCalledOnce()
  })

  it('renders all visual states correctly', () => {
    renderWithRouter(
      <NavItem
        {...defaultProps}
        icon="📊"
        active={true}
        badge="3"
        submenu={true}
      />
    )

    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('▼')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveClass('active')
  })
})