import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import { useBreadcrumbs } from '../../src/hooks/useBreadcrumbs'
import type { BreadcrumbItem } from '../../src/components/layout/MenuTypes'

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

describe('useBreadcrumbs', () => {
  beforeEach(() => {
    mockUseLocation.mockClear()
  })

  it('generates route-based breadcrumbs for root path', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' })

    const { result } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    expect(result.current.breadcrumbs).toEqual([
      { label: 'Dashboard', href: undefined }
    ])
  })

  it('generates route-based breadcrumbs for nested path', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks/123' })

    const { result } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    expect(result.current.breadcrumbs).toEqual([
      { label: 'Tasks', href: '/tasks' },
      { label: 'Task Details', href: undefined }
    ])
  })

  it('allows setting custom breadcrumbs', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks' })

    const { result } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    const customBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Custom Home', href: '/' },
      { label: 'Custom Section', href: '/custom' },
      { label: 'Current Page', href: undefined }
    ]

    act(() => {
      result.current.setBreadcrumbs(customBreadcrumbs)
    })

    expect(result.current.breadcrumbs).toEqual(customBreadcrumbs)
  })

  it('allows adding breadcrumbs to current list', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks' })

    const { result } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    const newBreadcrumb: BreadcrumbItem = {
      label: 'Added Item',
      href: '/added'
    }

    act(() => {
      result.current.addBreadcrumb(newBreadcrumb)
    })

    expect(result.current.breadcrumbs).toEqual([
      { label: 'Tasks', href: undefined },
      { label: 'Added Item', href: '/added' }
    ])
  })

  it('allows removing breadcrumbs by index', () => {
    mockUseLocation.mockReturnValue({ pathname: '/settings/general' })

    const { result } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    // Initial breadcrumbs: Settings -> General
    expect(result.current.breadcrumbs).toHaveLength(2)

    act(() => {
      result.current.removeBreadcrumb(0) // Remove first breadcrumb
    })

    expect(result.current.breadcrumbs).toEqual([
      { label: 'General', href: undefined }
    ])
  })

  it('allows resetting to route-generated breadcrumbs', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks' })

    const { result } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    const customBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Custom', href: '/custom' }
    ]

    // Set custom breadcrumbs
    act(() => {
      result.current.setBreadcrumbs(customBreadcrumbs)
    })

    expect(result.current.breadcrumbs).toEqual(customBreadcrumbs)

    // Reset to route-generated
    act(() => {
      result.current.resetBreadcrumbs()
    })

    expect(result.current.breadcrumbs).toEqual([
      { label: 'Tasks', href: undefined }
    ])
  })

  it('allows switching back to route breadcrumbs without resetting custom state', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks' })

    const { result } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    const customBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Custom', href: '/custom' }
    ]

    // Set custom breadcrumbs
    act(() => {
      result.current.setCustomBreadcrumbs(customBreadcrumbs)
    })

    expect(result.current.breadcrumbs).toEqual(customBreadcrumbs)

    // Switch to route breadcrumbs
    act(() => {
      result.current.useRouteBreadcrumbs()
    })

    expect(result.current.breadcrumbs).toEqual([
      { label: 'Tasks', href: undefined }
    ])
  })

  it('updates route breadcrumbs when location changes', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks' })

    const { result, rerender } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    expect(result.current.breadcrumbs).toEqual([
      { label: 'Tasks', href: undefined }
    ])

    // Change location
    mockUseLocation.mockReturnValue({ pathname: '/users' })
    rerender()

    expect(result.current.breadcrumbs).toEqual([
      { label: 'Users', href: undefined }
    ])
  })

  it('maintains custom breadcrumbs when location changes', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks' })

    const { result, rerender } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    const customBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Custom', href: '/custom' }
    ]

    act(() => {
      result.current.setBreadcrumbs(customBreadcrumbs)
    })

    expect(result.current.breadcrumbs).toEqual(customBreadcrumbs)

    // Change location
    mockUseLocation.mockReturnValue({ pathname: '/users' })
    rerender()

    // Custom breadcrumbs should be maintained
    expect(result.current.breadcrumbs).toEqual(customBreadcrumbs)
  })

  it('handles adding breadcrumbs to custom list', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks' })

    const { result } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    const customBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Custom Home', href: '/' }
    ]

    // Set custom breadcrumbs first
    act(() => {
      result.current.setBreadcrumbs(customBreadcrumbs)
    })

    // Add to custom list
    act(() => {
      result.current.addBreadcrumb({ label: 'Added', href: '/added' })
    })

    expect(result.current.breadcrumbs).toEqual([
      { label: 'Custom Home', href: '/' },
      { label: 'Added', href: '/added' }
    ])
  })

  it('handles removing breadcrumbs from custom list', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks' })

    const { result } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    const customBreadcrumbs: BreadcrumbItem[] = [
      { label: 'First', href: '/first' },
      { label: 'Second', href: '/second' },
      { label: 'Third', href: '/third' }
    ]

    // Set custom breadcrumbs
    act(() => {
      result.current.setBreadcrumbs(customBreadcrumbs)
    })

    // Remove middle item
    act(() => {
      result.current.removeBreadcrumb(1)
    })

    expect(result.current.breadcrumbs).toEqual([
      { label: 'First', href: '/first' },
      { label: 'Third', href: '/third' }
    ])
  })

  it('handles unknown paths gracefully', () => {
    mockUseLocation.mockReturnValue({ pathname: '/unknown/deeply/nested/path' })

    const { result } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    expect(result.current.breadcrumbs).toEqual([
      { label: 'Unknown', href: '/unknown' },
      { label: 'Deeply', href: '/unknown/deeply' },
      { label: 'Nested', href: '/unknown/deeply/nested' },
      { label: 'Path', href: '/unknown/deeply/nested/path' }
    ])
  })

  it('provides correct function references (memoization)', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks' })

    const { result, rerender } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    const initialFunctions = {
      setBreadcrumbs: result.current.setBreadcrumbs,
      addBreadcrumb: result.current.addBreadcrumb,
      removeBreadcrumb: result.current.removeBreadcrumb,
      resetBreadcrumbs: result.current.resetBreadcrumbs,
      setCustomBreadcrumbs: result.current.setCustomBreadcrumbs,
      useRouteBreadcrumbs: result.current.useRouteBreadcrumbs
    }

    // Trigger re-render
    rerender()

    expect(result.current.setBreadcrumbs).toBe(initialFunctions.setBreadcrumbs)
    expect(result.current.addBreadcrumb).toBe(initialFunctions.addBreadcrumb)
    expect(result.current.removeBreadcrumb).toBe(initialFunctions.removeBreadcrumb)
    expect(result.current.resetBreadcrumbs).toBe(initialFunctions.resetBreadcrumbs)
    expect(result.current.setCustomBreadcrumbs).toBe(initialFunctions.setCustomBreadcrumbs)
    expect(result.current.useRouteBreadcrumbs).toBe(initialFunctions.useRouteBreadcrumbs)
  })

  it('handles empty custom breadcrumbs correctly', () => {
    mockUseLocation.mockReturnValue({ pathname: '/tasks' })

    const { result } = renderHook(() => useBreadcrumbs(), {
      wrapper: RouterWrapper
    })

    act(() => {
      result.current.setBreadcrumbs([])
    })

    expect(result.current.breadcrumbs).toEqual([])

    // Adding to empty custom list should work
    act(() => {
      result.current.addBreadcrumb({ label: 'First', href: '/first' })
    })

    expect(result.current.breadcrumbs).toEqual([
      { label: 'First', href: '/first' }
    ])
  })
})