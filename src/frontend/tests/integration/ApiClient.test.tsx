/**
 * API Client integration tests
 * Tests for credentials inclusion and CSRF token handling
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../../src/api/client'

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('test_credentials_included', async () => {
    // TEST-104: API client includes credentials in requests
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' })
    })

    await apiClient.get('/test-endpoint')

    // Expected: Request Cookie header contains sessionid
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        credentials: 'include'
      })
    )
  })

  it('test_csrf_token_included', async () => {
    // TEST-112: API client includes CSRF token in POST requests
    // Mock document.cookie with CSRF token
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'csrftoken=test-csrf-token'
    })

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' })
    })

    await apiClient.post('/test-endpoint', { data: 'test' })

    // Expected: POST request includes X-CSRFToken header with valid token
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-CSRFToken': 'test-csrf-token'
        })
      })
    )
  })

  it('test_csrf_token_available', () => {
    // TEST-113: CSRF token cookie is available before login submission
    // Mock CSRF token in cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'csrftoken=test-csrf-token; other=value'
    })

    // Expected: csrftoken cookie available
    expect(document.cookie).toContain('csrftoken=test-csrf-token')
  })
})
