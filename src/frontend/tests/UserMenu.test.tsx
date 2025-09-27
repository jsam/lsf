import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UserMenu from '../src/components/navigation/UserMenu'
import type { UserInfo } from '../src/components/layout/MenuTypes'

// Mock window.location.href to avoid jsdom navigation errors
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'http://localhost:3000',
    assign: vi.fn(),
    replace: vi.fn(),
  }
})

describe('UserMenu', () => {
  const sampleUser: UserInfo = {
    name: 'John Doe',
    email: 'john@example.com',
    initials: 'JD'
  }

  it('renders user information', () => {
    render(<UserMenu user={sampleUser} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('shows initials when no avatar provided', () => {
    const userWithoutAvatar = { ...sampleUser, initials: undefined }
    render(<UserMenu user={userWithoutAvatar} />)

    expect(screen.getByText('J')).toBeInTheDocument() // First letter of name
  })

  it('shows avatar image when provided', () => {
    const userWithAvatar = { ...sampleUser, avatar: '/avatar.jpg' }
    render(<UserMenu user={userWithAvatar} />)

    const avatar = screen.getByAltText('John Doe')
    expect(avatar).toHaveAttribute('src', '/avatar.jpg')
  })

  it('opens dropdown when clicked', () => {
    render(<UserMenu user={sampleUser} />)

    const trigger = screen.getByLabelText('User menu')
    fireEvent.click(trigger)

    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', () => {
    render(
      <div>
        <UserMenu user={sampleUser} />
        <div data-testid="outside">Outside</div>
      </div>
    )

    const trigger = screen.getByLabelText('User menu')
    fireEvent.click(trigger)

    // Menu should be open
    expect(screen.getByText('Profile')).toBeInTheDocument()

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside'))

    // Menu should be closed
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })

  it('closes dropdown on escape key', () => {
    render(<UserMenu user={sampleUser} />)

    const trigger = screen.getByLabelText('User menu')
    fireEvent.click(trigger)

    // Menu should be open
    expect(screen.getByText('Profile')).toBeInTheDocument()

    // Press escape
    fireEvent.keyDown(document, { key: 'Escape' })

    // Menu should be closed
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })

  it('calls onClick for menu items with onClick handler', () => {
    const mockSignOut = vi.fn()
    const customMenuItems = [
      { label: 'Custom Action', onClick: mockSignOut }
    ]

    render(<UserMenu user={sampleUser} menuItems={customMenuItems} />)

    const trigger = screen.getByLabelText('User menu')
    fireEvent.click(trigger)

    const customItem = screen.getByText('Custom Action')
    fireEvent.click(customItem)

    expect(mockSignOut).toHaveBeenCalledOnce()
  })

  it('renders custom menu items', () => {
    const customMenuItems = [
      { label: 'Custom Item 1', href: '/custom1' },
      { divider: true },
      { label: 'Custom Item 2', onClick: vi.fn() }
    ]

    render(<UserMenu user={sampleUser} menuItems={customMenuItems} />)

    const trigger = screen.getByLabelText('User menu')
    fireEvent.click(trigger)

    expect(screen.getByText('Custom Item 1')).toBeInTheDocument()
    expect(screen.getByText('Custom Item 2')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<UserMenu user={sampleUser} />)

    const trigger = screen.getByLabelText('User menu')
    expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes menu when item is clicked', () => {
    render(<UserMenu user={sampleUser} />)

    const trigger = screen.getByLabelText('User menu')
    fireEvent.click(trigger)

    // Menu should be open
    expect(screen.getByText('Profile')).toBeInTheDocument()

    // Click menu item
    fireEvent.click(screen.getByText('Profile'))

    // Menu should be closed
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })
})