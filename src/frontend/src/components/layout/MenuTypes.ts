export interface NavItemType {
  label: string
  href: string
  icon?: React.ReactNode
  active?: boolean
  badge?: string | number
}

export interface MenuItem {
  id: string
  label: string
  href: string
  icon?: string
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