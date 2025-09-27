import React from 'react'
import LoadingSpinner from './LoadingSpinner'

export interface FormProps {
  children: React.ReactNode
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  loading?: boolean
  title?: string
  description?: string
  className?: string
}

const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  loading = false,
  title,
  description,
  className = ''
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (onSubmit && !loading) {
      onSubmit(event)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-6 ${className}`}
      noValidate
    >
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-neutral-600">
              {description}
            </p>
          )}
        </div>
      )}

      <fieldset disabled={loading} className="space-y-6">
        {children}
      </fieldset>

      {loading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="medium" text="Processing..." />
        </div>
      )}
    </form>
  )
}

export default Form

export const FormSection: React.FC<{
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}> = ({ title, description, children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {title && (
      <div>
        <h3 className="text-lg font-medium text-neutral-900">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-neutral-600 mt-1">
            {description}
          </p>
        )}
      </div>
    )}
    <div className="space-y-4">
      {children}
    </div>
  </div>
)

export const FormActions: React.FC<{
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
    <div className={`flex gap-3 pt-6 border-t border-neutral-200 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  )
}