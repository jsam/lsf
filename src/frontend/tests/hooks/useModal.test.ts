import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useModal } from '../../src/hooks/useModal'

describe('useModal', () => {
  it('initializes with default state (false)', () => {
    const { result } = renderHook(() => useModal())

    expect(result.current.isOpen).toBe(false)
    expect(typeof result.current.open).toBe('function')
    expect(typeof result.current.close).toBe('function')
    expect(typeof result.current.toggle).toBe('function')
  })

  it('initializes with custom initial state', () => {
    const { result } = renderHook(() => useModal(true))
    expect(result.current.isOpen).toBe(true)
  })

  it('opens modal when open is called', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.open()
    })

    expect(result.current.isOpen).toBe(true)
  })

  it('closes modal when close is called', () => {
    const { result } = renderHook(() => useModal(true))

    act(() => {
      result.current.close()
    })

    expect(result.current.isOpen).toBe(false)
  })

  it('toggles modal state when toggle is called', () => {
    const { result } = renderHook(() => useModal())

    // Initially false, toggle to true
    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(true)

    // Toggle back to false
    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('maintains function references (memoization)', () => {
    const { result, rerender } = renderHook(() => useModal())

    const initialOpen = result.current.open
    const initialClose = result.current.close
    const initialToggle = result.current.toggle

    // Trigger a re-render
    rerender()

    // Functions should be the same references
    expect(result.current.open).toBe(initialOpen)
    expect(result.current.close).toBe(initialClose)
    expect(result.current.toggle).toBe(initialToggle)
  })

  it('multiple operations work correctly', () => {
    const { result } = renderHook(() => useModal())

    // Start closed
    expect(result.current.isOpen).toBe(false)

    // Open
    act(() => {
      result.current.open()
    })
    expect(result.current.isOpen).toBe(true)

    // Open again (should stay open)
    act(() => {
      result.current.open()
    })
    expect(result.current.isOpen).toBe(true)

    // Close
    act(() => {
      result.current.close()
    })
    expect(result.current.isOpen).toBe(false)

    // Close again (should stay closed)
    act(() => {
      result.current.close()
    })
    expect(result.current.isOpen).toBe(false)

    // Toggle to open
    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(true)

    // Toggle to close
    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('works with different initial states', () => {
    // Test with false initial state
    const { result: result1 } = renderHook(() => useModal(false))
    expect(result1.current.isOpen).toBe(false)

    // Test with true initial state
    const { result: result2 } = renderHook(() => useModal(true))
    expect(result2.current.isOpen).toBe(true)

    // Test with undefined (should default to false)
    const { result: result3 } = renderHook(() => useModal(undefined))
    expect(result3.current.isOpen).toBe(false)
  })
})