import React from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs from '../navigation/Breadcrumbs'
import UserMenu from '../navigation/UserMenu'
import useAuth from '../../hooks/useAuth'
import type { BreadcrumbItem, UserInfo } from './MenuTypes'

export interface HeaderProps {
  title?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  userInfo?: UserInfo
  onSidebarToggle?: () => void
  sidebarCollapsed?: boolean
}

const Header: React.FC<HeaderProps> = ({
  title,
  breadcrumbs,
  actions,
  userInfo,
  onSidebarToggle,
  sidebarCollapsed
}) => {
  const { logout, user: authUser } = useAuth()
  const navigate = useNavigate()

  const defaultUser: UserInfo = {
    name: 'Admin User',
    email: 'admin@lsf.dev',
    initials: 'AU'
  }

  // Use authenticated user info if available
  const user = userInfo || (authUser ? {
    name: authUser.username,
    email: authUser.username,
    initials: authUser.username.substring(0, 2).toUpperCase()
  } : defaultUser)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menuItems = [
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/settings' },
    { divider: true },
    { label: 'Sign out', onClick: handleLogout }
  ]

  return (
    <div className={`layout-header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="flex items-center justify-between w-full">
        {/* Left side - Breadcrumbs or title */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={onSidebarToggle}
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            ☰
          </button>

          {breadcrumbs ? (
            <Breadcrumbs items={breadcrumbs} />
          ) : (
            title && (
              <h1 className="text-xl font-semibold text-neutral-900">
                {title}
              </h1>
            )
          )}
        </div>

        {/* Center - Actions */}
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}

        {/* Right side - User menu */}
        <div className="flex items-center gap-4">
          {/* Notifications placeholder */}
          <button
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors relative"
            aria-label="Notifications"
          >
            🔔
            <span className="sr-only">Notifications</span>
          </button>

          {/* User menu */}
          <UserMenu user={user} menuItems={menuItems} />
        </div>
      </div>
    </div>
  )
}

export default Header