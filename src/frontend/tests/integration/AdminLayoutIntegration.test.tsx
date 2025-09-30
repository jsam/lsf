import { render, screen, fireEvent, within, cleanup } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import AdminLayout from '../../src/components/layout/AdminLayout'
import { useNavigation } from '../../src/hooks/useNavigation'
import { useBreadcrumbs } from '../../src/hooks/useBreadcrumbs'

// Mock hooks
vi.mock('../../src/hooks/useNavigation')
vi.mock('../../src/hooks/useBreadcrumbs')

const mockUseNavigation = vi.mocked(useNavigation)
const mockUseBreadcrumbs = vi.mocked(useBreadcrumbs)

// Mock components for testing
const TestPageContent = () => (
  <div data-testid="page-content">
    <h1>Test Page</h1>
    <p>Page content here</p>
  </div>
)

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('AdminLayout Integration Tests', () => {
  beforeEach(() => {
    mockUseNavigation.mockReturnValue({
      currentPath: '/dashboard',
      breadcrumbs: [
        { label: 'Dashboard', href: undefined }
      ],
      menuItems: [
        { id: 'dashboard', label: 'Dashboard', href: '/', icon: '📊' },
        { id: 'tasks', label: 'Tasks', href: '/tasks', icon: '✓' },
        { id: 'users', label: 'Users', href: '/users', icon: '👥' },
        { id: 'settings', label: 'Settings', href: '/settings', icon: '⚙️' }
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
    // Clean up after each test to prevent pollution
    cleanup()
    vi.clearAllMocks()
    vi.restoreAllMocks()

    // Reset window location
    window.history.pushState({}, '', '/')

    // Clear any DOM modifications
    document.body.innerHTML = ''
  })

  it('renders full layout with navigation and content', () => {
    const { container } = renderWithRouter(
      <AdminLayout>
        <TestPageContent />
      </AdminLayout>
    )

    // Check all layout sections are present
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(container.querySelector('.layout-header')).toBeInTheDocument()
    expect(container.querySelector('.layout-main')).toBeInTheDocument()

    // Check navigation items are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()

    // Check content is rendered
    expect(screen.getByTestId('page-content')).toBeInTheDocument()
    expect(screen.getByText('Test Page')).toBeInTheDocument()
  })

  it('sidebar navigation state affects layout structure', () => {
    const { container } = renderWithRouter(
      <AdminLayout>
        <TestPageContent />
      </AdminLayout>
    )

    const layoutContainer = container.querySelector('.layout-container')
    const toggleButton = screen.getByLabelText(/collapse sidebar/i)

    // Initially expanded
    expect(layoutContainer).not.toHaveClass('sidebar-collapsed')

    // Navigation should be fully visible
    const sidebar = screen.getByRole('navigation')
    expect(sidebar).toBeVisible()

    // Collapse sidebar
    fireEvent.click(toggleButton)
    expect(layoutContainer).toHaveClass('sidebar-collapsed')
  })

  it('navigation items reflect active state correctly', () => {
    renderWithRouter(
      <AdminLayout>
        <TestPageContent />
      </AdminLayout>
    )

    const navigation = screen.getByRole('navigation')
    const dashboardItem = within(navigation).getByText('Dashboard')
    const tasksItem = within(navigation).getByText('Tasks')

    // Active item should have special styling (verified through aria-current)
    const dashboardNavItem = dashboardItem.closest('a')
    const tasksNavItem = tasksItem.closest('a')

    expect(dashboardNavItem).toHaveAttribute('aria-current', 'page')
    expect(tasksNavItem).not.toHaveAttribute('aria-current')
  })

  it('header integrates with layout and provides user interface', () => {
    const { container } = renderWithRouter(
      <AdminLayout>
        <TestPageContent />
      </AdminLayout>
    )

    const header = container.querySelector('.layout-header')

    // Header should be present and functional
    expect(header).toBeInTheDocument()

    // Header should contain user menu and controls
    expect(screen.getByLabelText('User menu')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument()
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
  })

  it('responsive layout behavior', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { container } = renderWithRouter(
      <AdminLayout>
        <TestPageContent />
      </AdminLayout>
    )

    // Layout should adapt to mobile screen size
    const layoutContainer = container.querySelector('.layout-container')
    expect(layoutContainer).toBeInTheDocument()

    // Sidebar should be collapsible on mobile
    const toggleButton = screen.getByLabelText(/collapse sidebar/i)
    expect(toggleButton).toBeInTheDocument()
  })

  it('layout sections have proper ARIA roles and structure', () => {
    const { container } = renderWithRouter(
      <AdminLayout>
        <TestPageContent />
      </AdminLayout>
    )

    // Check semantic structure
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(container.querySelector('.layout-header')).toBeInTheDocument()
    expect(container.querySelector('.layout-main')).toBeInTheDocument()

    // Main content should contain the page content
    const main = container.querySelector('.layout-main')
    expect(within(main as HTMLElement).getByTestId('page-content')).toBeInTheDocument()
  })

  it('navigation and content render together without layout shifts', () => {
    const { container } = renderWithRouter(
      <AdminLayout>
        <TestPageContent />
      </AdminLayout>
    )

    // All major layout sections should be present simultaneously
    const sidebar = container.querySelector('.layout-sidebar')
    const header = container.querySelector('.layout-header')
    const main = container.querySelector('.layout-main')

    expect(sidebar).toBeInTheDocument()
    expect(header).toBeInTheDocument()
    expect(main).toBeInTheDocument()

    // Content should be immediately visible
    expect(screen.getByTestId('page-content')).toBeInTheDocument()
  })
})