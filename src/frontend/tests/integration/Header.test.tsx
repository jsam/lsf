/**
 * Header component integration tests
 * Tests for logout functionality
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../../src/components/layout/Header'

// Mock useAuth hook
const mockLogout = vi.fn()
vi.mock('../../src/hooks/useAuth', () => ({
  default: () => ({
    user: { id: 1, username: 'testuser' },
    login: vi.fn(),
    logout: mockLogout,
    loading: false,
    error: null,
    isAuthenticated: true
  })
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('Header Logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('test_logout_flow', async () => {
    // TEST-106: User clicks logout button
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    // Open user menu dropdown first
    const userMenuButton = screen.getByRole('button', { name: /user menu/i })
    fireEvent.click(userMenuButton)

    // Find and click sign out button
    const logoutButton = screen.getByText(/sign out/i)
    fireEvent.click(logoutButton)

    // Expected: POST /api/auth/logout/ called, user state null, navigation to /login
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })
})
