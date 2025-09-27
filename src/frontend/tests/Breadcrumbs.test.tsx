import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Breadcrumbs from '../src/components/navigation/Breadcrumbs'
import type { BreadcrumbItem } from '../src/components/layout/MenuTypes'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Breadcrumbs', () => {
  const sampleItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Users', href: '/users' },
    { label: 'Profile' } // No href for last item
  ]

  it('renders all breadcrumb items', () => {
    renderWithRouter(<Breadcrumbs items={sampleItems} />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('renders links for items with href except the last one', () => {
    renderWithRouter(<Breadcrumbs items={sampleItems} />)

    const homeLink = screen.getByRole('link', { name: /go to home/i })
    expect(homeLink).toHaveAttribute('href', '/')

    const usersLink = screen.getByRole('link', { name: /go to users/i })
    expect(usersLink).toHaveAttribute('href', '/users')

    // Last item should not be a link
    expect(screen.queryByRole('link', { name: /go to profile/i })).not.toBeInTheDocument()
  })

  it('marks the last item as current page', () => {
    renderWithRouter(<Breadcrumbs items={sampleItems} />)

    const lastItem = screen.getByText('Profile')
    expect(lastItem).toHaveAttribute('aria-current', 'page')
  })

  it('renders default separator', () => {
    renderWithRouter(<Breadcrumbs items={sampleItems} />)

    const separators = screen.getAllByText('/')
    expect(separators).toHaveLength(2) // Between 3 items
  })

  it('renders custom separator', () => {
    renderWithRouter(<Breadcrumbs items={sampleItems} separator=">" />)

    const separators = screen.getAllByText('>')
    expect(separators).toHaveLength(2)
  })

  it('handles single item', () => {
    const singleItem: BreadcrumbItem[] = [{ label: 'Dashboard' }]
    renderWithRouter(<Breadcrumbs items={singleItem} />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('/')).not.toBeInTheDocument()
  })

  it('truncates items when exceeding maxItems', () => {
    const manyItems: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Level1', href: '/level1' },
      { label: 'Level2', href: '/level2' },
      { label: 'Level3', href: '/level3' },
      { label: 'Level4', href: '/level4' },
      { label: 'Current' }
    ]

    renderWithRouter(<Breadcrumbs items={manyItems} maxItems={4} />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('...')).toBeInTheDocument()
    expect(screen.getByText('Level4')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()

    // Middle items should be hidden
    expect(screen.queryByText('Level1')).not.toBeInTheDocument()
    expect(screen.queryByText('Level2')).not.toBeInTheDocument()
    expect(screen.queryByText('Level3')).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderWithRouter(<Breadcrumbs items={sampleItems} />)

    const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(nav).toBeInTheDocument()

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
  })
})