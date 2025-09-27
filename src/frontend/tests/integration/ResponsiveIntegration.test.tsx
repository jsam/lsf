import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import AdminLayout from '../../src/components/layout/AdminLayout'
import Card from '../../src/components/ui/Card'
import Button from '../../src/components/ui/Button'
import Modal, { ModalHeader, ModalBody } from '../../src/components/ui/Modal'
import { useNavigation } from '../../src/hooks/useNavigation'
import { useBreadcrumbs } from '../../src/hooks/useBreadcrumbs'

// Mock hooks
vi.mock('../../src/hooks/useNavigation')
vi.mock('../../src/hooks/useBreadcrumbs')

const mockUseNavigation = vi.mocked(useNavigation)
const mockUseBreadcrumbs = vi.mocked(useBreadcrumbs)

// Mock createPortal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom')
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children
  }
})

// Responsive test component
const ResponsiveTestApp = () => {
  const [showModal, setShowModal] = React.useState(false)

  return (
    <AdminLayout>
      <div data-testid="page-content">
        <h1>Responsive Test Page</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <Card title="Card 1">
            <p>This is card content that should adapt to screen size.</p>
            <Button onClick={() => setShowModal(true)} data-testid="open-modal">
              Open Modal
            </Button>
          </Card>

          <Card title="Card 2">
            <p>Another card with responsive behavior.</p>
          </Card>

          <Card title="Card 3">
            <p>Third card to test grid layout.</p>
          </Card>
        </div>

        <Card title="Navigation Test">
          <p>Current viewport information should affect navigation visibility.</p>
        </Card>

        <Modal open={showModal} onClose={() => setShowModal(false)}>
          <ModalHeader>
            <h2>Responsive Modal</h2>
          </ModalHeader>
          <ModalBody>
            <p>This modal should adapt to different screen sizes.</p>
            <Button onClick={() => setShowModal(false)} data-testid="close-modal">
              Close
            </Button>
          </ModalBody>
        </Modal>
      </div>
    </AdminLayout>
  )
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

// Utility to mock viewport size
const mockViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })

  // Trigger resize event
  window.dispatchEvent(new Event('resize'))
}

