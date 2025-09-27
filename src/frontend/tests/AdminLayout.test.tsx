import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AdminLayout from '../src/components/layout/AdminLayout'

// Mock child component for testing
const TestContent = () => <div data-testid="test-content">Test Content</div>

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('AdminLayout', () => {
  it('renders children content', () => {
    renderWithRouter(
      <AdminLayout>
        <TestContent />
      </AdminLayout>
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('renders with sidebar expanded by default', () => {
    const { container } = renderWithRouter(
      <AdminLayout>
        <TestContent />
      </AdminLayout>
    )

    const layoutContainer = container.querySelector('.layout-container')
    expect(layoutContainer).not.toHaveClass('sidebar-collapsed')
  })

  it('handles controlled collapsed state', () => {
    const { container } = renderWithRouter(
      <AdminLayout sidebarCollapsed={true}>
        <TestContent />
      </AdminLayout>
    )

    const layoutContainer = container.querySelector('.layout-container')
    expect(layoutContainer).toHaveClass('sidebar-collapsed')
  })

  it('calls onSidebarToggle when toggle button is clicked', () => {
    const mockToggle = vi.fn()
    renderWithRouter(
      <AdminLayout onSidebarToggle={mockToggle}>
        <TestContent />
      </AdminLayout>
    )

    const toggleButton = screen.getByLabelText(/collapse sidebar/i)
    fireEvent.click(toggleButton)

    expect(mockToggle).toHaveBeenCalledWith(true)
  })

  it('manages internal state when not controlled', () => {
    const { container } = renderWithRouter(
      <AdminLayout>
        <TestContent />
      </AdminLayout>
    )

    const layoutContainer = container.querySelector('.layout-container')
    const toggleButton = screen.getByLabelText(/collapse sidebar/i)

    // Initially expanded
    expect(layoutContainer).not.toHaveClass('sidebar-collapsed')

    // Click to collapse
    fireEvent.click(toggleButton)
    expect(layoutContainer).toHaveClass('sidebar-collapsed')

    // Click to expand
    fireEvent.click(toggleButton)
    expect(layoutContainer).not.toHaveClass('sidebar-collapsed')
  })

  it('renders all layout sections', () => {
    const { container } = renderWithRouter(
      <AdminLayout>
        <TestContent />
      </AdminLayout>
    )

    expect(container.querySelector('.layout-sidebar')).toBeInTheDocument()
    expect(container.querySelector('.layout-header')).toBeInTheDocument()
    expect(container.querySelector('.layout-main')).toBeInTheDocument()
  })
})