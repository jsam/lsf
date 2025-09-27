import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useState } from 'react'
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../../src/components/ui/Modal'
import Button from '../../src/components/ui/Button'
import Form from '../../src/components/ui/Form'
import Input from '../../src/components/ui/Input'
import { useModal } from '../../src/hooks/useModal'

// Mock createPortal to render modals in the same container for testing
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom')
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children
  }
})

// Test component that uses modal functionality
const ModalTestComponent = () => {
  const confirmModal = useModal()
  const formModal = useModal()
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [submitCount, setSubmitCount] = useState(0)

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitCount(prev => prev + 1)
    formModal.close()
  }

  return (
    <div>
      <h1>Modal Integration Test</h1>

      <Button
        onClick={confirmModal.open}
        data-testid="open-confirm-modal"
      >
        Open Confirmation Modal
      </Button>

      <Button
        onClick={formModal.open}
        data-testid="open-form-modal"
      >
        Open Form Modal
      </Button>

      <div data-testid="submit-count">Submit count: {submitCount}</div>

      {/* Confirmation Modal */}
      <Modal open={confirmModal.isOpen} onClose={confirmModal.close}>
        <ModalHeader>
          <h2>Confirm Action</h2>
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to proceed?</p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={confirmModal.close}
            data-testid="confirm-cancel"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setSubmitCount(prev => prev + 1)
              confirmModal.close()
            }}
            data-testid="confirm-proceed"
          >
            Proceed
          </Button>
        </ModalFooter>
      </Modal>

      {/* Form Modal */}
      <Modal open={formModal.isOpen} onClose={formModal.close} size="medium">
        <ModalHeader>
          <h2>User Information</h2>
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={handleFormSubmit}>
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              data-testid="form-name-input"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              data-testid="form-email-input"
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outline"
                onClick={formModal.close}
                data-testid="form-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                data-testid="form-submit"
              >
                Save
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
    </div>
  )
}

describe('Modal Integration Tests', () => {
  beforeEach(() => {
    document.body.style.overflow = ''
  })

  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('opens and closes modals triggered from different components', async () => {
    render(<ModalTestComponent />)

    // Initially no modals should be visible
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
    expect(screen.queryByText('User Information')).not.toBeInTheDocument()

    // Open confirmation modal
    fireEvent.click(screen.getByTestId('open-confirm-modal'))
    await waitFor(() => {
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })

    // Close confirmation modal and open form modal
    fireEvent.click(screen.getByTestId('confirm-cancel'))
    await waitFor(() => {
      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('open-form-modal'))
    await waitFor(() => {
      expect(screen.getByText('User Information')).toBeInTheDocument()
    })
  })

  it('handles form submission flows within modals', async () => {
    render(<ModalTestComponent />)

    // Open form modal
    fireEvent.click(screen.getByTestId('open-form-modal'))
    await waitFor(() => {
      expect(screen.getByText('User Information')).toBeInTheDocument()
    })

    // Fill out form
    const nameInput = screen.getByTestId('form-name-input')
    const emailInput = screen.getByTestId('form-email-input')

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })

    expect(nameInput).toHaveValue('John Doe')
    expect(emailInput).toHaveValue('john@example.com')

    // Submit form
    fireEvent.click(screen.getByTestId('form-submit'))

    // Modal should close and submit count should increase
    await waitFor(() => {
      expect(screen.queryByText('User Information')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('submit-count')).toHaveTextContent('Submit count: 1')
  })

  it('manages focus and keyboard navigation across modal interactions', async () => {
    render(<ModalTestComponent />)

    // Open modal - focus the button first to establish proper previous focus
    const openButton = screen.getByTestId('open-confirm-modal')
    openButton.focus()
    fireEvent.click(openButton)
    await waitFor(() => {
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })

    // ESC key should close modal
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    await waitFor(() => {
      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
    })

    // Focus should return to trigger button
    await waitFor(() => {
      expect(screen.getByTestId('open-confirm-modal')).toHaveFocus()
    })
  })

  it('handles modal stacking and z-index management', async () => {
    const NestedModalComponent = () => {
      const modal1 = useModal()
      const modal2 = useModal()

      return (
        <div>
          <Button onClick={modal1.open} data-testid="open-modal1">
            Open Modal 1
          </Button>

          <Modal open={modal1.isOpen} onClose={modal1.close}>
            <ModalHeader>
              <h2>Modal 1</h2>
            </ModalHeader>
            <ModalBody>
              <p>This is modal 1</p>
              <Button onClick={modal2.open} data-testid="open-modal2">
                Open Modal 2
              </Button>
            </ModalBody>
          </Modal>

          <Modal open={modal2.isOpen} onClose={modal2.close}>
            <ModalHeader>
              <h2>Modal 2</h2>
            </ModalHeader>
            <ModalBody>
              <p>This is modal 2 (nested)</p>
              <Button onClick={modal2.close} data-testid="close-modal2">
                Close Modal 2
              </Button>
            </ModalBody>
          </Modal>
        </div>
      )
    }

    render(<NestedModalComponent />)

    // Open first modal
    fireEvent.click(screen.getByTestId('open-modal1'))
    await waitFor(() => {
      expect(screen.getByText('Modal 1')).toBeInTheDocument()
    })

    // Open second modal from within first modal
    fireEvent.click(screen.getByTestId('open-modal2'))
    await waitFor(() => {
      expect(screen.getByText('This is modal 2 (nested)')).toBeInTheDocument()
    })

    // Both modals should be present
    expect(screen.getByText('Modal 1')).toBeInTheDocument()
    expect(screen.getByText('This is modal 2 (nested)')).toBeInTheDocument()

    // Close second modal
    fireEvent.click(screen.getByTestId('close-modal2'))
    await waitFor(() => {
      expect(screen.queryByText('This is modal 2 (nested)')).not.toBeInTheDocument()
    })

    // First modal should still be open
    expect(screen.getByText('Modal 1')).toBeInTheDocument()
  })

  it('prevents body scroll when modal is open', async () => {
    render(<ModalTestComponent />)

    // Initially body should be scrollable
    expect(document.body.style.overflow).toBe('')

    // Open modal
    fireEvent.click(screen.getByTestId('open-confirm-modal'))
    await waitFor(() => {
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })

    // Body scroll should be disabled
    expect(document.body.style.overflow).toBe('hidden')

    // Close modal
    fireEvent.click(screen.getByTestId('confirm-cancel'))
    await waitFor(() => {
      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
    })

    // Body scroll should be restored
    expect(document.body.style.overflow).toBe('')
  })

  it('handles backdrop clicks correctly', async () => {
    render(<ModalTestComponent />)

    // Open modal
    fireEvent.click(screen.getByTestId('open-confirm-modal'))
    await waitFor(() => {
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })

    // Click on backdrop (modal overlay but not content)
    const modal = screen.getByRole('dialog')
    fireEvent.click(modal)

    // Modal should close on backdrop click
    await waitFor(() => {
      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
    })
  })

  it('maintains form state during modal interactions', async () => {
    render(<ModalTestComponent />)

    // Open form modal
    fireEvent.click(screen.getByTestId('open-form-modal'))
    await waitFor(() => {
      expect(screen.getByText('User Information')).toBeInTheDocument()
    })

    // Fill out form partially
    const nameInput = screen.getByTestId('form-name-input')
    fireEvent.change(nameInput, { target: { value: 'Partial Name' } })

    // Cancel and reopen modal
    fireEvent.click(screen.getByTestId('form-cancel'))
    await waitFor(() => {
      expect(screen.queryByText('User Information')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('open-form-modal'))
    await waitFor(() => {
      expect(screen.getByText('User Information')).toBeInTheDocument()
    })

    // Form state should be maintained
    const reopenedNameInput = screen.getByTestId('form-name-input')
    expect(reopenedNameInput).toHaveValue('Partial Name')
  })
})