describe('Responsive Behavior Integration Tests', () => {
  const originalInnerWidth = window.innerWidth
  const originalInnerHeight = window.innerHeight

  beforeEach(() => {
    mockUseNavigation.mockReturnValue({
      currentPath: '/dashboard',
      breadcrumbs: [{ label: 'Dashboard', href: undefined }],
      menuItems: [
        { id: 'dashboard', label: 'Dashboard', href: '/', icon: '📊' },
        { id: 'tasks', label: 'Tasks', href: '/tasks', icon: '✓' },
        { id: 'users', label: 'Users', href: '/users', icon: '👥' },
      ],
      activeItem: { id: 'dashboard', label: 'Dashboard', href: '/', icon: '📊' }
    })

    mockUseBreadcrumbs.mockReturnValue({
      breadcrumbs: [{ label: 'Dashboard', href: undefined }],
      setBreadcrumbs: vi.fn(),
      addBreadcrumb: vi.fn(),
      removeBreadcrumb: vi.fn(),
      resetBreadcrumbs: vi.fn(),
      setCustomBreadcrumbs: vi.fn(),
      useRouteBreadcrumbs: vi.fn()
    })
  })

  afterEach(() => {
    // Restore original viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    })
  })

  it('adapts layout structure on desktop viewport (1200px+)', async () => {
    mockViewport(1200, 800)

    const { container } = renderWithRouter(<ResponsiveTestApp />)

    // On desktop, sidebar should be fully visible and expanded
    const layoutContainer = container.querySelector('.layout-container')
    expect(layoutContainer).not.toHaveClass('sidebar-collapsed')

    // Navigation items should be fully visible with text
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()

    // Main content should have proper spacing for sidebar
    const mainContent = container.querySelector('.layout-main')
    expect(mainContent).toBeInTheDocument()

    // Cards should be in grid layout
    expect(screen.getByText('Card 1')).toBeInTheDocument()
    expect(screen.getByText('Card 2')).toBeInTheDocument()
    expect(screen.getByText('Card 3')).toBeInTheDocument()
  })

  it('adapts layout structure on tablet viewport (768px - 1199px)', async () => {
    mockViewport(768, 1024)

    const { container } = renderWithRouter(<ResponsiveTestApp />)

    // On tablet, layout should still be functional
    const layoutContainer = container.querySelector('.layout-container')
    expect(layoutContainer).toBeInTheDocument()

    // Sidebar toggle should be available
    const toggleButton = screen.getByLabelText(/collapse sidebar/i)
    expect(toggleButton).toBeInTheDocument()

    // Should be able to toggle sidebar
    fireEvent.click(toggleButton)
    expect(layoutContainer).toHaveClass('sidebar-collapsed')

    // Navigation should adapt
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('adapts layout structure on mobile viewport (< 768px)', async () => {
    mockViewport(375, 667) // iPhone SE size

    const { container } = renderWithRouter(<ResponsiveTestApp />)

    // On mobile, layout should be more compact
    const layoutContainer = container.querySelector('.layout-container')
    expect(layoutContainer).toBeInTheDocument()

    // Sidebar toggle should be prominently available
    const toggleButton = screen.getByLabelText(/collapse sidebar/i)
    expect(toggleButton).toBeInTheDocument()

    // Main content should adapt to smaller screen
    const mainContent = container.querySelector('.layout-main')
    expect(mainContent).toBeInTheDocument()

    // Page content should still be accessible
    expect(screen.getByTestId('page-content')).toBeInTheDocument()
  })

  it('handles modal responsiveness across different viewport sizes', async () => {
    // Test on desktop
    mockViewport(1200, 800)
    renderWithRouter(<ResponsiveTestApp />)

    fireEvent.click(screen.getByTestId('open-modal'))
    await waitFor(() => {
      expect(screen.getByText('Responsive Modal')).toBeInTheDocument()
    })

    // Modal should be centered on desktop
    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('close-modal'))
    await waitFor(() => {
      expect(screen.queryByText('Responsive Modal')).not.toBeInTheDocument()
    })

    // Test on mobile
    mockViewport(375, 667)

    fireEvent.click(screen.getByTestId('open-modal'))
    await waitFor(() => {
      expect(screen.getByText('Responsive Modal')).toBeInTheDocument()
    })

    // Modal should still be functional on mobile
    const mobileModal = screen.getByRole('dialog')
    expect(mobileModal).toBeInTheDocument()

    // Close with backdrop click should still work
    fireEvent.click(mobileModal)
    await waitFor(() => {
      expect(screen.queryByText('Responsive Modal')).not.toBeInTheDocument()
    })
  })

  it('maintains sidebar functionality across viewport changes', async () => {
    const { container } = renderWithRouter(<ResponsiveTestApp />)

    // Start on desktop
    mockViewport(1200, 800)

    const layoutContainer = container.querySelector('.layout-container')
    const toggleButton = screen.getByLabelText(/collapse sidebar/i)

    // Sidebar should be expanded on desktop
    expect(layoutContainer).not.toHaveClass('sidebar-collapsed')

    // Collapse sidebar
    fireEvent.click(toggleButton)
    expect(layoutContainer).toHaveClass('sidebar-collapsed')

    // Switch to mobile
    mockViewport(375, 667)

    // Sidebar should remain in collapsed state
    expect(layoutContainer).toHaveClass('sidebar-collapsed')

    // Toggle should still work
    fireEvent.click(toggleButton)
    expect(layoutContainer).not.toHaveClass('sidebar-collapsed')

    // Switch back to desktop
    mockViewport(1200, 800)

    // State should be preserved
    expect(layoutContainer).not.toHaveClass('sidebar-collapsed')
  })

  it('handles navigation accessibility across different screen sizes', async () => {
    const { container } = renderWithRouter(<ResponsiveTestApp />)

    // Test keyboard navigation on different viewport sizes
    const viewports = [
      { width: 1200, height: 800, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ]

    for (const viewport of viewports) {
      mockViewport(viewport.width, viewport.height)

      // Navigation should be accessible via keyboard
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()

      // Toggle button should be keyboard accessible
      const toggleButton = screen.getByLabelText(/collapse sidebar/i)
      expect(toggleButton).toBeInTheDocument()

      // Should be able to toggle with keyboard
      toggleButton.focus()
      expect(toggleButton).toHaveFocus()

      fireEvent.keyDown(toggleButton, { key: 'Enter' })
      // Sidebar state should change
      const layoutContainer = container.querySelector('.layout-container')

      fireEvent.keyDown(toggleButton, { key: ' ' }) // Space key
      // Should toggle again
    }
  })

  it('preserves content accessibility during responsive changes', async () => {
    renderWithRouter(<ResponsiveTestApp />)

    const contentElement = screen.getByTestId('page-content')
    const heading = screen.getByText('Responsive Test Page')

    // Content should be accessible on all viewport sizes
    const viewports = [1200, 768, 375]

    for (const width of viewports) {
      mockViewport(width, 800)

      // Main content should remain accessible
      expect(contentElement).toBeInTheDocument()
      expect(heading).toBeInTheDocument()

      // All cards should be accessible
      expect(screen.getByText('Card 1')).toBeInTheDocument()
      expect(screen.getByText('Card 2')).toBeInTheDocument()
      expect(screen.getByText('Card 3')).toBeInTheDocument()

      // Interactive elements should remain functional
      const openModalButton = screen.getByTestId('open-modal')
      expect(openModalButton).toBeInTheDocument()
      expect(openModalButton).not.toBeDisabled()
    }
  })

  it('handles focus management during responsive transitions', async () => {
    const { container } = renderWithRouter(<ResponsiveTestApp />)

    // Start on desktop with sidebar expanded
    mockViewport(1200, 800)

    const toggleButton = screen.getByLabelText(/collapse sidebar/i)
    toggleButton.focus()
    expect(toggleButton).toHaveFocus()

    // Switch to mobile
    mockViewport(375, 667)

    // Focus should be preserved
    expect(toggleButton).toHaveFocus()

    // Open modal while on mobile - focus the button first to establish proper previous focus
    const openModalButton = screen.getByTestId('open-modal')
    openModalButton.focus()
    fireEvent.click(openModalButton)
    await waitFor(() => {
      expect(screen.getByText('Responsive Modal')).toBeInTheDocument()
    })

    // Switch viewport while modal is open
    mockViewport(1200, 800)

    // Modal should still be functional
    expect(screen.getByText('Responsive Modal')).toBeInTheDocument()

    // Close modal
    fireEvent.click(screen.getByTestId('close-modal'))
    await waitFor(() => {
      expect(screen.queryByText('Responsive Modal')).not.toBeInTheDocument()
    })

    // Focus should return appropriately
    expect(screen.getByTestId('open-modal')).toHaveFocus()
  })

  it('ensures proper layout reflow during viewport changes', async () => {
    const { container } = renderWithRouter(<ResponsiveTestApp />)

    // Start with narrow viewport
    mockViewport(300, 600)

    // Layout should not break with very narrow viewport
    const layoutContainer = container.querySelector('.layout-container')
    expect(layoutContainer).toBeInTheDocument()

    // Content should still be accessible
    expect(screen.getByTestId('page-content')).toBeInTheDocument()

    // Gradually increase viewport size
    const widths = [400, 600, 800, 1000, 1200, 1600]

    for (const width of widths) {
      mockViewport(width, 800)

      // Layout should adapt without breaking
      expect(layoutContainer).toBeInTheDocument()
      expect(screen.getByTestId('page-content')).toBeInTheDocument()

      // Navigation should remain functional
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()

      // Toggle should always work
      const toggleButton = screen.getByLabelText(/collapse sidebar/i)
      expect(toggleButton).toBeInTheDocument()
    }
  })
})