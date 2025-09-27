import React from 'react'
import { Link } from 'react-router-dom'
import type { BreadcrumbItem } from '../layout/MenuTypes'

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  separator?: string
  maxItems?: number
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = '/',
  maxItems = 4
}) => {
  // Show ellipsis if there are too many items
  const displayItems = items.length > maxItems
    ? [
        items[0], // Always show first item
        { label: '...', href: undefined }, // Ellipsis
        ...items.slice(-(maxItems - 2)) // Show last few items
      ]
    : items

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1
          const isEllipsis = item.label === '...'

          return (
            <li key={`${item.label}-${index}`} className="breadcrumb-item">
              {isEllipsis ? (
                <span className="text-neutral-500">...</span>
              ) : item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="breadcrumb-link"
                  aria-label={`Go to ${item.label}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-neutral-900 font-medium"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span className="breadcrumb-separator" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs