import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import { useNavigation, defaultMenuItems, routeConfig } from '../../src/hooks/useNavigation'

// Mock useLocation hook
const mockUseLocation = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => mockUseLocation()
  }
})

// Wrapper component for React Router context
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement(BrowserRouter, {}, children)
}

describe('useNavigation', () => {
  beforeEach(() => {
    mockUseLocation.mockClear()
  })

  it('returns navigation state for root path', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' })

    const { result } = renderHook(() => useNavigation(), {
      wrapper: RouterWrapper
    })

    expect(result.current.currentPath).toBe('/')
    expect(result.current.menuItems).toEqual(defaultMenuItems)
    expect(result.current.activeItem).toEqual(defaultMenuItems[0]) // Dashboard
    expect(result.current.breadcrumbs).toEqual([
      { label: 'Dashboard', href: undefined }
    ])
  })

  it('returns navigation state for tasks path', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks' })

    const { result } = renderHook(() => useNavigation(), {
      wrapper: RouterWrapper
    })

    expect(result.current.currentPath).toBe('/tasks')
    expect(result.current.activeItem).toEqual(defaultMenuItems[1]) // Tasks
    expect(result.current.breadcrumbs).toEqual([
      { label: 'Tasks', href: undefined }
    ])
  })

  it('handles nested paths correctly', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks/123' })

    const { result } = renderHook(() => useNavigation(), {
      wrapper: RouterWrapper
    })

    expect(result.current.currentPath).toBe('/tasks/123')
    expect(result.current.activeItem).toEqual(defaultMenuItems[1]) // Tasks (parent)
    expect(result.current.breadcrumbs).toEqual([
      { label: 'Tasks', href: '/tasks' },
      { label: 'Task Details', href: undefined }
    ])
  })

  it('handles settings subpaths correctly', () => {
    mockUseLocation.mockReturnValue({ pathname: '/settings/general' })

    const { result } = renderHook(() => useNavigation(), {
      wrapper: RouterWrapper
    })

    expect(result.current.currentPath).toBe('/settings/general')
    expect(result.current.activeItem).toEqual(defaultMenuItems[3]) // Settings
    expect(result.current.breadcrumbs).toEqual([
      { label: 'Settings', href: '/settings' },
      { label: 'General', href: undefined }
    ])
  })

  it('handles unknown paths gracefully', () => {
    mockUseLocation.mockReturnValue({ pathname: '/unknown/path' })

    const { result } = renderHook(() => useNavigation(), {
      wrapper: RouterWrapper
    })

    expect(result.current.currentPath).toBe('/unknown/path')
    expect(result.current.activeItem).toBeNull()
    expect(result.current.breadcrumbs).toEqual([
      { label: 'Unknown', href: '/unknown' },
      { label: 'Path', href: '/unknown/path' }
    ])
  })

  it('accepts custom menu items', () => {
    const customMenuItems = [
      { id: 'custom1', label: 'Custom 1', href: '/custom1', icon: '🔧' },
      { id: 'custom2', label: 'Custom 2', href: '/custom2', icon: '📝' }
    ]

    mockUseLocation.mockReturnValue({ pathname: '/custom1' })

    const { result } = renderHook(() => useNavigation(customMenuItems), {
      wrapper: RouterWrapper
    })

    expect(result.current.menuItems).toEqual(customMenuItems)
    expect(result.current.activeItem).toEqual(customMenuItems[0])
  })

  it('handles dynamic route parameters', () => {
    mockUseLocation.mockReturnValue({ pathname: '/users/456' })

    const { result } = renderHook(() => useNavigation(), {
      wrapper: RouterWrapper
    })

    expect(result.current.currentPath).toBe('/users/456')
    expect(result.current.activeItem).toEqual(defaultMenuItems[2]) // Users
    expect(result.current.breadcrumbs).toEqual([
      { label: 'Users', href: '/users' },
      { label: 'User Details', href: undefined }
    ])
  })

  it('handles profile path correctly', () => {
    mockUseLocation.mockReturnValue({ pathname: '/profile' })

    const { result } = renderHook(() => useNavigation(), {
      wrapper: RouterWrapper
    })

    expect(result.current.currentPath).toBe('/profile')
    expect(result.current.activeItem).toEqual(defaultMenuItems[3]) // Settings (parent)
    expect(result.current.breadcrumbs).toEqual([
      { label: 'Settings', href: '/settings' },
      { label: 'Profile', href: undefined }
    ])
  })

  it('updates when location changes', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' })

    const { result, rerender } = renderHook(() => useNavigation(), {
      wrapper: RouterWrapper
    })

    expect(result.current.currentPath).toBe('/')
    expect(result.current.activeItem?.id).toBe('dashboard')

    // Change location
    mockUseLocation.mockReturnValue({ pathname: '/tasks' })
    rerender()

    expect(result.current.currentPath).toBe('/tasks')
    expect(result.current.activeItem?.id).toBe('tasks')
  })

  it('maintains referential stability when location unchanged', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks' })

    const { result, rerender } = renderHook(() => useNavigation(), {
      wrapper: RouterWrapper
    })

    const firstResult = result.current
    rerender()
    const secondResult = result.current

    expect(firstResult).toBe(secondResult)
  })

  it('handles root path edge case', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' })

    const { result } = renderHook(() => useNavigation(), {
      wrapper: RouterWrapper
    })

    expect(result.current.breadcrumbs).toEqual([
      { label: 'Dashboard', href: undefined }
    ])
  })

  it('correctly identifies parent routes for active menu items', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks/new' })

    const { result } = renderHook(() => useNavigation(), {
      wrapper: RouterWrapper
    })

    // Should match tasks menu item as parent
    expect(result.current.activeItem?.id).toBe('tasks')
    expect(result.current.activeItem?.href).toBe('/tasks')
  })

  it('handles multiple level nested paths', () => {
    mockUseLocation.mockReturnValue({ pathname: '/settings/security/two-factor' })

    const { result } = renderHook(() => useNavigation(), {
      wrapper: RouterWrapper
    })

    expect(result.current.currentPath).toBe('/settings/security/two-factor')
    expect(result.current.activeItem?.id).toBe('settings')
    // Fallback breadcrumb generation for unregistered deep paths
    expect(result.current.breadcrumbs).toEqual([
      { label: 'Settings', href: '/settings' },
      { label: 'Security', href: '/settings/security' },
      { label: 'Two-factor', href: '/settings/security/two-factor' }
    ])
  })
})