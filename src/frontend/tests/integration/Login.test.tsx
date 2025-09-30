/**
 * Login component integration tests
 * Tests for form rendering, submission, and error display
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../../src/pages/Login'

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

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('test_login_form_renders', () => {
    // TEST-101: Render Login component with username/password inputs and submit button
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    // Expected: Form rendered, inputs accept text, button clickable
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('test_login_form_submission', async () => {
    // TEST-102: User types credentials and clicks submit
    const mockLogin = vi.fn().mockResolvedValue(true)
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      login: mockLogin,
      logout: vi.fn(),
      loading: false,
      error: null,
      isAuthenticated: false
    })

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    // Type credentials
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass123' } })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(submitButton)

    // Expected: POST /api/auth/login/ called, session cookie stored by browser
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass123'
      })
    })
  })

  it('test_login_error_display', () => {
    // TEST-103: API returns 401, component displays error message
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
      error: 'Invalid credentials',
      isAuthenticated: false
    })

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    // Expected: Error text "Invalid credentials" visible below form
    expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
  })
})
