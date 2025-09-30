/**
 * App component integration tests
 * Tests for routing and layout integration
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/App'
import useAuth from '../../src/hooks/useAuth'

// Mock the module
vi.mock('../../src/hooks/useAuth', () => {
  const { createContext } = require('react')
  const ctx = createContext(null)

  return {
    default: vi.fn(),
    AuthContext: ctx
  }
})

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('test_login_route_no_layout', () => {
    // TEST-110: /login route renders without AdminLayout
    // Set unauthenticated state for this test
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      error: null,
      isAuthenticated: false,
      clearError: vi.fn()
    })

    window.history.pushState({}, '', '/login')

    render(<App />)

    // Expected: Login page visible, no sidebar/header from AdminLayout
    expect(screen.queryByText(/username/i)).toBeInTheDocument()
    expect(screen.queryByTestId('admin-sidebar')).not.toBeInTheDocument()
  })

})
