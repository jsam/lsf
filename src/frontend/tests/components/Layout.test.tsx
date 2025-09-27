import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AdminLayout from '../../src/components/layout/AdminLayout'

const AdminLayoutWithRouter = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AdminLayout>{children}</AdminLayout>
  </BrowserRouter>
)

describe('AdminLayout', () => {
  test('renders layout structure', () => {
    const { container } = render(
      <AdminLayoutWithRouter>
        <div>Test content</div>
      </AdminLayoutWithRouter>
    )

    // Check for layout structure elements
    expect(container.querySelector('.layout-container')).toBeInTheDocument()
    expect(container.querySelector('.layout-sidebar')).toBeInTheDocument()
    expect(container.querySelector('.layout-main')).toBeInTheDocument()
  })

  test('renders navigation items', () => {
    render(
      <AdminLayoutWithRouter>
        <div>Test content</div>
      </AdminLayoutWithRouter>
    )

    // Check for navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  test('renders children content', () => {
    render(
      <AdminLayoutWithRouter>
        <div>Test content</div>
      </AdminLayoutWithRouter>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })
})