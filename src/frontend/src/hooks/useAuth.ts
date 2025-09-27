import { useState, useCallback, useEffect, useMemo, createContext, useContext } from 'react'
import type { UserInfo } from '../components/layout/MenuTypes'
import apiClient from '../api/client'

export interface AuthUser extends UserInfo {
  id: string
  role?: string
  permissions?: string[]
  lastLoginAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  refreshToken: () => Promise<boolean>
  clearError: () => void
  updateUser: (user: Partial<AuthUser>) => void
}

export type AuthContextType = AuthState & AuthActions

// Token storage utilities
const TOKEN_STORAGE_KEY = 'lsf_auth_token'
const USER_STORAGE_KEY = 'lsf_auth_user'
const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000 // 14 minutes

class AuthStorage {
  static getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY)
    } catch {
      return null
    }
  }

  static setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    } catch {
      // Handle storage errors silently
    }
  }

  static removeToken(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch {
      // Handle storage errors silently
    }
  }

  static getUser(): AuthUser | null {
    try {
      const userData = localStorage.getItem(USER_STORAGE_KEY)
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  static setUser(user: AuthUser): void {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } catch {
      // Handle storage errors silently
    }
  }

  static removeUser(): void {
    try {
      localStorage.removeItem(USER_STORAGE_KEY)
    } catch {
      // Handle storage errors silently
    }
  }

  static clear(): void {
    this.removeToken()
    this.removeUser()
  }
}

// Extended API client with auth support
class AuthApiClient {
  private token: string | null = null

  setToken(token: string | null): void {
    this.token = token
  }

  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const response = await apiClient.post('/auth/login', credentials)

    if (response.error) {
      throw new Error(response.error)
    }

    const loginData = response.data as any
    if (!loginData?.user || !loginData?.token) {
      throw new Error('Invalid login response')
    }

    return { user: loginData.user as AuthUser, token: loginData.token as string }
  }

  async logout(): Promise<void> {
    if (this.token) {
      try {
        await apiClient.post('/auth/logout')
      } catch {
        // Logout on server failed, but we'll still logout locally
      }
    }
  }

  async refreshToken(currentToken: string): Promise<{ token: string; user: AuthUser | null }> {
    const response = await apiClient.post('/auth/refresh', { token: currentToken })

    if (response.error) {
      throw new Error(response.error)
    }

    const refreshData = response.data as any
    if (!refreshData?.token) {
      throw new Error('Invalid refresh response')
    }

    return { token: refreshData.token as string, user: refreshData.user as AuthUser || null }
  }

  async getCurrentUser(token: string): Promise<AuthUser> {
    // Create a custom request with auth header
    const url = `/api/auth/me`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()
    const apiResponse = {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.error || 'Request failed',
      status: response.status
    }

    if (apiResponse.error) {
      throw new Error(apiResponse.error)
    }

    if (!apiResponse.data) {
      throw new Error('Invalid user response')
    }

    return apiResponse.data as AuthUser
  }
}

const authApiClient = new AuthApiClient()

export function useAuth(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    isAuthenticated: false,
    error: null
  })

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = AuthStorage.getToken()
      const storedUser = AuthStorage.getUser()

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid
          const user = await authApiClient.getCurrentUser(storedToken)
          authApiClient.setToken(storedToken)

          setState({
            user,
            token: storedToken,
            loading: false,
            isAuthenticated: true,
            error: null
          })
        } catch (error) {
          // Token is invalid, clear storage
          AuthStorage.clear()
          setState({
            user: null,
            token: null,
            loading: false,
            isAuthenticated: false,
            error: null
          })
        }
      } else {
        setState(prev => ({
          ...prev,
          loading: false
        }))
      }
    }

    initializeAuth()
  }, [])

  // Auto-refresh token
  useEffect(() => {
    if (!state.token || !state.isAuthenticated) return

    const refreshInterval = setInterval(async () => {
      try {
        const result = await authApiClient.refreshToken(state.token!)
        authApiClient.setToken(result.token)
        AuthStorage.setToken(result.token)

        if (result.user) {
          AuthStorage.setUser(result.user)
          setState(prev => ({
            ...prev,
            token: result.token,
            user: result.user
          }))
        } else {
          setState(prev => ({
            ...prev,
            token: result.token
          }))
        }
      } catch (error) {
        // Refresh failed, logout user
        logout()
      }
    }, TOKEN_REFRESH_INTERVAL)

    return () => clearInterval(refreshInterval)
  }, [state.token, state.isAuthenticated])

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await authApiClient.login(credentials)

      authApiClient.setToken(result.token)
      AuthStorage.setToken(result.token)
      AuthStorage.setUser(result.user)

      setState({
        user: result.user,
        token: result.token,
        loading: false,
        isAuthenticated: true,
        error: null
      })

      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }))
      return false
    }
  }, [])

  const logout = useCallback(() => {
    const currentToken = state.token

    setState({
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      error: null
    })

    authApiClient.setToken(null)
    AuthStorage.clear()

    // Attempt server logout in background
    if (currentToken) {
      authApiClient.logout().catch(() => {
        // Ignore logout errors
      })
    }
  }, [state.token])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!state.token) return false

    try {
      const result = await authApiClient.refreshToken(state.token)
      authApiClient.setToken(result.token)
      AuthStorage.setToken(result.token)

      setState(prev => ({
        ...prev,
        token: result.token,
        user: result.user || prev.user
      }))

      if (result.user) {
        AuthStorage.setUser(result.user)
      }

      return true
    } catch (error) {
      logout()
      return false
    }
  }, [state.token, logout])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const updateUser = useCallback((userUpdate: Partial<AuthUser>) => {
    setState(prev => {
      if (!prev.user) return prev

      const updatedUser = { ...prev.user, ...userUpdate }
      AuthStorage.setUser(updatedUser)

      return {
        ...prev,
        user: updatedUser
      }
    })
  }, [])

  const authContextValue = useMemo((): AuthContextType => ({
    ...state,
    login,
    logout,
    refreshToken,
    clearError,
    updateUser
  }), [state, login, logout, refreshToken, clearError, updateUser])

  return authContextValue
}

// Auth Context for Provider pattern
export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export default useAuth