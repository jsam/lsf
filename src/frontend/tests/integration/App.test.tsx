/**
 * App component integration tests
 * Tests for routing and layout integration
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/App'

// Create mockable auth state
const mockAuthState = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
  error: null,
  isAuthenticated: false,
  clearError: vi.fn()
}

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  default: () => mockAuthState
}))

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock state
    mockAuthState.user = null
    mockAuthState.loading = false
    mockAuthState.error = null
    mockAuthState.isAuthenticated = false
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
    mockAuthState.user = { id: 1, username: 'testuser' }
    mockAuthState.isAuthenticated = true

    window.history.pushState({}, '', '/dashboard')

    render(<App />)

    // Expected: Dashboard content visible inside AdminLayout
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('admin-header')).toBeInTheDocument()
  })
})
