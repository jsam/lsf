import { describe, test, expect, vi, beforeEach } from 'vitest'
import apiClient from '../../src/api/client'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ApiClient', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  test('makes GET request to correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ test: 'data' })
    })

    await apiClient.get('/test')

    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET'
    })
  })

  test('makes POST request with data', async () => {
    // Mock CSRF cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'csrftoken=test-csrf-token'
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    const testData = { key: 'value' }
    await apiClient.post('/test', testData)

    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': 'test-csrf-token'
      },
      method: 'POST',
      body: JSON.stringify(testData)
    })
  })

  test('handles successful response', async () => {
    const responseData = { status: 'ok' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => responseData
    })

    const result = await apiClient.get('/test')

    expect(result).toEqual({
      data: responseData,
      error: undefined,
      status: 200
    })
  })

  test('handles error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' })
    })

    const result = await apiClient.get('/test')

    expect(result).toEqual({
      data: undefined,
      error: 'Not found',
      status: 404
    })
  })

  test('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const result = await apiClient.get('/test')

    expect(result).toEqual({
      error: 'Network error',
      status: 0
    })
  })

  test('health endpoint', async () => {
    const healthData = { status: 'ok', timestamp: '2023-01-01T00:00:00Z' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => healthData
    })

    const result = await apiClient.health()

    expect(mockFetch).toHaveBeenCalledWith('/api/health/', expect.any(Object))
    expect(result.data).toEqual(healthData)
  })
})