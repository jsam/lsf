import { useState, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import type { BreadcrumbItem } from '../components/layout/MenuTypes'
import { routeConfig } from './useNavigation'

export interface BreadcrumbsState {
  breadcrumbs: BreadcrumbItem[]
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void
  removeBreadcrumb: (index: number) => void
  resetBreadcrumbs: () => void
  setCustomBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  useRouteBreadcrumbs: () => void
}

function generateRouteBreadcrumbs(currentPath: string): BreadcrumbItem[] {
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

export function useBreadcrumbs(): BreadcrumbsState {
  const location = useLocation()
  const currentPath = location.pathname

  // Generate default breadcrumbs from current route
  const defaultBreadcrumbs = useMemo(() => {
    return generateRouteBreadcrumbs(currentPath)
  }, [currentPath])

  // State for custom breadcrumbs
  const [customBreadcrumbs, setCustomBreadcrumbsState] = useState<BreadcrumbItem[] | null>(null)
  const [useRouteGenerated, setUseRouteGenerated] = useState(true)

  // Current breadcrumbs (either custom or route-generated)
  const breadcrumbs = useMemo(() => {
    if (!useRouteGenerated && customBreadcrumbs) {
      return customBreadcrumbs
    }
    return defaultBreadcrumbs
  }, [customBreadcrumbs, defaultBreadcrumbs, useRouteGenerated])

  // Set custom breadcrumbs
  const setBreadcrumbs = useCallback((newBreadcrumbs: BreadcrumbItem[]) => {
    setCustomBreadcrumbsState(newBreadcrumbs)
    setUseRouteGenerated(false)
  }, [])

  // Set custom breadcrumbs (alias for clarity)
  const setCustomBreadcrumbs = useCallback((newBreadcrumbs: BreadcrumbItem[]) => {
    setBreadcrumbs(newBreadcrumbs)
  }, [setBreadcrumbs])

  // Add a breadcrumb to current list
  const addBreadcrumb = useCallback((breadcrumb: BreadcrumbItem) => {
    const currentBreadcrumbs = useRouteGenerated ? defaultBreadcrumbs : (customBreadcrumbs || [])
    setBreadcrumbs([...currentBreadcrumbs, breadcrumb])
  }, [customBreadcrumbs, defaultBreadcrumbs, setBreadcrumbs, useRouteGenerated])

  // Remove breadcrumb at specific index
  const removeBreadcrumb = useCallback((index: number) => {
    const currentBreadcrumbs = useRouteGenerated ? defaultBreadcrumbs : (customBreadcrumbs || [])
    const newBreadcrumbs = currentBreadcrumbs.filter((_, i) => i !== index)
    setBreadcrumbs(newBreadcrumbs)
  }, [customBreadcrumbs, defaultBreadcrumbs, setBreadcrumbs, useRouteGenerated])

  // Reset to route-generated breadcrumbs
  const resetBreadcrumbs = useCallback(() => {
    setCustomBreadcrumbsState(null)
    setUseRouteGenerated(true)
  }, [])

  // Switch back to using route-generated breadcrumbs
  const useRouteBreadcrumbs = useCallback(() => {
    setUseRouteGenerated(true)
  }, [])

  return {
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    resetBreadcrumbs,
    setCustomBreadcrumbs,
    useRouteBreadcrumbs
  }
}

export default useBreadcrumbs