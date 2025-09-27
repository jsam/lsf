import React from 'react'
import { Link } from 'react-router-dom'

export interface NavItemProps {
  icon?: string
  label: string
  href: string
  active?: boolean
  collapsed?: boolean
  badge?: string | number
  submenu?: boolean
  onClick?: () => void
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  href,
  active = false,
  collapsed = false,
  badge,
  submenu = false,
  onClick
}) => {
  const baseClasses = 'nav-item'
  const activeClass = active ? 'active' : ''
  const collapsedClass = collapsed ? 'collapsed' : ''

  const content = (
    <>
      {icon && (
        <span className="nav-item-icon" role="img" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="nav-item-text">
        {label}
      </span>
      {badge && !collapsed && (
        <span className="ml-auto px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
          {badge}
        </span>
      )}
      {submenu && !collapsed && (
        <span className="ml-auto">
          ▼
        </span>
      )}
    </>
  )

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <Link
      to={href}
      className={`${baseClasses} ${activeClass} ${collapsedClass}`.trim()}
      onClick={handleClick}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? label : undefined}
    >
      {content}
    </Link>
  )
}

export default NavItem