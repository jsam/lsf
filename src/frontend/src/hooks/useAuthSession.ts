/**
 * GREEN-102: Session-based authentication hook
 * Simplified version using Django sessions instead of JWT tokens
 */
import { useState, useCallback, useEffect, useMemo, createContext, useContext } from 'react'
import apiClient from '../api/client'

export interface AuthUser {
  id: number
  username: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export type AuthContextType = AuthState & AuthActions

export function useAuth(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
    error: null
  })

  // GREEN-107: Initialize auth state from session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await apiClient.get<AuthUser>('/auth/me/')
        if (response.data) {
          setState({
            user: response.data,
            loading: false,
            isAuthenticated: true,
            error: null
          })
        } else {
          setState({
            user: null,
            loading: false,
            isAuthenticated: false,
            error: null
          })
        }
      } catch (error) {
        setState({
          user: null,
          loading: false,
          isAuthenticated: false,
          error: null
        })
      }
    }

    checkSession()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiClient.post<AuthUser>('/auth/login/', credentials)

      if (response.data) {
        setState({
          user: response.data,
          loading: false,
          isAuthenticated: true,
          error: null
        })
        return true
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Login failed'
        }))
        return false
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }))
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout/')
    } catch {
      // Logout on server failed, but we'll still logout locally
    }

    setState({
      user: null,
      loading: false,
      isAuthenticated: false,
      error: null
    })
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const authContextValue = useMemo((): AuthContextType => ({
    ...state,
    login,
    logout,
    clearError
  }), [state, login, logout, clearError])

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
