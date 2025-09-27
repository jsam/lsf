import React from 'react'
import { useLocation } from 'react-router-dom'
import NavItem from '../navigation/NavItem'
import type { MenuItem, UserInfo } from './MenuTypes'

export interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  menuItems?: MenuItem[]
  userInfo?: UserInfo
}

// Default menu items for admin layout
const defaultMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: '📊'
  },
  {
    id: 'tasks',
    label: 'Tasks',
    href: '/tasks',
    icon: '✓'
  },
  {
    id: 'users',
    label: 'Users',
    href: '/users',
    icon: '👥'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: '⚙️'
  }
]

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  menuItems = defaultMenuItems,
  userInfo
}) => {
  const location = useLocation()

  return (
    <div className="layout-sidebar">
      <div className="flex flex-col h-full">
        {/* Logo/Brand area */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-content-center text-white font-bold">
              {collapsed ? 'L' : 'LSF'}
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg text-primary-900">
                LSF Admin
              </span>
            )}
          </div>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <NavItem
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={location.pathname === item.href}
                  collapsed={collapsed}
                  badge={item.badge}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* User info area */}
        {userInfo && (
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="user-avatar">
                {userInfo.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userInfo.initials || userInfo.name.charAt(0).toUpperCase()
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {userInfo.name}
                  </p>
                  {userInfo.email && (
                    <p className="text-xs text-neutral-500 truncate">
                      {userInfo.email}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toggle button */}
        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar