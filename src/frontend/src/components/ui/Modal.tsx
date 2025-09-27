import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: ModalSize
  children: React.ReactNode
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  size = 'medium',
  children,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    fullscreen: 'max-w-none w-full h-full m-0 rounded-none'
  }

  const modalClasses = [
    'relative bg-white rounded-lg shadow-xl',
    'transform transition-all duration-300 ease-out',
    'max-h-[90vh] overflow-hidden',
    sizeClasses[size],
    size !== 'fullscreen' ? 'm-4' : '',
    className
  ].filter(Boolean).join(' ')

  // Focus management
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement
      modalRef.current?.focus()
    } else {
      previousActiveElement.current?.focus()
    }
  }, [open])

  // Escape key handler
  useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, closeOnEscape, onClose])

  // Focus trap
  useEffect(() => {
    if (!open) return

    const modal = modalRef.current
    if (!modal) return

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [open])

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!open) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={modalClasses}
        tabIndex={-1}
        role="document"
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 id="modal-title" className="text-xl font-semibold text-neutral-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className={`${size === 'fullscreen' ? 'flex-1 overflow-auto' : 'max-h-[70vh] overflow-auto'}`}>
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default Modal

export const ModalHeader: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-neutral-200 ${className}`}>
    {children}
  </div>
)

export const ModalBody: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
)

export const ModalFooter: React.FC<{
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
}> = ({ children, align = 'right', className = '' }) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }

  return (
    <div className={`px-6 py-4 border-t border-neutral-200 flex gap-3 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  )
}