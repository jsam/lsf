import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useState } from 'react'
import Form from '../../src/components/ui/Form'
import Input from '../../src/components/ui/Input'
import Select from '../../src/components/ui/Select'
import Button from '../../src/components/ui/Button'
import Card from '../../src/components/ui/Card'
import LoadingSpinner from '../../src/components/ui/LoadingSpinner'
import Modal, { ModalHeader, ModalBody } from '../../src/components/ui/Modal'

// Mock createPortal to render modals in the same container for testing
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom')
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children
  }
})

// Mock API client
vi.mock('../../src/api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

// Comprehensive form component for testing
const UserManagementForm = () => {
  const [users, setUsers] = useState<Array<{ id: number; name: string; email: string; role: string }>>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [lastSubmittedUser, setLastSubmittedUser] = useState<string | null>(null)

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.role) {
      errors.role = 'Role is required'
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setValidationErrors({})

    // Client-side validation
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulate server validation
      if (users.some(user => user.email === formData.email)) {
        throw new Error('Email already exists')
      }

      // Simulate successful submission
      const newUser = {
        id: Date.now(),
        ...formData
      }

      setUsers(prev => [...prev, newUser])
      setLastSubmittedUser(formData.name)
      setShowSuccessModal(true)

      // Reset form
      setFormData({ name: '', email: '', role: 'user' })

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Administrator' },
    { value: 'moderator', label: 'Moderator' }
  ]

  return (
    <div>
      <h1>User Management</h1>

      <Card title="Add New User">
        <Form onSubmit={handleSubmit} loading={isSubmitting}>
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={validationErrors.name}
            required
            data-testid="name-input"
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={validationErrors.email}
            required
            data-testid="email-input"
          />

          <Select
            label="Role"
            value={formData.role}
            onChange={(value) => handleInputChange('role', value as string)}
            options={roleOptions}
            error={validationErrors.role}
            required
          />

          {submitError && (
            <div data-testid="submit-error" className="error-message">
              {submitError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({ name: '', email: '', role: 'user' })
                setValidationErrors({})
                setSubmitError(null)
              }}
              disabled={isSubmitting}
              data-testid="reset-button"
            >
              Reset
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              data-testid="submit-button"
            >
              {isSubmitting ? <LoadingSpinner size="small" /> : 'Add User'}
            </Button>
          </div>
        </Form>
      </Card>

      <Card title="Users List">
        <div data-testid="users-list">
          {users.length === 0 ? (
            <p>No users added yet.</p>
          ) : (
            <ul>
              {users.map(user => (
                <li key={user.id} data-testid={`user-${user.id}`}>
                  {user.name} ({user.email}) - {user.role}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Modal open={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <ModalHeader>
          <h2>Success!</h2>
        </ModalHeader>
        <ModalBody>
          <p data-testid="success-message">
            User "{lastSubmittedUser}" has been added successfully.
          </p>
          <Button
            onClick={() => setShowSuccessModal(false)}
            data-testid="success-close"
          >
            Close
          </Button>
        </ModalBody>
      </Modal>
    </div>
  )
}

describe('Form Submission Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles complete form submission flow with validation', async () => {
    render(<UserManagementForm />)

    // Initially form should be empty
    expect(screen.getByTestId('name-input')).toHaveValue('')
    expect(screen.getByTestId('email-input')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'User' })).toBeInTheDocument()

    // Attempt to submit empty form should show validation errors
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    // Fill out form with valid data
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'john@example.com' }
    })
    // Click role select and choose admin option
    const roleSelect = screen.getByRole('button', { name: 'User' })
    fireEvent.click(roleSelect)
    fireEvent.click(screen.getByText('Administrator'))

    // Validation errors should clear as user types
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument()

    // Submit form
    fireEvent.click(screen.getByTestId('submit-button'))

    // Form should show loading state - wait for isSubmitting to be true
    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    }, { timeout: 100 })

    // Loading spinner should replace text
    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toHaveTextContent('')
    }, { timeout: 200 })

    // Success modal should appear
    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()
      expect(screen.getByTestId('success-message')).toHaveTextContent(
        'User "John Doe" has been added successfully.'
      )
    }, { timeout: 2000 })

    // Close success modal
    fireEvent.click(screen.getByTestId('success-close'))
    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument()
    })

    // User should appear in the list
    expect(screen.getByText('John Doe (john@example.com) - admin')).toBeInTheDocument()

    // Form should be reset
    expect(screen.getByTestId('name-input')).toHaveValue('')
    expect(screen.getByTestId('email-input')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'User' })).toBeInTheDocument()
  })

  it('handles form validation errors and error recovery', async () => {
    render(<UserManagementForm />)

    // Fill out form with invalid data
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'J' } // Too short
    })
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'invalid-email' } // Invalid format
    })

    fireEvent.click(screen.getByTestId('submit-button'))

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })

    // Fix validation errors
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Jane Doe' }
    })
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'jane@example.com' }
    })

    // Validation errors should clear
    await waitFor(() => {
      expect(screen.queryByText('Name must be at least 2 characters')).not.toBeInTheDocument()
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
    })

    // Submit should now work
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('handles server-side validation errors', async () => {
    render(<UserManagementForm />)

    // Add first user
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'First User' }
    })
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()
    }, { timeout: 2000 })

    fireEvent.click(screen.getByTestId('success-close'))

    // Try to add another user with same email
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Second User' }
    })
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' } // Duplicate email
    })
    fireEvent.click(screen.getByTestId('submit-button'))

    // Should show server error
    await waitFor(() => {
      expect(screen.getByTestId('submit-error')).toHaveTextContent('Email already exists')
    }, { timeout: 2000 })

    // Form should not be reset on error
    expect(screen.getByTestId('name-input')).toHaveValue('Second User')
    expect(screen.getByTestId('email-input')).toHaveValue('test@example.com')
  })

  it('handles form reset functionality', async () => {
    render(<UserManagementForm />)

    // Fill out form
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' }
    })
    // Click role select and choose admin option
    const roleSelect = screen.getByRole('button', { name: 'User' })
    fireEvent.click(roleSelect)
    fireEvent.click(screen.getByText('Administrator'))

    // Trigger validation error by changing email to invalid and submitting
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'invalid' }
    })
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })

    // Reset form
    fireEvent.click(screen.getByTestId('reset-button'))

    // All fields should be cleared and errors removed
    await waitFor(() => {
      expect(screen.getByTestId('name-input')).toHaveValue('')
      expect(screen.getByTestId('email-input')).toHaveValue('')
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'User' })).toBeInTheDocument()
  })

  it('maintains form state during loading and prevents double submission', async () => {
    render(<UserManagementForm />)

    // Fill out form
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' }
    })

    // Submit form
    fireEvent.click(screen.getByTestId('submit-button'))

    // During loading, form fields should be intact but submit button disabled
    expect(screen.getByTestId('name-input')).toHaveValue('Test User')
    expect(screen.getByTestId('email-input')).toHaveValue('test@example.com')
    expect(screen.getByTestId('submit-button')).toBeDisabled()
    expect(screen.getByTestId('reset-button')).toBeDisabled()

    // Clicking submit again should have no effect
    fireEvent.click(screen.getByTestId('submit-button'))

    // Should still complete successfully
    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()
    }, { timeout: 2000 })

    // Only one user should be added (no double submission)
    fireEvent.click(screen.getByTestId('success-close'))
    const usersList = screen.getByTestId('users-list')
    expect(usersList.querySelectorAll('li')).toHaveLength(1)
  })

  it('integrates form with modal and maintains focus flow', async () => {
    render(<UserManagementForm />)

    // Fill and submit form
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Focus Test User' }
    })
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'focus@example.com' }
    })

    // Focus the submit button before clicking to establish proper previous focus
    const submitButton = screen.getByTestId('submit-button')
    submitButton.focus()
    fireEvent.click(submitButton)

    // Success modal should open
    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()
    }, { timeout: 2000 })

    // Close modal with ESC key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument()
    })

    // Focus should return to form (submit button)
    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toHaveFocus()
    })
  })
})