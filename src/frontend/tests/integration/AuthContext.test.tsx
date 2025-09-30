/**
 * AuthContext integration tests
 * Tests for auth state management and session persistence
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import useAuth from '../../src/hooks/useAuth'

// Mock API client
vi.mock('../../src/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('test_session_persistence_on_refresh', async () => {
    // TEST-105: Browser refresh calls /api/auth/me/ to restore state
    const mockApiClient = await import('../../src/api/client')
    mockApiClient.default.get = vi.fn().mockResolvedValue({
      data: { id: 1, username: 'testuser' },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    // Expected: User state restored from session validation
    await waitFor(() => {
      expect(result.current.user).toEqual({
        id: 1,
        username: 'testuser'
      })
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  it('test_auth_context_provides_state', () => {
    // TEST-109: useAuth hook provides correct state structure
    const { result } = renderHook(() => useAuth())

    // Expected: Hook returns {user, login, logout, loading, error}
    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('login')
    expect(result.current).toHaveProperty('logout')
    expect(result.current).toHaveProperty('loading')
    expect(result.current).toHaveProperty('error')
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.logout).toBe('function')
  })
})
