import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import type { MenuItem, BreadcrumbItem } from '../components/layout/MenuTypes'

export interface NavigationState {
  currentPath: string
  breadcrumbs: BreadcrumbItem[]
  menuItems: MenuItem[]
  activeItem: MenuItem | null
}

// Default menu items - centralized navigation config
export const defaultMenuItems: MenuItem[] = [
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

// Route configuration for breadcrumb generation
export const routeConfig: Record<string, { title: string; parentPath?: string }> = {
  '/': { title: 'Dashboard' },
  '/tasks': { title: 'Tasks' },
  '/users': { title: 'Users' },
  '/settings': { title: 'Settings' },
  '/profile': { title: 'Profile', parentPath: '/settings' },
  '/settings/general': { title: 'General', parentPath: '/settings' },
  '/settings/security': { title: 'Security', parentPath: '/settings' },
  '/tasks/new': { title: 'Create Task', parentPath: '/tasks' },
  '/tasks/:id': { title: 'Task Details', parentPath: '/tasks' },
  '/users/new': { title: 'Add User', parentPath: '/users' },
  '/users/:id': { title: 'User Details', parentPath: '/users' }
}

function generateBreadcrumbs(currentPath: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = []

  // Handle dynamic routes (replace :id with actual values)
  let matchedPath = currentPath
  const pathSegments = currentPath.split('/').filter(Boolean)

  // Try to match dynamic routes
  for (const [routePath] of Object.entries(routeConfig)) {
    const routeSegments = routePath.split('/').filter(Boolean)

    if (routeSegments.length === pathSegments.length) {
      let isMatch = true
      for (let i = 0; i < routeSegments.length; i++) {
        if (routeSegments[i].startsWith(':')) {
          // Dynamic segment, always matches
          continue
        }
        if (routeSegments[i] !== pathSegments[i]) {
          isMatch = false
          break
        }
      }

      if (isMatch) {
        matchedPath = routePath
        break
      }
    }
  }

  const currentRoute = routeConfig[matchedPath] || routeConfig[currentPath]

  if (!currentRoute) {
    // Fallback: generate breadcrumbs from path segments
    const segments = currentPath.split('/').filter(Boolean)
    segments.forEach((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/')
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: path
      })
    })
    return breadcrumbs
  }

  // Build breadcrumb chain from parent hierarchy
  const buildChain = (path: string): BreadcrumbItem[] => {
    const route = routeConfig[path]
    if (!route) return []

    const chain: BreadcrumbItem[] = []

    // Add parent breadcrumbs recursively
    if (route.parentPath) {
      chain.push(...buildChain(route.parentPath))
    }

    // Add current breadcrumb
    chain.push({
      label: route.title,
      href: path === matchedPath ? undefined : path // Current page has no link
    })

    return chain
  }

  return buildChain(matchedPath)
}

export function useNavigation(customMenuItems?: MenuItem[]): NavigationState {
  const location = useLocation()
  const currentPath = location.pathname

  const navigationState = useMemo((): NavigationState => {
    const menuItems = customMenuItems || defaultMenuItems

    // Find active menu item
    const activeItem = menuItems.find(item => {
      // Exact match
      if (item.href === currentPath) return true

      // Parent route match (e.g., /tasks matches /tasks/*)
      if (currentPath !== '/' && currentPath.startsWith(item.href + '/')) {
        return true
      }

      // Check if current path belongs to this menu item via route config hierarchy
      const currentRoute = routeConfig[currentPath]
      if (currentRoute && currentRoute.parentPath) {
        // Check if this menu item matches the parent or any ancestor
        let parentPath: string | undefined = currentRoute.parentPath
        while (parentPath) {
          if (item.href === parentPath) {
            return true
          }
          const parentRoute: { title: string; parentPath?: string } | undefined = routeConfig[parentPath]
          parentPath = parentRoute?.parentPath
        }
      }

      return false
    }) || null

    // Generate breadcrumbs
    const breadcrumbs = generateBreadcrumbs(currentPath)

    return {
      currentPath,
      breadcrumbs,
      menuItems,
      activeItem
    }
  }, [currentPath, customMenuItems])

  return navigationState
}

export default useNavigation