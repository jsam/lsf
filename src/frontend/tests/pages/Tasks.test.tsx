import { render, screen } from '@testing-library/react'
import Tasks from '../../src/pages/Tasks'

describe('Tasks', () => {
  test('renders tasks title', () => {
    render(<Tasks />)
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  test('renders tasks description', () => {
    render(<Tasks />)
    expect(screen.getByText('Celery task monitoring and management')).toBeInTheDocument()
  })
})