/**
 * App component integration tests
 * Tests for routing and layout integration
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../../src/App'

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  default: () => ({
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
    error: null,
    isAuthenticated: false
  })
}))

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('test_login_route_no_layout', () => {
    // TEST-110: /login route renders without AdminLayout
    window.history.pushState({}, '', '/login')

    render(<App />)

    // Expected: Login page visible, no sidebar/header from AdminLayout
    expect(screen.queryByText(/username/i)).toBeInTheDocument()
    expect(screen.queryByTestId('admin-sidebar')).not.toBeInTheDocument()
  })

  it('test_protected_route_with_layout', () => {
    // TEST-111: Authenticated routes render with AdminLayout
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, username: 'testuser' },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      error: null,
      isAuthenticated: true
    })

    window.history.pushState({}, '', '/dashboard')

    render(<App />)

    // Expected: Dashboard content visible inside AdminLayout
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('admin-header')).toBeInTheDocument()
  })
})
