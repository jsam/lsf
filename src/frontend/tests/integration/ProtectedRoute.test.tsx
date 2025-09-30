/**
 * ProtectedRoute component integration tests
 * Tests for authentication checks and redirects
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../src/components/ProtectedRoute'

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

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('test_redirect_when_unauthenticated', () => {
    // TEST-107: Unauthenticated user navigates to protected route
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      error: null,
      isAuthenticated: false
    })

    render(
      <BrowserRouter>
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
      </BrowserRouter>
    )

    // Expected: User redirected to /login
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('test_render_when_authenticated', () => {
    // TEST-108: Authenticated user navigates to protected route
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, username: 'testuser' },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      error: null,
      isAuthenticated: true
    })

    render(
      <BrowserRouter>
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
      </BrowserRouter>
    )

    // Expected: Dashboard component renders
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
  })
})
