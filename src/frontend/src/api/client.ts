const API_BASE_URL = '/api'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

// GREEN-101: CSRF token utility
function getCsrfToken(): string {
  const name = 'csrftoken'
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    const trimmed = cookie.trim()
    if (trimmed.startsWith(name + '=')) {
      return trimmed.substring(name.length + 1)
    }
  }
  return ''
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    // GREEN-101: Add CSRF token to headers for POST/PUT/DELETE
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
      const csrfToken = getCsrfToken()
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken
      }
    }

    try {
      const response = await fetch(url, {
        headers,
        credentials: 'include',  // GREEN-101: Include credentials for session cookies
        ...options,
      })

      const data = await response.json()

      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error || 'Request failed',
        status: response.status,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async health(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/health/')
  }
}

export const apiClient = new ApiClient()
export default apiClient