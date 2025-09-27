import React, { useState, useRef, useEffect } from 'react'
import type { UserInfo } from '../layout/MenuTypes'

export interface UserMenuProps {
  user: UserInfo
  menuItems?: Array<{
    label: string
    href?: string
    onClick?: () => void
    divider?: boolean
  }>
}

const defaultMenuItems = [
  { label: 'Profile', href: '/profile' },
  { label: 'Settings', href: '/settings' },
  { divider: true },
  { label: 'Sign out', onClick: () => console.log('Sign out clicked') }
]

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  menuItems = defaultMenuItems
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleItemClick = (item: typeof menuItems[0]) => {
    setIsOpen(false)
    if (item.onClick) {
      item.onClick()
    } else if (item.href) {
      window.location.href = item.href
    }
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu-trigger"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="user-avatar">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            user.initials || user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-neutral-900">
            {user.name}
          </div>
          {user.email && (
            <div className="text-xs text-neutral-500">
              {user.email}
            </div>
          )}
        </div>
        <svg
          className="w-4 h-4 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          {menuItems.map((item, index) => (
            item.divider ? (
              <hr key={index} className="border-neutral-200 my-1" />
            ) : (
              <button
                key={index}
                className="user-menu-item"
                onClick={() => handleItemClick(item)}
              >
                {item.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default UserMenu