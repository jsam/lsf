// Type definitions for menu system
export interface MenuItem {
  id: string
  label: string
  href: string
  icon?: string
  submenu?: MenuItem[]
  badge?: string | number
}

export interface UserInfo {
  name: string
  email?: string
  avatar?: string
  initials?: string
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface MenuContextType {
  activeItem: string
  setActiveItem: (id: string) => void
  expandedItems: string[]
  toggleExpanded: (id: string) => void
}