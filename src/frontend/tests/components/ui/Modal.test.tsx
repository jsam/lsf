import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../../../src/components/ui/Modal'

// Mock createPortal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom')
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children
  }
})

describe('Modal', () => {
  beforeEach(() => {
    // Reset body style before each test
    document.body.style.overflow = ''
  })

  afterEach(() => {
    // Clean up after each test
    document.body.style.overflow = ''
  })

  it('does not render when open is false', () => {
    const onClose = vi.fn()
    render(
      <Modal open={false} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )

    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('renders when open is true', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )

    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renders with title', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Modal')
  })

  it('renders close button when title is provided', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    const closeButton = screen.getByLabelText('Close modal')
    expect(closeButton).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    const closeButton = screen.getByLabelText('Close modal')
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )

    const backdrop = screen.getByRole('dialog')
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when content is clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )

    const content = screen.getByText('Modal content')
    fireEvent.click(content)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not call onClose when backdrop click is disabled', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} closeOnBackdropClick={false}>
        <div>Modal content</div>
      </Modal>
    )

    const backdrop = screen.getByRole('dialog')
    fireEvent.click(backdrop)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when Escape key is pressed and closeOnEscape is false', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} closeOnEscape={false}>
        <div>Modal content</div>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('applies medium size classes by default', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )

    const modal = screen.getByRole('document')
    expect(modal).toHaveClass('max-w-lg')
  })

  it('applies small size classes', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} size="small">
        <div>Modal content</div>
      </Modal>
    )

    const modal = screen.getByRole('document')
    expect(modal).toHaveClass('max-w-md')
  })

  it('applies large size classes', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} size="large">
        <div>Modal content</div>
      </Modal>
    )

    const modal = screen.getByRole('document')
    expect(modal).toHaveClass('max-w-2xl')
  })

  it('applies fullscreen size classes', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} size="fullscreen">
        <div>Modal content</div>
      </Modal>
    )

    const modal = screen.getByRole('document')
    expect(modal).toHaveClass('max-w-none', 'w-full', 'h-full', 'm-0', 'rounded-none')
  })

  it('applies custom className', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} className="custom-modal">
        <div>Modal content</div>
      </Modal>
    )

    const modal = screen.getByRole('document')
    expect(modal).toHaveClass('custom-modal')
  })

  it('locks body scroll when opened', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when closed', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal open={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )

    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <Modal open={false} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )

    expect(document.body.style.overflow).toBe('')
  })

  it('has proper accessibility attributes', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')

    const modal = screen.getByRole('document')
    expect(modal).toHaveAttribute('tabIndex', '-1')
  })
})

describe('ModalHeader', () => {
  it('renders children content', () => {
    render(
      <ModalHeader>
        <h2>Header Content</h2>
      </ModalHeader>
    )

    expect(screen.getByText('Header Content')).toBeInTheDocument()
  })

  it('applies default classes', () => {
    const { container } = render(
      <ModalHeader>
        <h2>Header Content</h2>
      </ModalHeader>
    )

    const header = container.firstChild as HTMLElement
    expect(header).toHaveClass('px-6', 'py-4', 'border-b', 'border-neutral-200')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ModalHeader className="custom-header">
        <h2>Header Content</h2>
      </ModalHeader>
    )

    const header = container.firstChild as HTMLElement
    expect(header).toHaveClass('custom-header')
  })
})

describe('ModalBody', () => {
  it('renders children content', () => {
    render(
      <ModalBody>
        <p>Body Content</p>
      </ModalBody>
    )

    expect(screen.getByText('Body Content')).toBeInTheDocument()
  })

  it('applies default classes', () => {
    const { container } = render(
      <ModalBody>
        <p>Body Content</p>
      </ModalBody>
    )

    const body = container.firstChild as HTMLElement
    expect(body).toHaveClass('px-6', 'py-4')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ModalBody className="custom-body">
        <p>Body Content</p>
      </ModalBody>
    )

    const body = container.firstChild as HTMLElement
    expect(body).toHaveClass('custom-body')
  })
})

describe('ModalFooter', () => {
  it('renders children content', () => {
    render(
      <ModalFooter>
        <button>Footer Button</button>
      </ModalFooter>
    )

    expect(screen.getByText('Footer Button')).toBeInTheDocument()
  })

  it('applies right alignment by default', () => {
    const { container } = render(
      <ModalFooter>
        <button>Footer Button</button>
      </ModalFooter>
    )

    const footer = container.firstChild as HTMLElement
    expect(footer).toHaveClass('justify-end')
  })

  it('applies left alignment', () => {
    const { container } = render(
      <ModalFooter align="left">
        <button>Footer Button</button>
      </ModalFooter>
    )

    const footer = container.firstChild as HTMLElement
    expect(footer).toHaveClass('justify-start')
  })

  it('applies center alignment', () => {
    const { container } = render(
      <ModalFooter align="center">
        <button>Footer Button</button>
      </ModalFooter>
    )

    const footer = container.firstChild as HTMLElement
    expect(footer).toHaveClass('justify-center')
  })

  it('applies default classes', () => {
    const { container } = render(
      <ModalFooter>
        <button>Footer Button</button>
      </ModalFooter>
    )

    const footer = container.firstChild as HTMLElement
    expect(footer).toHaveClass('px-6', 'py-4', 'border-t', 'border-neutral-200', 'flex', 'gap-3')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ModalFooter className="custom-footer">
        <button>Footer Button</button>
      </ModalFooter>
    )

    const footer = container.firstChild as HTMLElement
    expect(footer).toHaveClass('custom-footer')
  })
})