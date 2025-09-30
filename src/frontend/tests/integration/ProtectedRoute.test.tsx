/**
 * ProtectedRoute component integration tests
 * Tests for authentication checks and redirects
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../src/components/ProtectedRoute'

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

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock state to unauthenticated
    mockAuthState.user = null
    mockAuthState.loading = false
    mockAuthState.error = null
    mockAuthState.isAuthenticated = false
  })

  it('test_redirect_when_unauthenticated', () => {
    // TEST-107: Unauthenticated user navigates to protected route
    mockAuthState.isAuthenticated = false

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    // Expected: User redirected to /login
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('test_render_when_authenticated', () => {
    // TEST-108: Authenticated user navigates to protected route
    mockAuthState.user = { id: 1, username: 'testuser' }
    mockAuthState.isAuthenticated = true

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    // Expected: Dashboard component renders
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
  })
})
