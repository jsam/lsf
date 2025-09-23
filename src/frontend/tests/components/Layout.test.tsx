import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '../../src/components/Layout'

const LayoutWithRouter = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <Layout>{children}</Layout>
  </BrowserRouter>
)

describe('Layout', () => {
  test('renders navigation with title', () => {
    render(
      <LayoutWithRouter>
        <div>Test content</div>
      </LayoutWithRouter>
    )

    expect(screen.getByText('Django Celery App')).toBeInTheDocument()
  })

  test('renders navigation links', () => {
    render(
      <LayoutWithRouter>
        <div>Test content</div>
      </LayoutWithRouter>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  test('renders children content', () => {
    render(
      <LayoutWithRouter>
        <div>Test content</div>
      </LayoutWithRouter>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })
})