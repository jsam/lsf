import { render, screen } from '@testing-library/react'
import Dashboard from '../../src/pages/Dashboard'

describe('Dashboard', () => {
  test('renders dashboard title', () => {
    render(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  test('renders dashboard description', () => {
    render(<Dashboard />)
    expect(screen.getByText('System overview and health status')).toBeInTheDocument()
  })
})